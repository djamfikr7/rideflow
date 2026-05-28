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

// Payment method enum
type PaymentMethod = 'cash' | 'card';

// ============================================
// Validation Schemas
// ============================================
const processPaymentSchema = z.object({
  rideId: z.string().uuid(),
  method: z.enum(['cash', 'card']).default('cash'),
});

const confirmPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.number().positive('Amount must be positive'),
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

    // Only rider can initiate payment
    if (ride.riderId !== req.user!.userId) {
      throw new ForbiddenError('Only the rider can pay for the ride');
    }

    if (ride.status !== 'COMPLETED') {
      throw new BadRequestError('Can only pay for completed rides');
    }

    // Check if already paid
    const existingPayment = ride.payments.find((p: any) =>
      p.status === 'SUCCEEDED' || p.status === 'PENDING_COLLECTION'
    );
    if (existingPayment) {
      throw new BadRequestError('Ride already has a payment');
    }

    const amount = ride.fareFinal || ride.fareEstimate || 0;
    if (amount <= 0) {
      throw new BadRequestError('Invalid fare amount');
    }

    if (data.method === 'cash') {
      // Cash on delivery: mark as pending collection
      const payment = await prisma.payment.create({
        data: {
          rideId: ride.id,
          userId: req.user!.userId,
          stripePaymentIntentId: null, // No Stripe for cash
          amount,
          currency: 'USD',
          status: 'PENDING' as any, // Will use PENDING for cash pending collection
        },
      });

      // Emit socket event
      if (io) {
        const event = {
          rideId: ride.id,
          paymentId: payment.id,
          method: 'cash',
          status: 'pending_collection',
          amount: payment.amount,
        };
        io.to(`rider-${ride.riderId}`).emit('payment-processed', event);
        if (ride.driverId) {
          io.to(`driver-${ride.driverId}`).emit('payment-processed', event);
        }
      }

      res.json({
        data: {
          paymentId: payment.id,
          rideId: payment.rideId,
          amount: payment.amount,
          currency: payment.currency,
          method: 'cash',
          status: 'pending_collection',
          createdAt: payment.createdAt,
        },
        message: 'Cash payment recorded. Awaiting driver confirmation.',
      });
    } else {
      // Card payment (placeholder for future)
      const payment = await prisma.payment.create({
        data: {
          rideId: ride.id,
          userId: req.user!.userId,
          stripePaymentIntentId: `pi_placeholder_${Date.now()}`,
          amount,
          currency: 'USD',
          status: 'PENDING',
        },
      });

      res.json({
        data: {
          paymentId: payment.id,
          rideId: payment.rideId,
          amount: payment.amount,
          currency: payment.currency,
          method: 'card',
          status: 'pending',
          createdAt: payment.createdAt,
        },
        message: 'Card payment initiated (placeholder - not yet implemented)',
      });
    }
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/payments/confirm — Driver confirms cash received
// ============================================
router.post('/confirm', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = confirmPaymentSchema.parse(req.body);

    const payment = await prisma.payment.findUnique({
      where: { id: data.paymentId },
      include: {
        ride: true,
      },
    }) as any;

    if (!payment) {
      throw new NotFoundError('Payment');
    }

    // Only the driver assigned to the ride can confirm cash
    if (!payment.ride.driverId) {
      throw new BadRequestError('No driver assigned to this ride');
    }

    if (payment.ride.driverId !== req.user!.userId) {
      throw new ForbiddenError('Only the assigned driver can confirm cash payment');
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestError('Payment is not in pending state');
    }

    // Verify amount matches
    if (Math.abs(payment.amount - data.amount) > 0.01) {
      throw new BadRequestError(`Amount mismatch. Expected ${payment.amount}, got ${data.amount}`);
    }

    // Mark payment as succeeded
    const updatedPayment = await prisma.payment.update({
      where: { id: data.paymentId },
      data: {
        status: 'SUCCEEDED',
      },
    });

    // Emit socket event
    if (io) {
      const event = {
        rideId: payment.rideId,
        paymentId: updatedPayment.id,
        method: 'cash',
        status: 'confirmed',
        amount: updatedPayment.amount,
      };
      io.to(`rider-${payment.ride.riderId}`).emit('payment-confirmed', event);
      io.to(`driver-${payment.ride.driverId}`).emit('payment-confirmed', event);
    }

    res.json({
      data: {
        paymentId: updatedPayment.id,
        rideId: updatedPayment.rideId,
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
        method: 'cash',
        status: 'confirmed',
        createdAt: updatedPayment.createdAt,
      },
      message: 'Cash payment confirmed by driver',
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
        status: payment.status === 'PENDING' ? 'pending_collection' : payment.status.toLowerCase(),
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

    if (payment.userId !== req.user!.userId && payment.ride.driverId !== req.user!.userId) {
      throw new ForbiddenError('Not authorized');
    }

    res.json({
      data: {
        id: payment.id,
        rideId: payment.rideId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status === 'PENDING' ? 'pending_collection' : payment.status.toLowerCase(),
        createdAt: payment.createdAt,
        ride: payment.ride,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
