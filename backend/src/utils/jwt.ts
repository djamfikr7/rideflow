import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rideflow-dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  userId: string;
  email?: string;
  phone?: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  // expiresIn accepts number (seconds) or string like '7d', '24h'
  return jwt.sign(payload, JWT_SECRET, { expiresIn: 604800 }); // 7 days in seconds
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
