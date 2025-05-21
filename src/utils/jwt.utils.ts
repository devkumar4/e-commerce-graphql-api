import jwt from 'jsonwebtoken';
import { AuthUser } from '../types/context.types';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate a JWT token with a 24-hour expiry
 * @param user - Contains user ID, email, and role
 * @returns Signed JWT token
 */
export const generateToken = (user: {
  id: string;
  email: string;
  role: string;
}): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: '24h',
    }
  );
};

/**
 * Verifies and decodes a JWT token
 * @param token - JWT token string
 * @returns Decoded user data or null if invalid
 */
export const verifyToken = (token: string): AuthUser | null => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role as 'ADMIN' | 'CUSTOMER',
    };
  } catch {
    return null; // Invalid token
  }
};
