import { PrismaClient, OrderStatus } from '@prisma/client';
import { OrderInput } from '../types/order.types';
import { NotFoundError, ValidationError } from '../utils/error.utils';
import { ORDER_STATUS, OrderStatusType } from '../constants/order.constants';

const prisma = new PrismaClient();

export async function getOrders(userId: string, isAdmin: boolean) {
  return prisma.order.findMany({
    where: isAdmin ? {} : { userId },
    include: {
      items: { include: { product: true } },
      user: true,
    },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      user: true,
    },
  });
}

export async function createOrder(userId: string, input: OrderInput) {
  let totalAmount = 0;

  for (const item of input.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });
    if (!product) throw new NotFoundError('Product', item.productId);
    if (product.inventory < item.quantity) {
      throw new ValidationError(
        `Insufficient inventory for product ${product.name}`,
        {
          productId: item.productId,
        }
      );
    }
    totalAmount += Number(product.price) * item.quantity;
  }

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        userId,
        status: ORDER_STATUS.PENDING,
        totalAmount,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: 0,
          })),
        },
      },
      include: { items: true },
    });

    for (const item of createdOrder.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      await tx.orderItem.update({
        where: { id: item.id },
        data: { unitPrice: product?.price },
      });

      await tx.product.update({
        where: { id: item.productId },
        data: {
          inventory: {
            decrement: item.quantity,
          },
        },
      });
    }

    return tx.order.findUnique({
      where: { id: createdOrder.id },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    });
  });

  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatusType) {
  if (!Object.values(ORDER_STATUS).includes(status)) {
    throw new ValidationError('Invalid order status', { status });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new NotFoundError('Order', id);

  return prisma.order.update({
    where: { id },
    data: { status: status as OrderStatus },
    include: {
      items: { include: { product: true } },
      user: true,
    },
  });
}
