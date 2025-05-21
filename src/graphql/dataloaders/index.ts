import { createProductLoader } from './product.loader';
import { createCategoryLoader } from './category.loader';
import { PrismaClient } from '@prisma/client';

export function createLoaders(prisma: PrismaClient) {
  return {
    productLoader: createProductLoader(prisma),
    categoryLoader: createCategoryLoader(prisma),
  };
}
