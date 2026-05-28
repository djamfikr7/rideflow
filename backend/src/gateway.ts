import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { errorHandler } from './middleware/errorHandler';
import { setupSocketIO } from './services/notification';

// Import service routers
import authRouter from './services/auth';
import rideRouter, { setRideSocketIO } from './services/ride';
import matchingRouter, { setMatchingSocketIO } from './services/matching';
import paymentRouter, { setPaymentSocketIO } from './services/payment';

// ============================================
// Configuration
// ============================================
const PORT = parseInt(process.env.PORT || '3010', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:8000',
  'http://localhost:19006',
];

// ============================================
// Express App Setup
// ============================================
const app = express();
const httpServer = createServer(app);

// ============================================
// Socket.IO Setup
// ============================================
const io = new SocketServer(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Pass Socket.IO to services
setRideSocketIO(io);
setMatchingSocketIO(io);
setPaymentSocketIO(io);
setupSocketIO(io);

// ============================================
// Middleware
// ============================================
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// Health Check
// ============================================
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'rideflow-api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    services: {
      auth: 'http://localhost:3001',
      ride: 'http://localhost:3002',
      matching: 'http://localhost:3003',
      payment: 'http://localhost:3004',
      notification: 'ws://localhost:3005',
    },
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// API Routes
// ============================================
app.use('/api/auth', authRouter);
app.use('/api/rides', rideRouter);
app.use('/api/matching', matchingRouter);
app.use('/api/payments', paymentRouter);

// ============================================
// Fare Estimate Endpoint (no auth required)
// ============================================
app.post('/api/fare-estimate', (req, res, next) => {
  try {
    const { calculateFare, haversineDistance, estimateDuration } = require('./utils/fare');
    const { pickupLat, pickupLng, destinationLat, destinationLng } = req.body;

    if (!pickupLat || !pickupLng || !destinationLat || !destinationLng) {
      return res.status(400).json({
        error: { message: 'Missing coordinates', status: 400 },
      });
    }

    const distance = haversineDistance(pickupLat, pickupLng, destinationLat, destinationLng);
    const duration = estimateDuration(distance);

    const estimates = [
      calculateFare(distance, duration, 'STANDARD'),
      calculateFare(distance, duration, 'COMFORT'),
      calculateFare(distance, duration, 'PREMIUM'),
    ];

    res.json({ data: estimates });
  } catch (error) {
    next(error);
  }
});

// ============================================
// 404 Handler
// ============================================
app.use((_req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
    },
  });
});

// ============================================
// Error Handler
// ============================================
app.use(errorHandler);

// ============================================
// Start Server
// ============================================
httpServer.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                  RideFlow API Gateway                    ║
╠══════════════════════════════════════════════════════════╣
║  HTTP Server:     http://localhost:${PORT}                  ║
║  Socket.IO:       ws://localhost:${PORT}                    ║
║  Health Check:    http://localhost:${PORT}/health            ║
╠══════════════════════════════════════════════════════════╣
║  Services:                                               ║
║  - Auth:          /api/auth/*                            ║
║  - Rides:         /api/rides/*                           ║
║  - Matching:      /api/matching/*                        ║
║  - Payments:      /api/payments/*                        ║
║  - Fare Estimate: /api/fare-estimate                     ║
╠══════════════════════════════════════════════════════════╣
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(40)}║
║  CORS Origins: ${CORS_ORIGIN.length} configured                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down...');
  httpServer.close(() => {
    process.exit(0);
  });
});

export { app, httpServer, io };
