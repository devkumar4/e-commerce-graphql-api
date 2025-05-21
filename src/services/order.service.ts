import { PrismaClient } from '@prisma/client';
import { OrderInput } from '../types/order.types';

const prisma = new PrismaClient();

export async function createOrder(userId: string, input: OrderInput) {
  // Implement inventory validation and total calculation as needed
  return prisma.order.create({
    data: {
      userId,
      status: 'PENDING',
      totalAmount: 0,
      items: {
        create: input.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: 0
        }))
      }
    }
  });
}

export async function getOrders(userId: string, isAdmin: boolean) {
  if (isAdmin) {
    return prisma.order.findMany({ include: { items: { include: { product: true } }, user: true } });
  }
  return prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } }, user: true }
  });
}

// ...add more order-related business logic as needed...
