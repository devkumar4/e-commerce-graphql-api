import { PrismaClient } from '@prisma/client';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

export interface GraphQLContext {
  prisma: PrismaClient;
  user?: AuthUser;
}
