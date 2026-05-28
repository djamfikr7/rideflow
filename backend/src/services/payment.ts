import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { Server as SocketServer } from 'socket.io';

const router = Router();

// Socket.IO instance - will be set by gateway
let io: SocketServer;
export function setPaymentSocketIO(socketIO: SocketServer) {
  io = socketIO;
}

// Simulated Stripe payment processing
async function simulateStripePayment(amount: number, currency: string): Promise<{
  success: boolean;
  paymentIntentId: string;
  error?: string;
}> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simulate 95% success rate
  const success = Math.random() > 0.05;

  return {
    success,
    paymentIntentId: `pi_simulated_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    error: success ? undefined : 'Payment declined (simulated)',
  };
}

// ============================================
// Validation Schemas
// ============================================
const processPaymentSchema = z.object({
  rideId: z.string().uuid(),
  paymentMethod: z.enum(['card', 'cash', 'wallet']).default('card'),
});

// ============================================
// POST /api/payments/process — Process payment
// ============================================
router.post('/process', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = processPaymentSchema.parse(req.body);

    const ride = await prisma.ride.findUnique({
      where: { id: data.rideId },
      include: { payments: true },
    }) as any;

    if (!ride) {
      throw new NotFoundError('Ride');
    }

    // Only rider can pay
    if (ride.riderId !== req.user!.userId) {
      throw new ForbiddenError('Only the rider can pay for the ride');
    }

    if (ride.status !== 'COMPLETED') {
      throw new BadRequestError('Can only pay for completed rides');
    }

    // Check if already paid
    const existingPayment = ride.payments.find((p: any) => p.status === 'SUCCEEDED');
    if (existingPayment) {
      throw new BadRequestError('Ride has already been paid');
    }

    const amount = ride.fareFinal || ride.fareEstimate || 0;
    if (amount <= 0) {
      throw new BadRequestError('Invalid fare amount');
    }

    // Process payment (simulated)
    const result = await simulateStripePayment(amount, 'USD');

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        rideId: ride.id,
        userId: req.user!.userId,
        stripePaymentIntentId: result.paymentIntentId,
        amount,
        currency: 'USD',
        status: result.success ? 'SUCCEEDED' : 'FAILED',
      },
    });

    // Emit socket event
    if (io) {
      io.to(`rider-${ride.riderId}`).emit('payment-processed', {
        rideId: ride.id,
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
      });

      if (ride.driverId) {
        io.to(`driver-${ride.driverId}`).emit('payment-processed', {
          rideId: ride.id,
          paymentId: payment.id,
          status: payment.status,
          amount: payment.amount,
        });
      }
    }

    if (!result.success) {
      res.status(402).json({
        error: {
          message: 'Payment failed',
          status: 402,
          details: result.error,
        },
      });
      return;
    }

    res.json({
      data: {
        paymentId: payment.id,
        rideId: payment.rideId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentIntentId: payment.stripePaymentIntentId,
        createdAt: payment.createdAt,
      },
      message: 'Payment processed successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET /api/payments/history — Payment history
// ============================================
router.get('/history', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageParam = req.query.page;
    const limitParam = req.query.limit;
    const page = parseInt(typeof pageParam === 'string' ? pageParam : '1', 10);
    const limit = parseInt(typeof limitParam === 'string' ? limitParam : '10', 10);
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId: req.user!.userId },
        include: {
          ride: {
            select: {
              id: true,
              pickupAddress: true,
              destinationAddress: true,
              completedAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({
        where: { userId: req.user!.userId },
      }),
    ]);

    res.json({
      data: payments.map((payment: any) => ({
        id: payment.id,
        rideId: payment.rideId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentIntentId: payment.stripePaymentIntentId,
        createdAt: payment.createdAt,
        ride: payment.ride,
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET /api/payments/:id — Get payment details
// ============================================
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id as string },
      include: {
        ride: {
          select: {
            id: true,
            pickupAddress: true,
            destinationAddress: true,
            fareEstimate: true,
            fareFinal: true,
            completedAt: true,
          },
        },
      },
    }) as any;

    if (!payment) {
      throw new NotFoundError('Payment');
    }

    if (payment.userId !== req.user!.userId) {
      throw new ForbiddenError('Not authorized');
    }

    res.json({
      data: {
        id: payment.id,
        rideId: payment.rideId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentIntentId: payment.stripePaymentIntentId,
        createdAt: payment.createdAt,
        ride: payment.ride,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
