import { OrderInput } from '../../types/order.types';
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from '../../utils/error.utils';
import { GraphQLContext } from '../../types/context.types';
import { validateOrderInput } from '../../utils/validation.utils';
import { OrderStatusType } from '../../constants/order.constants';

import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} from '../../services/order.service';

export const orderResolvers = {
  Query: {
    orders: async (
      _: any,
      args: { skip?: number; take?: number },
      { user, prisma }: GraphQLContext
    ) => {
      if (!user) throw new AuthenticationError();
      // Pass userId and isAdmin to getOrders
      return getOrders(user.userId, user.role === 'ADMIN');
    },

    order: async (_: any, { id }: { id: string }, { user }: GraphQLContext) => {
      if (!user) throw new AuthenticationError();

      const order = await getOrderById(id);
      if (!order) throw new NotFoundError('Order', id);

      if (user.role !== 'ADMIN' && order.userId !== user.userId) {
        throw new AuthorizationError('Not authorized to view this order');
      }

      return order;
    },
  },

  Mutation: {
    createOrder: async (
      _: any,
      { input }: { input: OrderInput },
      { user }: GraphQLContext
    ) => {
      validateOrderInput(input);
      if (!user) throw new AuthenticationError();
      return createOrder(user.userId, input);
    },

    updateOrderStatus: async (
      _: any,
      { id, status }: { id: string; status: OrderStatusType },
      { user }: GraphQLContext
    ) => {
      if (!user) throw new AuthenticationError();
      if (user.role !== 'ADMIN')
        throw new AuthorizationError('Only admins can update order status');
      return updateOrderStatus(id, status);
    },
  },
};

interface OrderItem {
  productId: string;
  quantity: number;
  [key: string]: any;
}

interface OrderParent {
  items: OrderItem[];
  [key: string]: any;
}

interface ProductLoader {
  load: (id: string) => Promise<any>;
}

interface OrderFieldContext {
  productLoader: ProductLoader;
  [key: string]: any;
}

interface OrderUserParent {
  userId: string;
  [key: string]: any;
}

interface UserLoader {
  load: (id: string) => Promise<any>;
}

interface OrderUserFieldContext {
  userLoader: UserLoader;
  [key: string]: any;
}

export const Order = {
  items: async (
    parent: OrderParent,
    args: Record<string, unknown>,
    context: OrderFieldContext
  ): Promise<Array<OrderItem & { product: any }>> => {
    return Promise.all(
      parent.items.map(async (item: OrderItem) => ({
        ...item,
        product: await context.productLoader.load(item.productId),
      }))
    );
  },
  user: async (
    parent: OrderUserParent,
    _: Record<string, unknown>,
    context: OrderUserFieldContext
  ): Promise<any> => {
    return context.userLoader.load(parent.userId);
  },
};
