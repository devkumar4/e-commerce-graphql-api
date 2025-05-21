import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function clearDatabase() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}

export async function createTestUser(email: string, role: 'ADMIN' | 'CUSTOMER' = 'CUSTOMER') {
  return prisma.user.create({
    data: {
      email,
      password: 'hashedpassword',
      firstName: 'Test',
      lastName: 'User',
      role
    }
  });
}

export async function createTestCategory(name: string) {
  return prisma.category.create({
    data: {
      name
    }
  });
}

export async function createTestProduct(data: {
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}) {
  return prisma.product.create({
    data
  });
}

export async function createTestOrder(userId: number) {
  return prisma.order.create({
    data: {
      user: { connect: { id: userId } },
      total: 0
    }
  });
}

export async function createTestOrderItem(orderId: number, productId: number, quantity: number) {
  return prisma.orderItem.create({
    data: {
      order: { connect: { id: orderId } },
      product: { connect: { id: productId } },
      quantity
    }
  });
}

// ...add more helpers as needed...
