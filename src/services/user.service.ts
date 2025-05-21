import { PrismaClient } from '@prisma/client';
import { RegisterInput } from '../types/user.types';
import { generateToken } from '../utils/jwt.utils';
import { validateRegisterInput } from '../utils/validation.utils';
import { ROLES } from '../constants/roles.constants';
import { AuthenticationError, ValidationError } from '../utils/error.utils';
import { hashPassword, comparePassword } from '../utils/password.utils';

// Remove the fixed PrismaClient instance here
// const prisma = new PrismaClient();

export async function registerUser(input: RegisterInput, prisma: PrismaClient) {
  validateRegisterInput(input);

  const existingUser = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (existingUser) {
    throw new ValidationError('Email already in use', {
      email: 'Email already registered'
    });
  }

  const hashedPassword = await hashPassword(input.password);

  const newUser = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      role: ROLES.CUSTOMER
    }
  });

  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role
  });

  const { password, ...safeUser } = newUser;

  return {
    token,
    user: safeUser
  };
}

export async function loginUser(email: string, password: string, prisma: PrismaClient) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid credentials');
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  const { password: _pw, ...safeUser } = user;

  return {
    token,
    user: safeUser
  };
}
