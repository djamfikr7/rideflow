import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, requireRole('ADMIN'));

// ============================================
// GET /api/admin/stats — Dashboard statistics
// ============================================
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalRides, ridersCount, driversCount, activeDrivers, revenueResult] =
      await Promise.all([
        prisma.user.count(),
        prisma.ride.count(),
        prisma.user.count({ where: { role: 'RIDER' } }),
        prisma.user.count({ where: { role: 'DRIVER' } }),
        prisma.driverProfile.count({ where: { isAvailable: true } }),
        prisma.payment.aggregate({
          where: { status: 'SUCCEEDED' },
          _sum: { amount: true },
        }),
      ]);

    res.json({
      data: {
        totalUsers,
        totalRides,
        totalRevenue: revenueResult._sum.amount ?? 0,
        activeDrivers,
        ridersCount,
        driversCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET /api/admin/users — List all users
// ============================================
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageParam = req.query.page;
    const limitParam = req.query.limit;
    const page = parseInt(typeof pageParam === 'string' ? pageParam : '1', 10);
    const limit = parseInt(typeof limitParam === 'string' ? limitParam : '50', 10);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    res.json({
      data: users.map((user: any) => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
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
// GET /api/admin/rides — List all rides
// ============================================
router.get('/rides', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageParam = req.query.page;
    const limitParam = req.query.limit;
    const page = parseInt(typeof pageParam === 'string' ? pageParam : '1', 10);
    const limit = parseInt(typeof limitParam === 'string' ? limitParam : '50', 10);
    const skip = (page - 1) * limit;

    const [rides, total] = await Promise.all([
      prisma.ride.findMany({
        include: {
          rider: {
            select: { id: true, fullName: true, phone: true },
          },
          driver: {
            select: { id: true, fullName: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.ride.count(),
    ]);

    res.json({
      data: rides.map((ride: any) => ({
        id: ride.id,
        status: ride.status,
        fareEstimate: ride.fareEstimate,
        fareFinal: ride.fareFinal,
        pickupAddress: ride.pickupAddress,
        destinationAddress: ride.destinationAddress,
        rideType: ride.rideType,
        distanceKm: ride.distanceKm,
        durationMinutes: ride.durationMinutes,
        rider: ride.rider,
        driver: ride.driver,
        requestedAt: ride.requestedAt,
        completedAt: ride.completedAt,
        cancelledAt: ride.cancelledAt,
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
// GET /api/admin/payments — List all payments
// ============================================
router.get('/payments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageParam = req.query.page;
    const limitParam = req.query.limit;
    const page = parseInt(typeof pageParam === 'string' ? pageParam : '1', 10);
    const limit = parseInt(typeof limitParam === 'string' ? limitParam : '50', 10);
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        include: {
          user: {
            select: { fullName: true, email: true },
          },
          ride: {
            select: { pickupAddress: true, destinationAddress: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count(),
    ]);

    res.json({
      data: payments.map((payment: any) => ({
        id: payment.id,
        rideId: payment.rideId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status === 'PENDING' ? 'PENDING' : payment.status,
        createdAt: payment.createdAt,
        user: payment.user,
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

export default router;
