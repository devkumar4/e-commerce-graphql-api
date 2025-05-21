import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../../utils/jwt.utils';
import { RegisterInput } from '../../types/user.types';
import { AuthenticationError, ValidationError } from '../../utils/error.utils';
import { validateRegisterInput } from '../../utils/validation.utils';

const prisma = new PrismaClient();

export const userResolvers = {
  Mutation: {
    // Handles user registration logic
    register: async (_: any, { input }: { input: RegisterInput }, p0: any) => {
      try {
        validateRegisterInput(input); // Throws if input is invalid
        console.log('[register] Input:', input);

        const existingUser = await prisma.user.findUnique({
          where: { email: input.email }
        });

        if (existingUser) {
          console.error('[register] Email already in use:', input.email);
          throw new ValidationError('Email already in use', {
            email: 'Email already registered'
          });
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);

        const newUser = await prisma.user.create({
          data: {
            email: input.email,
            password: hashedPassword,
            firstName: input.firstName,
            lastName: input.lastName,
            role: 'CUSTOMER'
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
      } catch (error) {
        console.error('[register] error:', error);
        throw error;
      }
    },

    // Handles user login and authentication
    login: async (_: any, { email, password }: { email: string; password: string }, p0: any) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          console.error('[login] User not found:', email);
          throw new AuthenticationError('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          console.error('[login] Invalid password for:', email);
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
      } catch (error) {
        console.error('[login] error:', error);
        throw error;
      }
    }
  }
};
