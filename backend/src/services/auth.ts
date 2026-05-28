import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { authenticate } from '../middleware/auth';
import { AppError, BadRequestError, NotFoundError, UnauthorizedError, ConflictError, ForbiddenError } from '../utils/errors';
import { generateOTP, verifyOTP } from './otp';

const router = Router();

// ============================================
// Validation Schemas
// ============================================
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
  role: z.enum(['RIDER', 'DRIVER']).default('RIDER'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

const driverProfileSchema = z.object({
  vehicleMake: z.string().min(1, 'Vehicle make is required'),
  vehicleModel: z.string().min(1, 'Vehicle model is required'),
  vehicleYear: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  vehicleColor: z.string().min(1, 'Vehicle color is required'),
  licensePlate: z.string().min(1, 'License plate is required'),
  vehicleType: z.enum(['STANDARD', 'COMFORT', 'PREMIUM']).default('STANDARD'),
});

// OTP validation schemas
const sendOtpSchema = z.object({
  phone: z.string().min(10, 'Valid phone number is required'),
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10, 'Valid phone number is required'),
  code: z.string().length(6, 'OTP code must be 6 digits'),
});

const registerWithOtpSchema = z.object({
  phone: z.string().min(10, 'Valid phone number is required'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum(['RIDER', 'DRIVER']).default('RIDER'),
  otp: z.string().length(6, 'OTP code must be 6 digits'),
});

const loginWithOtpSchema = z.object({
  phone: z.string().min(10, 'Valid phone number is required'),
  otp: z.string().length(6, 'OTP code must be 6 digits'),
});

// ============================================
// POST /api/auth/send-otp
// ============================================
router.post('/send-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = sendOtpSchema.parse(req.body);

    // Generate mock OTP
    const result = generateOTP(data.phone);

    // In dev mode, return the OTP for testing
    res.json({
      data: {
        success: true,
        phone: data.phone,
        otp: result.code, // Dev mode: expose OTP for testing
        expiresAt: result.expiresAt.toISOString(),
      },
      message: 'OTP sent successfully (mock)',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/auth/verify-otp
// ============================================
router.post('/verify-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = verifyOtpSchema.parse(req.body);

    // Verify OTP
    const isValid = verifyOTP(data.phone, data.code);
    if (!isValid) {
      throw new UnauthorizedError('Invalid or expired OTP code');
    }

    // Find user by phone (phone is not unique, so use findFirst)
    const user = await prisma.user.findFirst({
      where: { phone: data.phone },
      include: { driverProfile: true },
    });

    if (!user) {
      // User doesn't exist yet - they need to register
      res.json({
        data: {
          verified: true,
          phone: data.phone,
          userExists: false,
        },
        message: 'OTP verified. User needs to register.',
      });
      return;
    }

    // User exists - generate token
    const token = signToken({
      userId: user.id,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      role: user.role,
    });

    res.json({
      data: {
        verified: true,
        phone: data.phone,
        userExists: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          role: user.role,
          driverProfile: user.driverProfile,
          createdAt: user.createdAt,
        },
        token,
      },
      message: 'OTP verified and login successful',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/auth/register (with OTP)
// ============================================
router.post('/register-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerWithOtpSchema.parse(req.body);

    // Verify OTP first
    const isValid = verifyOTP(data.phone, data.otp);
    if (!isValid) {
      throw new UnauthorizedError('Invalid or expired OTP code');
    }

    // Check if user already exists by phone (phone is not unique, so use findFirst)
    const existingByPhone = await prisma.user.findFirst({
      where: { phone: data.phone },
    });
    if (existingByPhone) {
      throw new ConflictError('User with this phone number already exists');
    }

    // Generate a placeholder email from phone (since email is required by schema)
    const placeholderEmail = `user_${data.phone.replace(/[^0-9]/g, '')}@rideflow.local`;

    // Check if placeholder email is taken
    const existingByEmail = await prisma.user.findUnique({
      where: { email: placeholderEmail },
    });
    const email = existingByEmail
      ? `user_${data.phone.replace(/[^0-9]/g, '')}_${Date.now()}@rideflow.local`
      : placeholderEmail;

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash('otp-auth-no-password', 10), // Placeholder password
        fullName: data.fullName,
        phone: data.phone,
        role: data.role,
      },
    });

    // If driver, create driver profile placeholder
    if (data.role === 'DRIVER') {
      await prisma.driverProfile.create({
        data: {
          userId: user.id,
          vehicleMake: 'Unknown',
          vehicleModel: 'Unknown',
          vehicleYear: 2024,
          vehicleColor: 'Unknown',
          licensePlate: 'PENDING',
          vehicleType: 'STANDARD',
        },
      });
    }

    // Generate token
    const token = signToken({
      userId: user.id,
      email: user.email,
      phone: user.phone ?? undefined,
      role: user.role,
    });

    res.status(201).json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
      message: 'User registered successfully via OTP',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/auth/login (with OTP)
// ============================================
router.post('/login-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginWithOtpSchema.parse(req.body);

    // Verify OTP
    const isValid = verifyOTP(data.phone, data.otp);
    if (!isValid) {
      throw new UnauthorizedError('Invalid or expired OTP code');
    }

    // Find user by phone (phone is not unique, so use findFirst)
    const user = await prisma.user.findFirst({
      where: { phone: data.phone },
      include: { driverProfile: true },
    });

    if (!user) {
      throw new NotFoundError('No account found with this phone number. Please register first.');
    }

    // Generate token
    const token = signToken({
      userId: user.id,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      role: user.role,
    });

    res.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          role: user.role,
          driverProfile: user.driverProfile,
          createdAt: user.createdAt,
        },
        token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/auth/register (email+password, kept for backward compat)
// ============================================
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        phone: data.phone,
        role: data.role,
      },
    });

    // If driver, create driver profile placeholder
    if (data.role === 'DRIVER') {
      await prisma.driverProfile.create({
        data: {
          userId: user.id,
          vehicleMake: 'Unknown',
          vehicleModel: 'Unknown',
          vehicleYear: 2024,
          vehicleColor: 'Unknown',
          licensePlate: 'PENDING',
          vehicleType: 'STANDARD',
        },
      });
    }

    // Generate token
    const token = signToken({
      userId: user.id,
      email: user.email,
      phone: user.phone ?? undefined,
      role: user.role,
    });

    res.status(201).json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/auth/login (email+password, kept for backward compat)
// ============================================
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        driverProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate token
    const token = signToken({
      userId: user.id,
      email: user.email,
      phone: user.phone ?? undefined,
      role: user.role,
    });

    res.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          role: user.role,
          driverProfile: user.driverProfile,
          createdAt: user.createdAt,
        },
        token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET /api/auth/me
// ============================================
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        driverProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    res.json({
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        driverProfile: user.driverProfile,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUT /api/auth/profile
// ============================================
router.put('/profile', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
      },
    });

    res.json({
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/auth/driver-profile
// ============================================
router.post('/driver-profile', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== 'DRIVER') {
      throw new ForbiddenError('Only drivers can create driver profiles');
    }

    const data = driverProfileSchema.parse(req.body);

    const profile = await prisma.driverProfile.upsert({
      where: { userId: req.user!.userId },
      update: {
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        vehicleYear: data.vehicleYear,
        vehicleColor: data.vehicleColor,
        licensePlate: data.licensePlate,
        vehicleType: data.vehicleType,
      },
      create: {
        userId: req.user!.userId,
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        vehicleYear: data.vehicleYear,
        vehicleColor: data.vehicleColor,
        licensePlate: data.licensePlate,
        vehicleType: data.vehicleType,
      },
    });

    res.json({
      data: profile,
      message: 'Driver profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET /api/auth/driver-profile
// ============================================
router.get('/driver-profile', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await prisma.driverProfile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!profile) {
      throw new NotFoundError('Driver profile');
    }

    res.json({ data: profile });
  } catch (error) {
    next(error);
  }
});

export default router;
