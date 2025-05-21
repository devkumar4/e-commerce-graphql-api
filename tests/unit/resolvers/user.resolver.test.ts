import { userResolvers } from '../../../src/graphql/resolvers/user.resolver';
import { AuthenticationError, ValidationError } from '../../../src/utils/error.utils';

describe('userResolvers.Mutation.login', () => {
  it('throws AuthenticationError if user not found', async () => {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue(null) } };
    await expect(
      userResolvers.Mutation.login(
        null,
        { email: 'notfound@example.com', password: 'pass' },
        { prisma }
      )
    ).rejects.toThrow(AuthenticationError);
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
    await expect(
      userResolvers.Mutation.login(
        null,
        { email: 'test@example.com', password: 'wrong' },
        { prisma }
      )
    ).rejects.toThrow(AuthenticationError);
  });
});

describe('userResolvers.Mutation.register', () => {
  it('throws ValidationError if user already exists', async () => {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ id: '1', email: 'exists@example.com' }) }
    };
    await expect(
      userResolvers.Mutation.register(
        null,
        { input: { email: 'exists@example.com', password: 'pass', firstName: 'A', lastName: 'B' } },
        { prisma }
      )
    ).rejects.toThrow(ValidationError);
  });
});
