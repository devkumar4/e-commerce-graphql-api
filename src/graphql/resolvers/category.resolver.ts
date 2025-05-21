import { CategoryInput } from '../../types/category.types';
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from '../../utils/error.utils';
import { GraphQLContext } from '../../types/context.types';
import { validateCategoryInput } from '../../utils/validation.utils';
import {
  createCategory,
  updateCategory,
  getCategories,
  getCategoryById,
} from '../../services/category.service';

export const categoryResolvers = {
  Query: {
    // Fetch all categories with their products
    categories: async (_: any, __: any, _ctx: GraphQLContext) => {
      return getCategories();
    },

    // Fetch a single category by ID
    category: async (_: any, { id }: { id: string }, _ctx: GraphQLContext) => {
      const category = await getCategoryById(id);
      if (!category) throw new NotFoundError('Category', id);
      return category;
    },
  },

  Mutation: {
    // Create a new category (Admin only)
    createCategory: async (
      _: any,
      { input }: { input: CategoryInput },
      { user }: GraphQLContext
    ) => {
      validateCategoryInput(input);
      if (!user) throw new AuthenticationError();
      if (user.role !== 'ADMIN')
        throw new AuthorizationError('Only admins can create categories');
      return createCategory(input);
    },

    // Update an existing category (Admin only)
    updateCategory: async (
      _: any,
      { id, input }: { id: string; input: CategoryInput },
      { user }: GraphQLContext
    ) => {
      validateCategoryInput(input);
      if (!user) throw new AuthenticationError();
      if (user.role !== 'ADMIN')
        throw new AuthorizationError('Only admins can update categories');
      const category = await getCategoryById(id);
      if (!category) throw new NotFoundError('Category', id);
      return updateCategory(id, input);
    },
  },
};
