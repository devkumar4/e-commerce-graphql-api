import { ProductInput } from '../../types/product.types';
import { AuthenticationError, AuthorizationError } from '../../utils/error.utils';
import { GraphQLContext } from '../../types/context.types';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct
} from '../../services/product.service';

export const productResolvers = {
  Query: {
    products: async (_: any, args: any, context: GraphQLContext) => {
      return getProducts(args, context.prisma);
    },

    product: async (_: any, { id }: { id: string }, { prisma }: GraphQLContext) => {
      return getProductById(id, prisma);
    }
  },

  Mutation: {
    createProduct: async (_: any, { input }: { input: ProductInput }, { prisma, user }: GraphQLContext) => {
      if (!user) throw new AuthenticationError();
      if (user.role !== 'ADMIN') throw new AuthorizationError('Only admins can create products');

      return createProduct(input, prisma);
    },

    updateProduct: async (_: any, { id, input }: { id: string; input: ProductInput }, { prisma, user }: GraphQLContext) => {
      if (!user) throw new AuthenticationError();
      if (user.role !== 'ADMIN') throw new AuthorizationError('Only admins can update products');

      return updateProduct(id, input, prisma);
    },

    deleteProduct: async (_: any, { id }: { id: string }, { prisma, user }: GraphQLContext) => {
      if (!user) throw new AuthenticationError();
      if (user.role !== 'ADMIN') throw new AuthorizationError('Only admins can delete products');

      return deleteProduct(id, prisma);
    }
  }
};
