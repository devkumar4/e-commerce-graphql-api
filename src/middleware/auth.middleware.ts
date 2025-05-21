import { Request } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { GraphQLContext } from '../types/context.types';
import { PrismaClient } from '@prisma/client';

interface ContextParams {
  req: Request;
  prisma: PrismaClient;
}

export const authMiddleware = async ({ req, prisma }: ContextParams): Promise<GraphQLContext> => {
  const context: GraphQLContext = { prisma };

  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (decoded) {
      context.user = decoded;
    }
  }

  return context;
};
