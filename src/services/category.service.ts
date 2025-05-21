import { PrismaClient } from '@prisma/client';
import { CategoryInput } from '../types/category.types';

const prisma = new PrismaClient();

export async function createCategory(input: CategoryInput) {
  return prisma.category.create({ data: input });
}

export async function updateCategory(id: string, input: CategoryInput) {
  return prisma.category.update({ where: { id }, data: input });
}

export async function getCategories() {
  return prisma.category.findMany({ include: { products: true } });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: { products: true },
  });
}
