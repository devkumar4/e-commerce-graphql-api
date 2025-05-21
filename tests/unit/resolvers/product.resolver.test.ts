import { productResolvers } from '../../../src/graphql/resolvers/product.resolver';

describe('productResolvers.Query.product', () => {
  it('returns product if found', async () => {
    const mockProduct = { id: '1', name: 'Test', category: {} };
    const prisma = { product: { findUnique: jest.fn().mockResolvedValue(mockProduct) } };
    const ctx = { prisma };
    const result = await productResolvers.Query.product(null, { id: '1' }, ctx as any);
    expect(result).toBe(mockProduct);
  });

  it('throws if not found', async () => {
    const prisma = { product: { findUnique: jest.fn().mockResolvedValue(null) } };
    const ctx = { prisma };
    await expect(productResolvers.Query.product(null, { id: '1' }, ctx as any))
      .rejects.toThrow();
  });
});
