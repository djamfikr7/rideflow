import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.rating.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.ride.deleteMany();
  await prisma.driverProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // Create riders
  const riderPassword = await bcrypt.hash('password123', 10);

  const rider1 = await prisma.user.create({
    data: {
      email: 'rider@example.com',
      password: riderPassword,
      fullName: 'Alice Johnson',
      phone: '+1234567890',
      role: 'RIDER',
    },
  });

  const rider2 = await prisma.user.create({
    data: {
      email: 'rider2@example.com',
      password: riderPassword,
      fullName: 'Bob Smith',
      phone: '+1234567891',
      role: 'RIDER',
    },
  });

  console.log('Created riders');

  // Create drivers
  const driverPassword = await bcrypt.hash('password123', 10);

  const driver1 = await prisma.user.create({
    data: {
      email: 'driver@example.com',
      password: driverPassword,
      fullName: 'Charlie Brown',
      phone: '+1987654321',
      role: 'DRIVER',
      driverProfile: {
        create: {
          vehicleMake: 'Toyota',
          vehicleModel: 'Camry',
          vehicleYear: 2023,
          vehicleColor: 'Silver',
          licensePlate: 'ABC-1234',
          vehicleType: 'STANDARD',
          isAvailable: true,
          currentLat: 40.7128,
          currentLng: -74.0060,
          rating: 4.85,
          totalRides: 150,
        },
      },
    },
    include: { driverProfile: true },
  });

  const driver2 = await prisma.user.create({
    data: {
      email: 'driver2@example.com',
      password: driverPassword,
      fullName: 'Diana Prince',
      phone: '+1987654322',
      role: 'DRIVER',
      driverProfile: {
        create: {
          vehicleMake: 'Honda',
          vehicleModel: 'Accord',
          vehicleYear: 2024,
          vehicleColor: 'Black',
          licensePlate: 'XYZ-5678',
          vehicleType: 'COMFORT',
          isAvailable: true,
          currentLat: 40.7148,
          currentLng: -74.0080,
          rating: 4.92,
          totalRides: 320,
        },
      },
    },
    include: { driverProfile: true },
  });

  const driver3 = await prisma.user.create({
    data: {
      email: 'driver3@example.com',
      password: driverPassword,
      fullName: 'Edward Norton',
      phone: '+1987654323',
      role: 'DRIVER',
      driverProfile: {
        create: {
          vehicleMake: 'Mercedes',
          vehicleModel: 'E-Class',
          vehicleYear: 2024,
          vehicleColor: 'White',
          licensePlate: 'LUX-9012',
          vehicleType: 'PREMIUM',
          isAvailable: false,
          currentLat: 40.7108,
          currentLng: -74.0040,
          rating: 4.98,
          totalRides: 500,
        },
      },
    },
    include: { driverProfile: true },
  });

  console.log('Created drivers');

  // Create sample rides
  const ride1 = await prisma.ride.create({
    data: {
      riderId: rider1.id,
      driverId: driver1.id,
      status: 'COMPLETED',
      pickupLat: 40.7128,
      pickupLng: -74.0060,
      pickupAddress: '123 Broadway, New York, NY',
      destinationLat: 40.7580,
      destinationLng: -73.9855,
      destinationAddress: 'Times Square, New York, NY',
      rideType: 'STANDARD',
      fareEstimate: 15.50,
      fareFinal: 15.50,
      distanceKm: 5.2,
      durationMinutes: 18,
      requestedAt: new Date(Date.now() - 3600000), // 1 hour ago
      matchedAt: new Date(Date.now() - 3500000),
      startedAt: new Date(Date.now() - 3400000),
      completedAt: new Date(Date.now() - 3200000),
    },
  });

  const ride2 = await prisma.ride.create({
    data: {
      riderId: rider2.id,
      driverId: driver2.id,
      status: 'IN_PROGRESS',
      pickupLat: 40.7580,
      pickupLng: -73.9855,
      pickupAddress: 'Times Square, New York, NY',
      destinationLat: 40.7484,
      destinationLng: -73.9857,
      destinationAddress: 'Empire State Building, New York, NY',
      rideType: 'COMFORT',
      fareEstimate: 12.75,
      distanceKm: 2.1,
      durationMinutes: 10,
      requestedAt: new Date(Date.now() - 600000), // 10 min ago
      matchedAt: new Date(Date.now() - 550000),
      startedAt: new Date(Date.now() - 500000),
    },
  });

  const ride3 = await prisma.ride.create({
    data: {
      riderId: rider1.id,
      status: 'REQUESTED',
      pickupLat: 40.7484,
      pickupLng: -73.9857,
      pickupAddress: 'Empire State Building, New York, NY',
      destinationLat: 40.6892,
      destinationLng: -74.0445,
      destinationAddress: 'Statue of Liberty, New York, NY',
      rideType: 'PREMIUM',
      fareEstimate: 45.00,
      distanceKm: 8.5,
      durationMinutes: 25,
      requestedAt: new Date(),
    },
  });

  console.log('Created rides');

  // Create ratings for completed ride
  await prisma.rating.create({
    data: {
      rideId: ride1.id,
      fromUserId: rider1.id,
      toUserId: driver1.id,
      score: 5,
      comment: 'Great ride, very smooth!',
    },
  });

  await prisma.rating.create({
    data: {
      rideId: ride1.id,
      fromUserId: driver1.id,
      toUserId: rider1.id,
      score: 5,
      comment: 'Polite passenger',
    },
  });

  console.log('Created ratings');

  // Create payment for completed ride
  await prisma.payment.create({
    data: {
      rideId: ride1.id,
      userId: rider1.id,
      stripePaymentIntentId: 'pi_simulated_seed_123',
      amount: 15.50,
      currency: 'USD',
      status: 'SUCCEEDED',
    },
  });

  console.log('Created payments');

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: rider1.id,
      type: 'RIDE_STATUS_UPDATE',
      title: 'Ride Completed',
      message: 'Your ride to Times Square has been completed. Fare: $15.50',
      data: { rideId: ride1.id },
      read: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: rider1.id,
      type: 'RIDE_REQUESTED',
      title: 'Ride Requested',
      message: 'Looking for drivers near Empire State Building...',
      data: { rideId: ride3.id },
      read: false,
    },
  });

  console.log('Created notifications');

  // Summary
  console.log('\n========================================');
  console.log('Database seeded successfully!');
  console.log('========================================');
  console.log('\nTest Accounts:');
  console.log('--------------');
  console.log('Rider:   rider@example.com / password123');
  console.log('Rider 2: rider2@example.com / password123');
  console.log('Driver:  driver@example.com / password123');
  console.log('Driver 2: driver2@example.com / password123');
  console.log('Driver 3: driver3@example.com / password123');
  console.log('\nSample Data:');
  console.log('------------');
  console.log(`- ${2} riders, ${3} drivers`);
  console.log(`- ${3} rides (1 completed, 1 in-progress, 1 requested)`);
  console.log(`- ${2} ratings`);
  console.log(`- ${1} payment`);
  console.log(`- ${2} notifications`);
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
