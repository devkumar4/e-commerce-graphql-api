import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { prisma } from '../config/database';
import { createProductLoader } from './dataloaders/product.loader';
import { createUserLoader } from './dataloaders/user.loader';
import { createCategoryLoader } from './dataloaders/category.loader';


import { verifyToken } from '../utils/jwt.utils';


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
  productLoader: ReturnType<typeof createProductLoader>;
  userLoader: ReturnType<typeof createUserLoader>;
  categoryLoader: ReturnType<typeof createCategoryLoader>;
}

// Create context for each request
export const createContext = async ({
  req,
}: {
  req: Request;
}): Promise<GraphQLContext> => {
  // Initialize with request and Prisma client
  const context: GraphQLContext = {
    prisma,
    req,
    productLoader: createProductLoader(prisma),
    userLoader: createUserLoader(prisma),
    categoryLoader: createCategoryLoader(prisma),
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
