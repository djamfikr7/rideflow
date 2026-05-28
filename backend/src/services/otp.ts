/**
 * Mock OTP Service for RideFlow
 *
 * In development mode, any phone + code "123456" always succeeds.
 * "000000" is a universal bypass code.
 * No real SMS is sent.
 */

interface OtpEntry {
  code: string;
  expiresAt: number;
}

// In-memory OTP store (no Redis dependency needed for dev)
const otpStore = new Map<string, OtpEntry>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [phone, entry] of otpStore.entries()) {
    if (entry.expiresAt < now) {
      otpStore.delete(phone);
    }
  }
}, 5 * 60 * 1000);

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MOCK_OTP_CODE = '123456';
const UNIVERSAL_BYPASS_CODE = '000000';

/**
 * Generate and store an OTP for the given phone number.
 * In dev mode, always generates "123456".
 */
export function generateOTP(phone: string): { code: string; expiresAt: Date } {
  const code = MOCK_OTP_CODE;
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  otpStore.set(phone, { code, expiresAt });

  return {
    code,
    expiresAt: new Date(expiresAt),
  };
}

/**
 * Verify an OTP code for the given phone number.
 * Accepts "123456" (mock code) or "000000" (universal bypass).
 * Also checks stored OTP if present.
 */
export function verifyOTP(phone: string, code: string): boolean {
  // Universal bypass code always works
  if (code === UNIVERSAL_BYPASS_CODE) {
    return true;
  }

  // Check stored OTP
  const entry = otpStore.get(phone);
  if (entry) {
    // Check expiry
    if (entry.expiresAt < Date.now()) {
      otpStore.delete(phone);
      return false;
    }
    // Check code match
    if (entry.code === code) {
      // OTP consumed - delete after use
      otpStore.delete(phone);
      return true;
    }
  }

  // Mock code always works in dev mode
  if (code === MOCK_OTP_CODE) {
    return true;
  }

  return false;
}

/**
 * Check if a phone has a pending OTP
 */
export function hasPendingOTP(phone: string): boolean {
  const entry = otpStore.get(phone);
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) {
    otpStore.delete(phone);
    return false;
  }
  return true;
}

/**
 * Clear OTP for a phone (e.g., after successful verification)
 */
export function clearOTP(phone: string): void {
  otpStore.delete(phone);
}
