import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { prisma } from '../config/database';

// This will be implemented in auth middleware
import { verifyToken } from '../utils/jwt.utils';

// Define the shape of our authenticated user
export interface AuthUser {
  userId: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

// Define our GraphQL context shape
export interface GraphQLContext {
  prisma: PrismaClient;
  user?: AuthUser;
  req: Request;
}

// Create context for each request
export const createContext = async ({ req }: { req: Request }): Promise<GraphQLContext> => {
  // Initialize with request and Prisma client
  const context: GraphQLContext = {
    prisma,
    req,
  };
  
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');
      // Verify will be implemented in the JWT utils
      const user = verifyToken(token);
      if (user) {
        context.user = user;
      }
    } catch (error) {
      // Invalid token - no user will be set
      console.error('Authentication error:', error);
    }
  }
  
  return context;
};

// import { authMiddleware } from '../middleware/auth.middleware';

// export async function createContext({ req }: { req: any }) {
//   const prisma = new PrismaClient();
//   return authMiddleware({ req, prisma });
// }