import { ProductInput } from '../../types/product.types';
import {
  AuthenticationError,
  AuthorizationError,
} from '../../utils/error.utils';
import { GraphQLContext } from '../../types/context.types';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../../services/product.service';

export const productResolvers = {
  Query: {
    products: async (_: any, args: { skip?: number; take?: number }, context: GraphQLContext) => {
      const { skip, take, ...rest } = args;
      return getProducts(
        { ...rest, offset: skip, limit: take },
        context.prisma
      );
    },

    product: async (
      _: any,
      { id }: { id: string },
      { prisma }: GraphQLContext
    ) => {
      return getProductById(id, prisma);
    },
  },

  Mutation: {
    createProduct: async (
      _: any,
      { input }: { input: ProductInput },
      { prisma, user }: GraphQLContext
    ) => {
      if (!user) throw new AuthenticationError();
      if (user.role !== 'ADMIN')
        throw new AuthorizationError('Only admins can create products');

      return createProduct(input, prisma);
    },

    updateProduct: async (
      _: any,
      { id, input }: { id: string; input: ProductInput },
      { prisma, user }: GraphQLContext
    ) => {
      if (!user) throw new AuthenticationError();
      if (user.role !== 'ADMIN')
        throw new AuthorizationError('Only admins can update products');

      return updateProduct(id, input, prisma);
    },

    deleteProduct: async (
      _: any,
      { id }: { id: string },
      { prisma, user }: GraphQLContext
    ) => {
      if (!user) throw new AuthenticationError();
      if (user.role !== 'ADMIN')
        throw new AuthorizationError('Only admins can delete products');

      return deleteProduct(id, prisma);
    },
  },
};

interface ProductParent {
  categoryId: string;
  [key: string]: any;
}
interface CategoryLoader {

  load: (id: string) => Promise<any>;
}

interface ProductResolverContext extends GraphQLContext {
  categoryLoader: CategoryLoader;
}

export const Product = {
  category: async (
    parent: ProductParent,
    args: Record<string, unknown>,
    context: ProductResolverContext
  ): Promise<any> => {
    return context.categoryLoader.load(parent.categoryId);
  },
};