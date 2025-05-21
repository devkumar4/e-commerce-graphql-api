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

export async function createTestCategory(name: string, description: string = 'Test category description') {
    return prisma.category.create({
        data: {
            name,
            description
        }
    });
}

export async function createTestProduct(data: {
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
    inventory?: number;
    categoryId: number;
}) {
    return prisma.product.create({
        data: {
            name: data.name,
            price: data.price,
            description: data.description ?? '',
            inventory: data.inventory ?? 0,
            category: { connect: { id: String(data.categoryId) } }
        }
    });
}

export async function createTestOrder(userId: number) {
    return prisma.order.create({
        data: {
            user: { connect: { id: String(userId) } },
            totalAmount: 0
        }
    });
}

export async function createTestOrderItem(orderId: number, productId: number, quantity: number, unitPrice: number = 0) {
    return prisma.orderItem.create({
        data: {
            order: { connect: { id: String(orderId) } },
            product: { connect: { id: String(productId) } },
            quantity,
            unitPrice
        }
    });
}


