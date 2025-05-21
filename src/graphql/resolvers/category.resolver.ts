import { CategoryInput } from '../../types/category.types';
import { AuthenticationError, AuthorizationError, NotFoundError } from '../../utils/error.utils';
import { GraphQLContext } from '../../types/context.types';
import { validateCategoryInput } from '../../utils/validation.utils';

export const categoryResolvers = {
  Query: {
    // Fetch all categories with their products
    categories: async (_: any, __: any, { prisma }: GraphQLContext) => {
      return prisma.category.findMany({ include: { products: true } });
    },

    // Fetch a single category by ID
    category: async (_: any, { id }: { id: string }, { prisma }: GraphQLContext) => {
      const category = await prisma.category.findUnique({ where: { id }, include: { products: true } });
      if (!category) throw new NotFoundError('Category', id);
      return category;
    }
  },

  Mutation: {
    // Create a new category (Admin only)
    createCategory: async (_: any, { input }: { input: CategoryInput }, { prisma, user }: GraphQLContext) => {
      validateCategoryInput(input);
      if (!user) throw new AuthenticationError();
      if (user.role !== 'ADMIN') throw new AuthorizationError('Only admins can create categories');
      return prisma.category.create({ data: input });
    },

    // Update an existing category (Admin only)
    updateCategory: async (_: any, { id, input }: { id: string; input: CategoryInput }, { prisma, user }: GraphQLContext) => {
      validateCategoryInput(input);
      if (!user) throw new AuthenticationError();
      if (user.role !== 'ADMIN') throw new AuthorizationError('Only admins can update categories');
      const category = await prisma.category.findUnique({ where: { id } });
      if (!category) throw new NotFoundError('Category', id);
      return prisma.category.update({ where: { id }, data: input });
    }
  }
};
