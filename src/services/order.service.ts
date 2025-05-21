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
  return prisma.$transaction(async (tx) => {
    let totalAmount = 0;

    // Validate and prepare items with unit price
    const itemsWithPrice = await Promise.all(
      input.items.map(async (item) => {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) throw new NotFoundError('Product', item.productId);

        if (product.inventory < item.quantity) {
          throw new ValidationError(
            `Insufficient inventory for product ${product.name}`,
            { productId: item.productId }
          );
        }

        const unitPrice = Number(product.price);
        totalAmount += unitPrice * item.quantity;

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
        };
      })
    );

    // Create the order with all items (including unitPrice)
    const createdOrder = await tx.order.create({
      data: {
        userId,
        status: ORDER_STATUS.PENDING,
        totalAmount,
        items: {
          create: itemsWithPrice.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    });

    // Decrement product inventory
    await Promise.all(
      itemsWithPrice.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              decrement: item.quantity,
            },
          },
        })
      )
    );

    return createdOrder;
  });
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
