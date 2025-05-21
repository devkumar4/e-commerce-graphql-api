import { PrismaClient } from '@prisma/client';

// Avoid multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client instance
export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Function to test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    console.log('Database connection established');
    return true;
  } catch (error) {
    console.error('Unable to connect to database:', error);
    return false;
  }
};

// Gracefully disconnect from the database
export const disconnect = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log('Database connection closed');
};

export default prisma;
