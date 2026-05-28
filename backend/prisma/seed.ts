import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data (order matters for foreign keys)
  await prisma.rating.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.ride.deleteMany();
  await prisma.driverProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // Shared password for email-based login (legacy)
  const sharedPassword = await bcrypt.hash('password123', 10);
  // Placeholder password for OTP-only users
  const otpPassword = await bcrypt.hash('otp-auth-no-password', 10);

  // ============================================
  // Create 3 test riders
  // ============================================
  const rider1 = await prisma.user.create({
    data: {
      email: 'rider@example.com',
      password: sharedPassword,
      fullName: 'Alice Johnson',
      phone: '+1234567890',
      role: 'RIDER',
    },
  });

  const rider2 = await prisma.user.create({
    data: {
      email: 'rider2@example.com',
      password: sharedPassword,
      fullName: 'Bob Smith',
      phone: '+1234567891',
      role: 'RIDER',
    },
  });

  const rider3 = await prisma.user.create({
    data: {
      email: 'rider3@example.com',
      password: otpPassword,
      fullName: 'Carol Davis',
      phone: '+1234567892',
      role: 'RIDER',
    },
  });

  console.log('Created 3 riders');

  // ============================================
  // Create 3 test drivers
  // ============================================
  const driver1 = await prisma.user.create({
    data: {
      email: 'driver@example.com',
      password: sharedPassword,
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
      password: sharedPassword,
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
      password: sharedPassword,
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

  console.log('Created 3 drivers');

  // ============================================
  // Create sample rides in different statuses
  // ============================================

  // Completed ride
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
      requestedAt: new Date(Date.now() - 3600000),
      matchedAt: new Date(Date.now() - 3500000),
      startedAt: new Date(Date.now() - 3400000),
      completedAt: new Date(Date.now() - 3200000),
    },
  });

  // In-progress ride
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
      requestedAt: new Date(Date.now() - 600000),
      matchedAt: new Date(Date.now() - 550000),
      startedAt: new Date(Date.now() - 500000),
    },
  });

  // Requested ride (waiting for driver)
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

  // Second completed ride (for rider3)
  const ride4 = await prisma.ride.create({
    data: {
      riderId: rider3.id,
      driverId: driver3.id,
      status: 'COMPLETED',
      pickupLat: 40.7580,
      pickupLng: -73.9855,
      pickupAddress: 'Central Park West, New York, NY',
      destinationLat: 40.7484,
      destinationLng: -73.9857,
      destinationAddress: 'Empire State Building, New York, NY',
      rideType: 'PREMIUM',
      fareEstimate: 35.00,
      fareFinal: 38.50,
      distanceKm: 3.5,
      durationMinutes: 15,
      requestedAt: new Date(Date.now() - 7200000),
      matchedAt: new Date(Date.now() - 7100000),
      startedAt: new Date(Date.now() - 7000000),
      completedAt: new Date(Date.now() - 6800000),
    },
  });

  // Matched ride (driver assigned, not started)
  const ride5 = await prisma.ride.create({
    data: {
      riderId: rider2.id,
      driverId: driver1.id,
      status: 'MATCHED',
      pickupLat: 40.7128,
      pickupLng: -74.0060,
      pickupAddress: 'Wall Street, New York, NY',
      destinationLat: 40.7580,
      destinationLng: -73.9855,
      destinationAddress: 'Grand Central Terminal, New York, NY',
      rideType: 'STANDARD',
      fareEstimate: 22.00,
      distanceKm: 4.0,
      durationMinutes: 14,
      requestedAt: new Date(Date.now() - 120000),
      matchedAt: new Date(Date.now() - 60000),
    },
  });

  console.log('Created 5 rides (2 completed, 1 in-progress, 1 matched, 1 requested)');

  // ============================================
  // Create ratings for completed rides
  // ============================================
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

  await prisma.rating.create({
    data: {
      rideId: ride4.id,
      fromUserId: rider3.id,
      toUserId: driver3.id,
      score: 4,
      comment: 'Good service, slightly late',
    },
  });

  console.log('Created 3 ratings');

  // ============================================
  // Create cash payments for completed rides
  // ============================================
  await prisma.payment.create({
    data: {
      rideId: ride1.id,
      userId: rider1.id,
      stripePaymentIntentId: null, // Cash payment - no Stripe
      amount: 15.50,
      currency: 'USD',
      status: 'SUCCEEDED', // Cash confirmed by driver
    },
  });

  await prisma.payment.create({
    data: {
      rideId: ride4.id,
      userId: rider3.id,
      stripePaymentIntentId: null, // Cash payment - no Stripe
      amount: 38.50,
      currency: 'USD',
      status: 'SUCCEEDED', // Cash confirmed by driver
    },
  });

  console.log('Created 2 cash payments');

  // ============================================
  // Create notifications
  // ============================================
  await prisma.notification.create({
    data: {
      userId: rider1.id,
      type: 'RIDE_STATUS_UPDATE',
      title: 'Ride Completed',
      message: 'Your ride to Times Square has been completed. Fare: $15.50 (cash)',
      data: { rideId: ride1.id, paymentMethod: 'cash' },
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

  await prisma.notification.create({
    data: {
      userId: rider3.id,
      type: 'RIDE_STATUS_UPDATE',
      title: 'Ride Completed',
      message: 'Your ride to Empire State Building has been completed. Fare: $38.50 (cash)',
      data: { rideId: ride4.id, paymentMethod: 'cash' },
      read: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: driver1.id,
      type: 'RIDE_REQUESTED',
      title: 'New Ride Match',
      message: 'You have been matched with a ride from Wall Street to Grand Central Terminal.',
      data: { rideId: ride5.id },
      read: false,
    },
  });

  console.log('Created 4 notifications');

  // ============================================
  // Summary
  // ============================================
  console.log('\n========================================');
  console.log('Database seeded successfully!');
  console.log('========================================');
  console.log('\nTest Accounts (OTP: 123456 for all):');
  console.log('-------------------------------------');
  console.log('Riders:');
  console.log('  +1234567890 - Alice Johnson (rider@example.com)');
  console.log('  +1234567891 - Bob Smith (rider2@example.com)');
  console.log('  +1234567892 - Carol Davis (rider3@example.com)');
  console.log('Drivers:');
  console.log('  +1987654321 - Charlie Brown (driver@example.com)');
  console.log('  +1987654322 - Diana Prince (driver2@example.com)');
  console.log('  +1987654323 - Edward Norton (driver3@example.com)');
  console.log('\nSample Data:');
  console.log('------------');
  console.log('  3 riders, 3 drivers');
  console.log('  5 rides (2 completed, 1 in-progress, 1 matched, 1 requested)');
  console.log('  3 ratings');
  console.log('  2 cash payments (all confirmed)');
  console.log('  4 notifications');
  console.log('\nAuth:');
  console.log('  - OTP login: phone + code "123456"');
  console.log('  - Email login: email + "password123" (riders 1-2, all drivers)');
  console.log('  - Universal bypass code: "000000"');
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
