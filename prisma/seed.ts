// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('Starting database seed...');

  try {
    // Clean up existing data in reverse dependency order
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    console.log('Cleaned up existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      }
    });
    console.log(`Created admin user: ${admin.email}`);

    // Create customer user
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customer = await prisma.user.create({
      data: {
        email: 'customer@example.com',
        password: customerPassword,
        firstName: 'Customer',
        lastName: 'User',
        role: 'CUSTOMER'
      }
    });
    console.log(`Created customer user: ${customer.email}`);

    // Create categories
    const electronics = await prisma.category.create({
      data: {
        name: 'Electronics',
        description: 'Electronic devices and gadgets'
      }
    });

    const clothing = await prisma.category.create({
      data: {
        name: 'Clothing',
        description: 'Apparel for all genders and ages'
      }
    });

    console.log('Created categories');

    // Create products
    const phone = await prisma.product.create({
      data: {
        name: 'Smartphone',
        description: 'Latest model smartphone with OLED display',
        price: 699.99,
        inventory: 50,
        categoryId: electronics.id
      }
    });

    const tshirt = await prisma.product.create({
      data: {
        name: 'T-Shirt',
        description: 'Cotton t-shirt in various sizes',
        price: 19.99,
        inventory: 200,
        categoryId: clothing.id
      }
    });

    console.log('Created products');

    // Create order for customer
    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        totalAmount: phone.price,
        items: {
          create: [
            {
              productId: phone.id,
              quantity: 1,
              unitPrice: phone.price
            }
          ]
        }
      },
      include: {
        items: true
      }
    });

    console.log(`Created order for ${customer.email}`);

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
