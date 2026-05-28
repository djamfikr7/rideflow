import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { calculateFare, haversineDistance, estimateDuration } from '../utils/fare';
import { Server as SocketServer } from 'socket.io';

const router = Router();

// Socket.IO instance - will be set by gateway
let io: SocketServer;
export function setRideSocketIO(socketIO: SocketServer) {
  io = socketIO;
}

// ============================================
// Validation Schemas
// ============================================
const createRideSchema = z.object({
  pickupLat: z.number().min(-90).max(90),
  pickupLng: z.number().min(-180).max(180),
  pickupAddress: z.string().min(1, 'Pickup address is required'),
  destinationLat: z.number().min(-90).max(90),
  destinationLng: z.number().min(-180).max(180),
  destinationAddress: z.string().min(1, 'Destination address is required'),
  rideType: z.enum(['STANDARD', 'COMFORT', 'PREMIUM']).default('STANDARD'),
});

const updateStatusSchema = z.object({
  status: z.enum(['DRIVER_ARRIVING', 'IN_PROGRESS', 'COMPLETED']),
});

const cancelRideSchema = z.object({
  reason: z.string().optional(),
});

// ============================================
// POST /api/rides — Create ride request
// ============================================
router.post('/', authenticate, requireRole('RIDER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createRideSchema.parse(req.body);

    // Check if rider already has an active ride
    const activeRide = await prisma.ride.findFirst({
      where: {
        riderId: req.user!.userId,
        status: {
          in: ['REQUESTED', 'MATCHED', 'DRIVER_ARRIVING', 'IN_PROGRESS'],
        },
      },
    });

    if (activeRide) {
      throw new BadRequestError('You already have an active ride');
    }

    // Calculate fare estimate
    const distance = haversineDistance(
      data.pickupLat, data.pickupLng,
      data.destinationLat, data.destinationLng
    );
    const duration = estimateDuration(distance);
    const fareEstimate = calculateFare(distance, duration, data.rideType);

    // Create ride
    const ride = await prisma.ride.create({
      data: {
        riderId: req.user!.userId,
        pickupLat: data.pickupLat,
        pickupLng: data.pickupLng,
        pickupAddress: data.pickupAddress,
        destinationLat: data.destinationLat,
        destinationLng: data.destinationLng,
        destinationAddress: data.destinationAddress,
        rideType: data.rideType,
        fareEstimate: fareEstimate.price,
        distanceKm: distance,
        durationMinutes: duration,
        status: 'REQUESTED',
      },
    });

    // Emit socket event for matching service
    if (io) {
      io.emit('ride-requested', {
        rideId: ride.id,
        riderId: ride.riderId,
        pickup: {
          lat: ride.pickupLat,
          lng: ride.pickupLng,
          address: ride.pickupAddress,
        },
        destination: {
          lat: ride.destinationLat,
          lng: ride.destinationLng,
          address: ride.destinationAddress,
        },
        rideType: ride.rideType,
        fareEstimate: ride.fareEstimate,
      });
    }

    res.status(201).json({
      data: {
        id: ride.id,
        riderId: ride.riderId,
        driverId: ride.driverId,
        status: ride.status,
        pickup: {
          lat: ride.pickupLat,
          lng: ride.pickupLng,
          address: ride.pickupAddress,
        },
        destination: {
          lat: ride.destinationLat,
          lng: ride.destinationLng,
          address: ride.destinationAddress,
        },
        rideType: ride.rideType,
        fareEstimate: ride.fareEstimate,
        distanceKm: ride.distanceKm,
        durationMinutes: ride.durationMinutes,
        requestedAt: ride.requestedAt,
      },
      message: 'Ride requested successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET /api/rides/:id — Get ride details
// ============================================
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ride = await prisma.ride.findUnique({
      where: { id: req.params.id as string },
      include: {
        rider: {
          select: { id: true, fullName: true, phone: true, avatarUrl: true },
        },
        driver: {
          select: { id: true, fullName: true, phone: true, avatarUrl: true },
        },
        ratings: true,
      },
    }) as any; // Type assertion to handle Prisma include inference

    if (!ride) {
      throw new NotFoundError('Ride');
    }

    // Verify user is part of this ride
    if (ride.riderId !== req.user!.userId && ride.driverId !== req.user!.userId) {
      throw new ForbiddenError('Not authorized to view this ride');
    }

    // Get driver profile if driver is assigned
    let driverInfo = null;
    if (ride.driverId) {
      const driverProfile = await prisma.driverProfile.findUnique({
        where: { userId: ride.driverId },
      });
      if (driverProfile && ride.driver) {
        driverInfo = {
          id: ride.driver.id,
          fullName: ride.driver.fullName,
          avatarUrl: ride.driver.avatarUrl,
          rating: driverProfile.rating,
          totalRides: driverProfile.totalRides,
          vehicleMake: driverProfile.vehicleMake,
          vehicleModel: driverProfile.vehicleModel,
          vehicleColor: driverProfile.vehicleColor,
          licensePlate: driverProfile.licensePlate,
          currentLat: driverProfile.currentLat,
          currentLng: driverProfile.currentLng,
        };
      }
    }

    res.json({
      data: {
        id: ride.id,
        riderId: ride.riderId,
        driverId: ride.driverId,
        status: ride.status,
        pickup: {
          lat: ride.pickupLat,
          lng: ride.pickupLng,
          address: ride.pickupAddress,
        },
        destination: {
          lat: ride.destinationLat,
          lng: ride.destinationLng,
          address: ride.destinationAddress,
        },
        rideType: ride.rideType,
        fareEstimate: ride.fareEstimate,
        fareFinal: ride.fareFinal,
        distanceKm: ride.distanceKm,
        durationMinutes: ride.durationMinutes,
        requestedAt: ride.requestedAt,
        matchedAt: ride.matchedAt,
        startedAt: ride.startedAt,
        completedAt: ride.completedAt,
        cancelledAt: ride.cancelledAt,
        cancellationReason: ride.cancellationReason,
        driver: driverInfo,
        ratings: ride.ratings,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/rides/:id/status — Update ride status
// ============================================
router.put('/:id/status', authenticate, requireRole('DRIVER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateStatusSchema.parse(req.body);

    const ride = await prisma.ride.findUnique({
      where: { id: req.params.id as string },
    });

    if (!ride) {
      throw new NotFoundError('Ride');
    }

    if (ride.driverId !== req.user!.userId) {
      throw new ForbiddenError('Not authorized to update this ride');
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      MATCHED: ['DRIVER_ARRIVING'],
      DRIVER_ARRIVING: ['IN_PROGRESS'],
      IN_PROGRESS: ['COMPLETED'],
    };

    if (!validTransitions[ride.status]?.includes(data.status)) {
      throw new BadRequestError(`Cannot transition from ${ride.status} to ${data.status}`);
    }

    // Build update data
    const updateData: any = { status: data.status };
    if (data.status === 'IN_PROGRESS') {
      updateData.startedAt = new Date();
    } else if (data.status === 'COMPLETED') {
      updateData.completedAt = new Date();
      // Set final fare (same as estimate for now)
      updateData.fareFinal = ride.fareEstimate;
    }

    const updatedRide = await prisma.ride.update({
      where: { id: req.params.id as string },
      data: updateData,
    });

    // Emit socket event
    if (io) {
      io.emit('ride-status-update', {
        rideId: updatedRide.id,
        status: updatedRide.status,
        riderId: updatedRide.riderId,
        driverId: updatedRide.driverId,
      });
    }

    res.json({
      data: {
        id: updatedRide.id,
        status: updatedRide.status,
        startedAt: updatedRide.startedAt,
        completedAt: updatedRide.completedAt,
        fareFinal: updatedRide.fareFinal,
      },
      message: `Ride status updated to ${data.status}`,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET /api/rides/history — Get ride history
// ============================================
router.get('/history/list', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageParam = req.query.page;
    const limitParam = req.query.limit;
    const page = parseInt(typeof pageParam === 'string' ? pageParam : '1', 10);
    const limit = parseInt(typeof limitParam === 'string' ? limitParam : '10', 10);
    const skip = (page - 1) * limit;

    const where = req.user!.role === 'DRIVER'
      ? { driverId: req.user!.userId }
      : { riderId: req.user!.userId };

    const [rides, total] = await Promise.all([
      prisma.ride.findMany({
        where,
        include: {
          rider: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          driver: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.ride.count({ where }),
    ]);

    res.json({
      data: rides.map((ride: any) => ({
        id: ride.id,
        riderId: ride.riderId,
        driverId: ride.driverId,
        status: ride.status,
        pickup: {
          lat: ride.pickupLat,
          lng: ride.pickupLng,
          address: ride.pickupAddress,
        },
        destination: {
          lat: ride.destinationLat,
          lng: ride.destinationLng,
          address: ride.destinationAddress,
        },
        rideType: ride.rideType,
        fareEstimate: ride.fareEstimate,
        fareFinal: ride.fareFinal,
        distanceKm: ride.distanceKm,
        durationMinutes: ride.durationMinutes,
        requestedAt: ride.requestedAt,
        completedAt: ride.completedAt,
        rider: ride.rider,
        driver: ride.driver,
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
// POST /api/rides/:id/cancel — Cancel ride
// ============================================
router.post('/:id/cancel', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = cancelRideSchema.parse(req.body);

    const ride = await prisma.ride.findUnique({
      where: { id: req.params.id as string },
    });

    if (!ride) {
      throw new NotFoundError('Ride');
    }

    // Only rider or driver can cancel
    if (ride.riderId !== req.user!.userId && ride.driverId !== req.user!.userId) {
      throw new ForbiddenError('Not authorized to cancel this ride');
    }

    // Can only cancel if not completed or already cancelled
    if (['COMPLETED', 'CANCELLED'].includes(ride.status)) {
      throw new BadRequestError(`Cannot cancel a ride with status ${ride.status}`);
    }

    const updatedRide = await prisma.ride.update({
      where: { id: req.params.id as string },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: data.reason || 'Cancelled by user',
      },
    });

    // Emit socket event
    if (io) {
      io.emit('ride-status-update', {
        rideId: updatedRide.id,
        status: 'CANCELLED',
        riderId: updatedRide.riderId,
        driverId: updatedRide.driverId,
      });
    }

    res.json({
      data: {
        id: updatedRide.id,
        status: updatedRide.status,
        cancelledAt: updatedRide.cancelledAt,
        cancellationReason: updatedRide.cancellationReason,
      },
      message: 'Ride cancelled',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/rides/:id/rate — Rate a ride
// ============================================
router.post('/:id/rate', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { score, comment } = z.object({
      score: z.number().int().min(1).max(5),
      comment: z.string().optional(),
    }).parse(req.body);

    const ride = await prisma.ride.findUnique({
      where: { id: req.params.id as string },
    });

    if (!ride) {
      throw new NotFoundError('Ride');
    }

    if (ride.status !== 'COMPLETED') {
      throw new BadRequestError('Can only rate completed rides');
    }

    // Determine who is being rated
    const isRider = ride.riderId === req.user!.userId;
    const isDriver = ride.driverId === req.user!.userId;

    if (!isRider && !isDriver) {
      throw new ForbiddenError('Not authorized to rate this ride');
    }

    const fromUserId = req.user!.userId;
    const toUserId = isRider ? ride.driverId! : ride.riderId;

    // Check if already rated
    const existingRating = await prisma.rating.findFirst({
      where: {
        rideId: ride.id,
        fromUserId,
      },
    });

    if (existingRating) {
      throw new BadRequestError('You have already rated this ride');
    }

    const rating = await prisma.rating.create({
      data: {
        rideId: ride.id,
        fromUserId,
        toUserId,
        score,
        comment,
      },
    });

    // Update driver rating if driver was rated
    if (isRider && ride.driverId) {
      const driverRatings = await prisma.rating.findMany({
        where: { toUserId: ride.driverId },
      });
      const avgRating = driverRatings.reduce((sum: number, r: any) => sum + r.score, 0) / driverRatings.length;

      await prisma.driverProfile.update({
        where: { userId: ride.driverId },
        data: { rating: Math.round(avgRating * 100) / 100 },
      });
    }

    res.status(201).json({
      data: rating,
      message: 'Rating submitted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
