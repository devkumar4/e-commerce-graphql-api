import { ProductInput } from '../../types/product.types';
import { AuthenticationError, AuthorizationError, NotFoundError } from '../../utils/error.utils';
import { GraphQLContext } from '../../types/context.types';
import { validateProductInput } from '../../utils/validation.utils';

export const productResolvers = {
  Query: {
    products: async (
      _: any,
      { categoryId, minPrice, maxPrice, offset, limit }: { categoryId?: string; minPrice?: number; maxPrice?: number; offset?: number; limit?: number },
      { prisma }: GraphQLContext
    ) => {
      const where: any = {};
      if (categoryId) where.categoryId = categoryId;
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
      }

      return prisma.product.findMany({
        where,
        skip: offset || 0,
        take: limit || 10,
        include: { category: true }
      });
    },

    product: async (_: any, { id }: { id: string }, { prisma }: GraphQLContext) => {
      const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true }
      });

      if (!product) throw new NotFoundError('Product', id);
      return product;
    }
  },

  Mutation: {
    createProduct: async (_: any, { input }: { input: ProductInput }, { prisma, user }: GraphQLContext) => {
      if (!user) throw new AuthenticationError();
      if (user.role !== 'ADMIN') throw new AuthorizationError('Only admins can create products');

      validateProductInput(input); // Basic input schema validation

      return prisma.product.create({
        data: {
          ...input,
          price: parseFloat(input.price.toString()) // Ensure price is stored as float
        },
        include: { category: true }
      });
    },

    updateProduct: async (_: any, { id, input }: { id: string; input: ProductInput }, { prisma, user }: GraphQLContext) => {
      if (!user) throw new AuthenticationError();
      if (user.role !== 'ADMIN') throw new AuthorizationError('Only admins can update products');

      validateProductInput(input);

      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) throw new NotFoundError('Product', id);

      return prisma.product.update({
        where: { id },
        data: {
          ...input,
          price: parseFloat(input.price.toString())
        },
        include: { category: true }
      });
    },

    deleteProduct: async (_: any, { id }: { id: string }, { prisma, user }: GraphQLContext) => {
      if (!user) throw new AuthenticationError();
      if (user.role !== 'ADMIN') throw new AuthorizationError('Only admins can delete products');

      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) throw new NotFoundError('Product', id);

      await prisma.product.delete({ where: { id } });
      return true; // Success acknowledgment
    }
  }
};
