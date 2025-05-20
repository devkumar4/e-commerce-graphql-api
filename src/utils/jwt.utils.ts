import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/auth';
import { AuthUser } from '../graphql/context';

// Define the JWT payload structure
interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate a JWT token for a user
 * @param user User information to encode in token
 * @returns Signed JWT token
 */
export const generateToken = (user: { id: string; email: string; role: string }): string => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    jwtConfig.secret,
    { 
      expiresIn: jwtConfig.expiresIn,
      algorithm: jwtConfig.algorithm,
      issuer: jwtConfig.issuer
    }
  );
};

/**
 * Verify and decode a JWT token
 * @param token JWT token to verify
 * @returns Decoded user information or null if invalid
 */
export const verifyToken = (token: string): AuthUser | null => {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role as 'ADMIN' | 'CUSTOMER'
    };
  } catch (error) {
    return null;
  }
};