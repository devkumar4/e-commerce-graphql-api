import { OrderInput } from '../../types/order.types';
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError
} from '../../utils/error.utils';
import { GraphQLContext } from '../../types/context.types';
import { OrderStatus } from '@prisma/client';
import { validateOrderInput } from '../../utils/validation.utils';

export const orderResolvers = {
  Query: {
    /**
     * Fetch all orders.
     * - Admins get all orders.
     * - Regular users get only their own orders.
     */
    orders: async (_: any, __: any, { prisma, user }: GraphQLContext) => {
      if (!user) throw new AuthenticationError();

      if (user.role === 'ADMIN') {
        return prisma.order.findMany({
          include: {
            items: { include: { product: true } },
            user: true
          }
        });
      }

      return prisma.order.findMany({
        where: { userId: user.userId },
        include: {
          items: { include: { product: true } },
          user: true
        }
      });
    },

    /**
     * Fetch a single order by ID.
     * - Admins can access any order.
     * - Regular users can only access their own orders.
     */
    order: async (_: any, { id }: { id: string }, { prisma, user }: GraphQLContext) => {
      if (!user) throw new AuthenticationError();

      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: { include: { product: true } },
          user: true
        }
      });

      if (!order) throw new NotFoundError('Order', id);

      if (user.role !== 'ADMIN' && order.userId !== user.userId) {
        throw new AuthorizationError('Not authorized to view this order');
      }

      return order;
    }
  },

  Mutation: {
    /**
     * Create a new order.
     * - Validates user and order input.
     * - Checks product availability and adjusts inventory.
     * - Calculates total amount and persists the order transactionally.
     */
    createOrder: async (_: any, { input }: { input: OrderInput }, { prisma, user }: GraphQLContext) => {
      validateOrderInput(input);
      if (!user) throw new AuthenticationError();

      // Step 1: Validate products & compute total cost
      let totalAmount = 0;
      for (const item of input.items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new NotFoundError('Product', item.productId);
        if (product.inventory < item.quantity) {
          throw new ValidationError(`Insufficient inventory for product ${product.name}`, {
            productId: item.productId
          });
        }
        totalAmount += Number(product.price) * item.quantity;
      }

      // Step 2: Transactionally create order and update inventory
      const order = await prisma.$transaction(async (tx) => {
        // Create the order with placeholder unit prices
        const createdOrder = await tx.order.create({
          data: {
            userId: user.userId,
            status: 'PENDING',
            totalAmount,
            items: {
              create: input.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: 0 // to be updated after creation
              }))
            }
          },
          include: { items: true }
        });

        // Step 3: Set correct unit prices and update inventory
        for (const item of createdOrder.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });

          await tx.orderItem.update({
            where: { id: item.id },
            data: { unitPrice: product?.price }
          });

          await tx.product.update({
            where: { id: item.productId },
            data: {
              inventory: {
                decrement: item.quantity
              }
            }
          });
        }

        // Return complete order with relations
        return tx.order.findUnique({
          where: { id: createdOrder.id },
          include: {
            items: { include: { product: true } },
            user: true
          }
        });
      });

      return order;
    },

    /**
     * Admin-only operation to update order status (e.g., PENDING → SHIPPED).
     */
    updateOrderStatus: async (
      _: any,
      { id, status }: { id: string; status: string },
      { prisma, user }: GraphQLContext
    ) => {
      if (!user) throw new AuthenticationError();
      if (user.role !== 'ADMIN') throw new AuthorizationError('Only admins can update order status');

      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) throw new NotFoundError('Order', id);

      return prisma.order.update({
        where: { id },
        data: { status: status as OrderStatus },
        include: {
          items: { include: { product: true } },
          user: true
        }
      });
    }
  }
};
