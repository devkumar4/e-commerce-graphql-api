import { PrismaClient } from '@prisma/client';
import { ProductInput } from '../types/product.types';
import { NotFoundError, ValidationError } from '../utils/error.utils';

export async function getProducts(
  filters: { categoryId?: string; minPrice?: number; maxPrice?: number; offset?: number; limit?: number },
  prisma: PrismaClient
) {
  const where: any = {};
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }

  return prisma.product.findMany({
    where,
    skip: filters.offset || 0,
    take: filters.limit || 10,
    include: { category: true }
  });
}

export async function getProductById(id: string, prisma: PrismaClient) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true }
  });
  if (!product) throw new NotFoundError('Product', id);
  return product;
}

export async function createProduct(input: ProductInput, prisma: PrismaClient) {
  validateProductInput(input);

  return prisma.product.create({
    data: {
      ...input,
      price: parseFloat(input.price.toString())
    },
    include: { category: true }
  });
}

export async function updateProduct(id: string, input: ProductInput, prisma: PrismaClient) {
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
}

export async function deleteProduct(id: string, prisma: PrismaClient) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new NotFoundError('Product', id);

  await prisma.product.delete({ where: { id } });
  return true;
}

export function validateProductInput(input: {
  name: string;
  description: string;
  price: number;
  inventory: number;
  categoryId: string;
}) {
  if (!input.name || !input.description || input.price == null || input.inventory == null || !input.categoryId) {
    throw new ValidationError('All product fields are required', {
      name: !input.name ? 'Name is required' : '',
      description: !input.description ? 'Description is required' : '',
      price: input.price == null ? 'Price is required' : '',
      inventory: input.inventory == null ? 'Inventory is required' : '',
      categoryId: !input.categoryId ? 'CategoryId is required' : ''
    });
  }
  if (input.price < 0) throw new ValidationError('Price must be positive', { price: 'Price must be positive' });
  if (input.inventory < 0) throw new ValidationError('Inventory must be positive', { inventory: 'Inventory must be positive' });
}
