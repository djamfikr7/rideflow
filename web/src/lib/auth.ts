import api from './api';
import { MOCK_OTP } from './constants';
import type { User } from '../types/user';

interface AuthResponse {
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

// Mock OTP storage (in-memory)
const pendingOTPs = new Map<string, string>();

/**
 * Send OTP to phone number (mocked — always succeeds)
 */
export async function sendOTP(phone: string): Promise<{ success: boolean }> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 800));
  pendingOTPs.set(phone, MOCK_OTP);
  return { success: true };
}

/**
 * Verify OTP (mocked — accepts "123456" always)
 */
export async function verifyOTP(
  phone: string,
  otp: string
): Promise<{ valid: boolean }> {
  await new Promise((r) => setTimeout(r, 500));
  const expected = pendingOTPs.get(phone);
  if (otp === MOCK_OTP || otp === expected) {
    pendingOTPs.delete(phone);
    return { valid: true };
  }
  return { valid: false };
}

/**
 * Login with phone — creates/finds user via mock, returns JWT
 * Since the backend uses email/password, we generate a deterministic email
 * from the phone number and use a fixed password.
 */
export async function loginWithPhone(phone: string): Promise<{ user: User; token: string }> {
  const email = `phone_${phone.replace(/\D/g, '')}@rideflow.local`;
  const password = 'rideflow_otp_2024';

  try {
    // Try login first
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    const { user, token } = res.data.data;
    return { user: { ...user, role: user.role.toLowerCase() as User['role'] }, token };
  } catch {
    // User doesn't exist — register
    const res = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      fullName: `Rider ${phone.slice(-4)}`,
      phone,
      role: 'RIDER',
    });
    const { user, token } = res.data.data;
    return { user: { ...user, role: user.role.toLowerCase() as User['role'] }, token };
  }
}

/**
 * Register with details + phone
 */
export async function registerWithPhone(
  fullName: string,
  phone: string,
  role: 'rider' | 'driver'
): Promise<{ user: User; token: string }> {
  const email = `phone_${phone.replace(/\D/g, '')}@rideflow.local`;
  const password = 'rideflow_otp_2024';

  try {
    // Try login first (user might already exist)
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    const { user, token } = res.data.data;
    return { user: { ...user, role: user.role.toLowerCase() as User['role'] }, token };
  } catch {
    // Register new user
    const res = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      fullName,
      phone,
      role: role.toUpperCase(),
    });
    const { user, token } = res.data.data;
    return { user: { ...user, role: user.role.toLowerCase() as User['role'] }, token };
  }
}

/**
 * Get current user from token
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await api.get<{ data: User }>('/auth/me');
    const user = res.data.data;
    return { ...user, role: user.role.toLowerCase() as User['role'] };
  } catch {
    return null;
  }
}
