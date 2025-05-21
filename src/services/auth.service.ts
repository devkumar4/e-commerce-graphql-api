import { PrismaClient } from '@prisma/client';
import { RegisterInput } from '../types/user.types';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function registerUser(input: RegisterInput) {
  const hashedPassword = await bcrypt.hash(input.password, 10);
  return prisma.user.create({
    data: {
      ...input,
      password: hashedPassword,
      role: 'CUSTOMER'
    }
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

// ...add more auth-related business logic as needed...
