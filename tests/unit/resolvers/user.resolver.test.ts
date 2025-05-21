import { userResolvers } from '../../../src/graphql/resolvers/user.resolver';
import { AuthenticationError } from '../../../src/utils/error.utils';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('userResolvers.Mutation.login', () => {
  it('throws AuthenticationError if user not found', async () => {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue(null) } };
    await expect(
      userResolvers.Mutation.login(
        null,
        { email: 'notfound@example.com', password: 'pass' },
        { prisma: prisma as any }
      )
    ).rejects.toThrow(AuthenticationError);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'notfound@example.com' } });
  });

  it('throws AuthenticationError if password is invalid', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: '1',
          email: 'test@example.com',
          password: '$2a$10$invalidhash',
          role: 'CUSTOMER'
        })
      }
    };
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      userResolvers.Mutation.login(
        null,
        { email: 'test@example.com', password: 'wrong' },
        { prisma: prisma as any }
      )
    ).rejects.toThrow(AuthenticationError);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
  });
});
