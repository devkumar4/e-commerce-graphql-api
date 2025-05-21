import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../../utils/jwt.utils';
import { RegisterInput } from '../../types/user.types';
import { AuthenticationError, ValidationError } from '../../utils/error.utils';
import { validateRegisterInput } from '../../utils/validation.utils';

const prisma = new PrismaClient();

export const userResolvers = {
  Mutation: {
    /**
     * Register a new user
     */
    register: async (_: any, { input }: { input: RegisterInput }) => {
      try {
        validateRegisterInput(input);
        console.log('[register] Input:', input);

        // 1. Check if a user already exists with the provided email
        const existingUser = await prisma.user.findUnique({
          where: { email: input.email }
        });
        console.log('[register] existingUser:', existingUser);

        if (existingUser) {
          console.error('[register] Email already in use:', input.email);
          throw new ValidationError('Email already in use', {
            email: 'Email already registered'
          });
        }

        // 2. Hash the user's password securely
        const hashedPassword = await bcrypt.hash(input.password, 10);
        console.log('[register] hashedPassword created');

        // 3. Create new user in the database
        const newUser = await prisma.user.create({
          data: {
            email: input.email,
            password: hashedPassword,
            firstName: input.firstName,
            lastName: input.lastName,
            role: 'CUSTOMER'
          }
        });
        console.log('[register] newUser created:', newUser);

        // 4. Generate JWT token for the new user
        const token = generateToken({
          id: newUser.id,
          email: newUser.email,
          role: newUser.role
        });
        console.log('[register] token generated:', token);

        // 5. Return token and sanitized user (password omitted)
        const { password, ...safeUser } = newUser;
        console.log('[register] returning safeUser');

        return {
          token,
          user: safeUser
        };
      } catch (error) {
        console.error('[register] error:', error);
        throw error;
      }
    },

    /**
     * Login an existing user
     */
    login: async (_: any, { email, password }: { email: string; password: string }) => {
      try {
        console.log('[login] email:', email);

        // 1. Find user by email
        const user = await prisma.user.findUnique({ where: { email } });
        console.log('[login] found user:', user);

        if (!user) {
          console.error('[login] User not found:', email);
          throw new AuthenticationError('Invalid credentials');
        }

        // 2. Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('[login] password valid:', isPasswordValid);

        if (!isPasswordValid) {
          console.error('[login] Invalid password for:', email);
          throw new AuthenticationError('Invalid credentials');
        }

        // 3. Generate token
        const token = generateToken({
          id: user.id,
          email: user.email,
          role: user.role
        });
        console.log('[login] token generated:', token);

        // 4. Return token and sanitized user
        const { password: _pw, ...safeUser } = user;
        console.log('[login] returning safeUser');

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
