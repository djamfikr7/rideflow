import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'rideflow-dev-secret-change-in-production';

export function setupSocketIO(io: SocketServer): void {
  // Authentication middleware for Socket.IO
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token || typeof token !== 'string') {
        return next(new Error('Authentication required'));
      }

      const payload = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };

      // Attach user data to socket
      (socket as any).userId = payload.userId;
      (socket as any).role = payload.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    const role = (socket as any).role;

    console.log(`[Socket.IO] User connected: ${userId} (${role})`);

    // Join user-specific room
    socket.join(`user-${userId}`);
    socket.join(`${role}-${userId}`);

    // ============================================
    // Handle driver going online/offline
    // ============================================
    socket.on('driver-online', async (data: { lat: number; lng: number }) => {
      if (role !== 'DRIVER') return;

      try {
        await prisma.driverProfile.update({
          where: { userId },
          data: {
            isAvailable: true,
            currentLat: data.lat,
            currentLng: data.lng,
          },
        });

        socket.join('available-drivers');
        console.log(`[Socket.IO] Driver ${userId} is now online`);
      } catch (err) {
        console.error(`[Socket.IO] Error setting driver online:`, err);
      }
    });

    socket.on('driver-offline', async () => {
      if (role !== 'DRIVER') return;

      try {
        await prisma.driverProfile.update({
          where: { userId },
          data: { isAvailable: false },
        });

        socket.leave('available-drivers');
        console.log(`[Socket.IO] Driver ${userId} is now offline`);
      } catch (err) {
        console.error(`[Socket.IO] Error setting driver offline:`, err);
      }
    });

    // ============================================
    // Handle driver location updates
    // ============================================
    socket.on('update-location', async (data: { lat: number; lng: number }) => {
      if (role !== 'DRIVER') return;

      try {
        await prisma.driverProfile.update({
          where: { userId },
          data: {
            currentLat: data.lat,
            currentLng: data.lng,
          },
        });

        // Find active ride for this driver
        const activeRide = await prisma.ride.findFirst({
          where: {
            driverId: userId,
            status: { in: ['MATCHED', 'DRIVER_ARRIVING', 'IN_PROGRESS'] },
          },
        });

        if (activeRide) {
          // Notify rider of driver location
          io.to(`rider-${activeRide.riderId}`).emit('driver-location', {
            rideId: activeRide.id,
            driverId: userId,
            lat: data.lat,
            lng: data.lng,
          });
        }
      } catch (err) {
        console.error(`[Socket.IO] Error updating location:`, err);
      }
    });

    // ============================================
    // Handle rider joining ride room
    // ============================================
    socket.on('join-ride', (data: { rideId: string }) => {
      socket.join(`ride-${data.rideId}`);
      console.log(`[Socket.IO] User ${userId} joined ride room: ${data.rideId}`);
    });

    socket.on('leave-ride', (data: { rideId: string }) => {
      socket.leave(`ride-${data.rideId}`);
      console.log(`[Socket.IO] User ${userId} left ride room: ${data.rideId}`);
    });

    // ============================================
    // Handle chat messages (future feature)
    // ============================================
    socket.on('send-message', (data: { rideId: string; message: string }) => {
      io.to(`ride-${data.rideId}`).emit('new-message', {
        rideId: data.rideId,
        userId,
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    });

    // ============================================
    // Handle disconnection
    // ============================================
    socket.on('disconnect', async () => {
      console.log(`[Socket.IO] User disconnected: ${userId} (${role})`);

      // If driver, mark as offline
      if (role === 'DRIVER') {
        try {
          await prisma.driverProfile.update({
            where: { userId },
            data: { isAvailable: false },
          });
        } catch (err) {
          // Ignore errors on disconnect
        }
      }
    });
  });

  console.log('[Socket.IO] Notification service initialized');
}

// Helper to emit events from other services
export function emitToUser(io: SocketServer, userId: string, event: string, data: any): void {
  io.to(`user-${userId}`).emit(event, data);
}

export function emitToRide(io: SocketServer, rideId: string, event: string, data: any): void {
  io.to(`ride-${rideId}`).emit(event, data);
}
