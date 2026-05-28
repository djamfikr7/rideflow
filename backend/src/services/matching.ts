import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { haversineDistance } from '../utils/fare';
import { Server as SocketServer } from 'socket.io';

const router = Router();

// Socket.IO instance - will be set by gateway
let io: SocketServer;
export function setMatchingSocketIO(socketIO: SocketServer) {
  io = socketIO;
}

// ============================================
// Validation Schemas
// ============================================
const findDriverSchema = z.object({
  rideId: z.string().uuid(),
  maxRadiusKm: z.number().positive().default(10),
});

const acceptRideSchema = z.object({
  rideId: z.string().uuid(),
});

const rejectRideSchema = z.object({
  rideId: z.string().uuid(),
  reason: z.string().optional(),
});

const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// ============================================
// POST /api/matching/find-driver — Find nearby drivers
// ============================================
router.post('/find-driver', authenticate, requireRole('RIDER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = findDriverSchema.parse(req.body);

    // Get the ride
    const ride = await prisma.ride.findUnique({
      where: { id: data.rideId },
    });

    if (!ride) {
      throw new NotFoundError('Ride');
    }

    if (ride.riderId !== req.user!.userId) {
      throw new ForbiddenError('Not authorized');
    }

    if (ride.status !== 'REQUESTED') {
      throw new BadRequestError('Ride is not in REQUESTED status');
    }

    // Find available drivers within radius
    const drivers = await prisma.driverProfile.findMany({
      where: {
        isAvailable: true,
        currentLat: { not: null },
        currentLng: { not: null },
      },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });

    // Filter by distance and sort by rating + distance
    const nearbyDrivers = (drivers as any[])
      .map((driver: any) => {
        const distance = haversineDistance(
          ride.pickupLat, ride.pickupLng,
          driver.currentLat!, driver.currentLng!
        );
        return {
          ...driver,
          distanceKm: distance,
        };
      })
      .filter((driver: any) => driver.distanceKm <= data.maxRadiusKm)
      .sort((a: any, b: any) => {
        // Sort by composite score: higher rating + lower distance = better
        const scoreA = a.rating * 2 - a.distanceKm;
        const scoreB = b.rating * 2 - b.distanceKm;
        return scoreB - scoreA;
      })
      .slice(0, 5); // Return top 5 drivers

    // Emit socket event to notify drivers
    if (io && nearbyDrivers.length > 0) {
      for (const driver of nearbyDrivers) {
        io.to(`driver-${driver.userId}`).emit('ride-request-available', {
          rideId: ride.id,
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
          fareEstimate: ride.fareEstimate,
          distanceKm: driver.distanceKm,
        });
      }
    }

    res.json({
      data: {
        drivers: nearbyDrivers.map((driver: any) => ({
          id: driver.user.id,
          fullName: driver.user.fullName,
          avatarUrl: driver.user.avatarUrl,
          rating: driver.rating,
          totalRides: driver.totalRides,
          vehicleMake: driver.vehicleMake,
          vehicleModel: driver.vehicleModel,
          vehicleColor: driver.vehicleColor,
          licensePlate: driver.licensePlate,
          currentLat: driver.currentLat,
          currentLng: driver.currentLng,
          distanceKm: Math.round(driver.distanceKm * 100) / 100,
        })),
        count: nearbyDrivers.length,
      },
      message: `Found ${nearbyDrivers.length} nearby drivers`,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/matching/accept — Driver accepts ride
// ============================================
router.post('/accept', authenticate, requireRole('DRIVER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = acceptRideSchema.parse(req.body);

    const ride = await prisma.ride.findUnique({
      where: { id: data.rideId },
    });

    if (!ride) {
      throw new NotFoundError('Ride');
    }

    if (ride.status !== 'REQUESTED') {
      throw new BadRequestError('Ride is no longer available');
    }

    // Check driver is available
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: req.user!.userId },
      include: {
        user: {
          select: { id: true, fullName: true },
        },
      },
    }) as any;

    if (!driverProfile || !driverProfile.isAvailable) {
      throw new BadRequestError('Driver is not available');
    }

    // Match driver to ride
    const updatedRide = await prisma.ride.update({
      where: { id: data.rideId },
      data: {
        driverId: req.user!.userId,
        status: 'MATCHED',
        matchedAt: new Date(),
      },
    });

    // Set driver as unavailable
    await prisma.driverProfile.update({
      where: { userId: req.user!.userId },
      data: { isAvailable: false },
    });

    // Emit socket events
    if (io) {
      // Notify rider
      io.to(`rider-${updatedRide.riderId}`).emit('driver-matched', {
        rideId: updatedRide.id,
        driver: {
          id: req.user!.userId,
          fullName: driverProfile.user.fullName,
          rating: driverProfile.rating,
          totalRides: driverProfile.totalRides,
          vehicleMake: driverProfile.vehicleMake,
          vehicleModel: driverProfile.vehicleModel,
          vehicleColor: driverProfile.vehicleColor,
          licensePlate: driverProfile.licensePlate,
          currentLat: driverProfile.currentLat,
          currentLng: driverProfile.currentLng,
        },
      });

      // Notify other drivers that ride is taken
      io.emit('ride-taken', { rideId: updatedRide.id });
    }

    res.json({
      data: {
        id: updatedRide.id,
        status: updatedRide.status,
        matchedAt: updatedRide.matchedAt,
        driverId: updatedRide.driverId,
      },
      message: 'Ride accepted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/matching/reject — Driver rejects ride
// ============================================
router.post('/reject', authenticate, requireRole('DRIVER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = rejectRideSchema.parse(req.body);

    // Just log the rejection - the ride remains in REQUESTED status
    // The matching service will continue looking for other drivers
    res.json({
      data: {
        rideId: data.rideId,
        driverId: req.user!.userId,
        rejected: true,
      },
      message: 'Ride rejected',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/matching/driver-location — Update driver location
// ============================================
router.put('/driver-location', authenticate, requireRole('DRIVER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateLocationSchema.parse(req.body);

    await prisma.driverProfile.update({
      where: { userId: req.user!.userId },
      data: {
        currentLat: data.lat,
        currentLng: data.lng,
      },
    });

    // Emit location update for any active rides
    const activeRide = await prisma.ride.findFirst({
      where: {
        driverId: req.user!.userId,
        status: {
          in: ['MATCHED', 'DRIVER_ARRIVING', 'IN_PROGRESS'],
        },
      },
    });

    if (activeRide && io) {
      io.to(`rider-${activeRide.riderId}`).emit('driver-location', {
        rideId: activeRide.id,
        driverId: req.user!.userId,
        lat: data.lat,
        lng: data.lng,
      });
    }

    res.json({
      data: { lat: data.lat, lng: data.lng },
      message: 'Location updated',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/matching/driver-availability — Toggle driver availability
// ============================================
router.put('/driver-availability', authenticate, requireRole('DRIVER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isAvailable } = z.object({
      isAvailable: z.boolean(),
    }).parse(req.body);

    const profile = await prisma.driverProfile.update({
      where: { userId: req.user!.userId },
      data: { isAvailable },
    });

    res.json({
      data: { isAvailable: profile.isAvailable },
      message: `Driver is now ${isAvailable ? 'available' : 'unavailable'}`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
