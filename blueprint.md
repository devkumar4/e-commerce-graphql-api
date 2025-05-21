# E-Commerce GraphQL API TypeScript Blueprint

## 1. Project Overview

This blueprint outlines our approach to building the e-commerce GraphQL API with Apollo Server and PostgreSQL as required in the assignment, using TypeScript.

### Tech Stack
- **Backend**: Node.js (v16+) with TypeScript 
- **Database**: PostgreSQL 13+
- **API Framework**: Apollo Server v4
- **ORM**: Prisma
- **Authentication**: JWT
- **Testing**: Jest with ts-jest

## 2. Project Structure

```
e-commerce-graphql-api/
├── src/
│   ├── config/                       # Configuration settings
│   │   ├── apollo.ts                 # Apollo Server configuration
│   │   ├── auth.ts                   # Auth configuration
│   │   ├── database.ts               # Database connection
│   │   └── index.ts                  # Config exports
│   │
│   ├── graphql/
│   │   ├── directives/               # Custom GraphQL directives
│   │   │   └── auth.directive.ts     # Authentication directive
│   │   │
│   │   ├── resolvers/                # Query and mutation resolvers
│   │   │   ├── user.resolver.ts      # User-related resolvers
│   │   │   ├── product.resolver.ts   # Product-related resolvers
│   │   │   ├── category.resolver.ts  # Category-related resolvers
│   │   │   ├── order.resolver.ts     # Order-related resolvers
│   │   │   └── index.ts              # Resolver aggregation
│   │   │
│   │   ├── schema/                   # GraphQL type definitions
│   │   │   ├── user.schema.ts        # User type definitions
│   │   │   ├── product.schema.ts     # Product type definitions
│   │   │   ├── category.schema.ts    # Category type definitions
│   │   │   ├── order.schema.ts       # Order type definitions
│   │   │   ├── common.schema.ts      # Shared types/scalars
│   │   │   └── index.ts              # Schema aggregation
│   │   │
│   │   ├── dataloaders/              # For solving N+1 query problems
│   │   │   ├── product.loader.ts     # Product dataloader
│   │   │   ├── category.loader.ts    # Category dataloader
│   │   │   └── index.ts              # Loader aggregation
│   │   │
│   │   └── context.ts                # GraphQL context setup
│   │
│   ├── middleware/                   # Express/Apollo middleware
│   │   ├── auth.middleware.ts        # JWT validation middleware
│   │   ├── error.middleware.ts       # Error handling middleware
│   │   └── index.ts                  # Middleware exports
│   │
│   ├── services/                     # Business logic layer
│   │   ├── user.service.ts           # User-related business logic
│   │   ├── product.service.ts        # Product-related business logic
│   │   ├── category.service.ts       # Category-related business logic
│   │   ├── order.service.ts          # Order-related business logic
│   │   └── auth.service.ts           # Authentication service
│   │
│   ├── utils/                        # Helper functions
│   │   ├── jwt.utils.ts              # JWT helpers
│   │   ├── validation.utils.ts       # Input validation helpers
│   │   ├── error.utils.ts            # Error handling utilities
│   │   └── pagination.utils.ts       # Pagination helpers
│   │
│   ├── constants/                    # Application constants
│   │   ├── roles.constants.ts        # User role constants
│   │   ├── order.constants.ts        # Order status constants
│   │   └── error.constants.ts        # Error message constants
│   │
│   ├── types/                        # TypeScript type definitions
│   │   ├── context.types.ts          # Context type definitions
│   │   ├── user.types.ts             # User-related types
│   │   ├── product.types.ts          # Product-related types
│   │   ├── order.types.ts            # Order-related types
│   │   ├── graphql.ts                # Generated GraphQL types
│   │   └── index.ts                  # Type exports
│   │
│   └── server.ts                     # Server entry point
│
├── prisma/
│   ├── schema.prisma                 # Prisma schema definition
│   ├── migrations/                   # Database migrations
│   └── seed.ts                       # Database seed script
│
├── tests/
│   ├── unit/                         # Unit tests
│   │   ├── resolvers/                # Resolver tests
│   │   │   ├── user.resolver.test.ts # User resolver tests
│   │   │   └── product.resolver.test.ts # Product resolver tests
│   │   └── services/                 # Service tests
│   │       ├── user.service.test.ts  # User service tests
│   │       └── product.service.test.ts # Product service tests
│   │
│   ├── integration/                  # Integration tests
│   │   ├── auth.test.ts              # Auth flow tests
│   │   ├── products.test.ts          # Product API tests
│   │   └── orders.test.ts            # Order API tests
│   │
│   └── utils/                        # Test utilities
│       ├── setup.ts                  # Test setup
│       └── fixtures.ts               # Test data
│
├── scripts/                          # Utility scripts
│   ├── generate-types.ts             # Generate TS types from schema
│   └── seed-database.ts              # Seed script runner
│
├── docs/                             # Additional documentation
│   ├── queries/                      # Example GraphQL queries
│   └── schema/                       # Schema documentation
│
├── .env.example                      # Environment variables template
├── .eslintrc.js                      # ESLint configuration
├── .prettierrc                       # Prettier configuration
├── .gitignore                        # Git ignore file
├── tsconfig.json                     # TypeScript configuration
├── jest.config.ts                    # Jest configuration
├── package.json                      # NPM package definition
└── README.md                         # Project documentation
```

## 3. Database Schema

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid()) @db.Uuid
  email     String   @unique
  password  String
  firstName String
  lastName  String
  role      UserRole @default(CUSTOMER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orders    Order[]
}

enum UserRole {
  ADMIN
  CUSTOMER
}

model Product {
  id          String      @id @default(uuid()) @db.Uuid
  name        String
  description String
  price       Decimal     @db.Decimal(10, 2)
  inventory   Int
  categoryId  String      @db.Uuid
  category    Category    @relation(fields: [categoryId], references: [id])
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  orderItems  OrderItem[]
}

model Category {
  id          String    @id @default(uuid()) @db.Uuid
  name        String    @unique
  description String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  products    Product[]
}

model Order {
  id          String      @id @default(uuid()) @db.Uuid
  userId      String      @db.Uuid
  user        User        @relation(fields: [userId], references: [id])
  status      OrderStatus @default(PENDING)
  totalAmount Decimal     @db.Decimal(10, 2)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  items       OrderItem[]
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model OrderItem {
  id        String   @id @default(uuid()) @db.Uuid
  orderId   String   @db.Uuid
  order     Order    @relation(fields: [orderId], references: [id])
  productId String   @db.Uuid
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int
  unitPrice Decimal  @db.Decimal(10, 2)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 4. GraphQL Schema Design

### Types

```graphql
# Base scalar types and date-time scalar
scalar DateTime

# User types
type User {
  id: ID!
  email: String!
  firstName: String!
  lastName: String!
  role: UserRole!
  createdAt: DateTime!
  updatedAt: DateTime!
  orders: [Order!]
}

enum UserRole {
  ADMIN
  CUSTOMER
}

# Product types
type Product {
  id: ID!
  name: String!
  description: String!
  price: Float!
  inventory: Int!
  category: Category
  createdAt: DateTime!
  updatedAt: DateTime!
}

# Category types
type Category {
  id: ID!
  name: String!
  description: String!
  products: [Product!]
  createdAt: DateTime!
  updatedAt: DateTime!
}

# Order types
type Order {
  id: ID!
  user: User!
  status: OrderStatus!
  totalAmount: Float!
  items: [OrderItem!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

type OrderItem {
  id: ID!
  product: Product!
  quantity: Int!
  unitPrice: Float!
}

# Auth types
type AuthPayload {
  token: String!
  user: User!
}
```

### Queries

```graphql
type Query {
  # Product queries
  products(
    categoryId: ID
    minPrice: Float
    maxPrice: Float
    offset: Int
    limit: Int
  ): [Product!]!
  product(id: ID!): Product
  
  # Category queries
  categories: [Category!]!
  category(id: ID!): Category
  
  # Order queries
  orders: [Order!]! # Admin: all orders, Customer: own orders
  order(id: ID!): Order
  
  # User queries
  me: User
  users: [User!]! # Admin only
}
```

### Mutations

```graphql
type Mutation {
  # Auth mutations
  register(input: RegisterInput!): AuthPayload!
  login(email: String!, password: String!): AuthPayload!
  
  # Product mutations (admin only)
  createProduct(input: ProductInput!): Product!
  updateProduct(id: ID!, input: ProductInput!): Product!
  deleteProduct(id: ID!): Boolean!
  
  # Category mutations (admin only)
  createCategory(input: CategoryInput!): Category!
  updateCategory(id: ID!, input: CategoryInput!): Category!
  
  # Order mutations
  createOrder(input: OrderInput!): Order!
  updateOrderStatus(id: ID!, status: OrderStatus!): Order! # Admin only
}
```

### Input Types

```graphql
input RegisterInput {
  email: String!
  password: String!
  firstName: String!
  lastName: String!
}

input ProductInput {
  name: String!
  description: String!
  price: Float!
  inventory: Int!
  categoryId: ID!
}

input CategoryInput {
  name: String!
  description: String!
}

input OrderItemInput {
  productId: ID!
  quantity: Int!
}

input OrderInput {
  items: [OrderItemInput!]!
}
```

## 5. TypeScript Types

### Context Types

```typescript
// src/types/context.types.ts
import { PrismaClient } from '@prisma/client';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

export interface GraphQLContext {
  prisma: PrismaClient;
  user?: AuthUser;
}
```

### Input Types

```typescript
// src/types/user.types.ts
export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// src/types/product.types.ts
export interface ProductInput {
  name: string;
  description: string;
  price: number;
  inventory: number;
  categoryId: string;
}

// src/types/category.types.ts
export interface CategoryInput {
  name: string;
  description: string;
}

// src/types/order.types.ts
export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface OrderInput {
  items: OrderItemInput[];
}
```

## 6. Implementation Plan (Feature by Feature)

### Feature 1: Project Setup
1. Initialize Node.js project with TypeScript
2. Configure tsconfig.json
3. Install dependencies
4. Setup PostgreSQL connection
5. Configure Prisma with initial schema
6. Setup basic Apollo Server with TypeScript support
7. **Commit**: "Initial TypeScript project setup"

### Feature 2: User Authentication
1. Create User schema in Prisma
2. Define TypeScript interfaces for User
3. Generate types from GraphQL schema
4. Implement user resolvers
   - Register mutation
   - Login mutation
5. Add JWT token generation and validation
6. Create authentication middleware
7. **Commit**: "Implement user authentication with TypeScript"

### Feature 3: Category Management
1. Create Category schema in Prisma
2. Define TypeScript interfaces for Category
3. Implement category resolvers
   - Query categories
   - Query single category
   - Create category (admin)
   - Update category (admin)
4. Add authorization checks
5. **Commit**: "Implement category management with TypeScript"

### Feature 4: Product Management
1. Create Product schema in Prisma
2. Define TypeScript interfaces for Product
3. Implement product resolvers
   - Query products with filtering
   - Query single product
   - Create product (admin)
   - Update product (admin)
   - Delete product (admin)
4. Add filtering functionality
5. Add authorization checks
6. **Commit**: "Implement product management with TypeScript"

### Feature 5: Order Management
1. Create Order and OrderItem schemas in Prisma
2. Define TypeScript interfaces for Order and OrderItem
3. Implement order resolvers
   - Create order
   - Query orders (with authorization)
   - Query single order (with authorization)
   - Update order status (admin)
4. Add inventory validation on order creation
5. Add authorization checks
6. **Commit**: "Implement order management with TypeScript"

### Feature 6: Error Handling & Input Validation
1. Create custom error handling utilities
2. Add input validation with type checking
3. Implement consistent error responses
4. **Commit**: "Add error handling and input validation with TypeScript"

### Feature 7: Testing & Documentation
1. Configure Jest for TypeScript testing
2. Create and run tests for all endpoints
3. Create README.md with setup instructions
4. Add example GraphQL queries and mutations
5. Create .env.example file
6. **Commit**: "Add documentation and TypeScript testing"

## 7. Testing Strategy

For testing with TypeScript, we'll use Jest with ts-jest:

1. **Unit Testing**
   - Test resolver functions
   - Test service layer functions
   - Test utility functions

2. **Integration Testing**
   - Test GraphQL endpoints with supertest
   - Test authentication flows
   - Test CRUD operations

3. **Manual Testing**
   - Use Apollo Studio or GraphQL Playground for manual testing
   - Test authorization with different user roles

## 8. Error Handling Approach

For consistent error handling with TypeScript:

```typescript
// src/utils/errors.ts
export class BaseError extends Error {
  code: string;
  additionalInfo: Record<string, any>;

  constructor(message: string, code: string, additionalInfo: Record<string, any> = {}) {
    super(message);
    this.code = code;
    this.additionalInfo = additionalInfo;
  }

  toGraphQLError() {
    return {
      message: this.message,
      extensions: {
        code: this.code,
        ...this.additionalInfo
      }
    };
  }
}

export class AuthenticationError extends BaseError {
  constructor(message: string = 'Not authenticated') {
    super(message, 'UNAUTHENTICATED');
  }
}

export class AuthorizationError extends BaseError {
  constructor(message: string = 'Not authorized') {
    super(message, 'FORBIDDEN');
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, fields: Record<string, string>) {
    super(message, 'BAD_USER_INPUT', { fields });
  }
}

export class NotFoundError extends BaseError {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`, 'NOT_FOUND');
  }
}
```

## 9. Authentication Implementation

```typescript
// src/utils/jwt.utils.ts
import jwt from 'jsonwebtoken';
import { AuthUser } from '../types/context.types';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (user: { id: string; email: string; role: string }): string => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token: string): AuthUser | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role as 'ADMIN' | 'CUSTOMER'
    };
  } catch (error) {
    return null;
  }
};

// src/middleware/auth.middleware.ts
import { Request } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { GraphQLContext } from '../types/context.types';
import { PrismaClient } from '@prisma/client';

interface ContextParams {
  req: Request;
  prisma: PrismaClient;
}

export const authMiddleware = async ({ req, prisma }: ContextParams): Promise<GraphQLContext> => {
  const context: GraphQLContext = { prisma };
  
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (decoded) {
      context.user = decoded;
    }
  }
  
  return context;
};
```

## 10. Resolver Implementation Example

```typescript
// src/graphql/resolvers/product.resolver.ts
import { AuthenticationError, AuthorizationError, NotFoundError } from '../../utils/errors';
import { GraphQLContext } from '../../types/context.types';
import { ProductInput } from '../../types/product.types';

interface ProductArgs {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  offset?: number;
  limit?: number;
}

interface ProductByIdArgs {
  id: string;
}

interface CreateProductArgs {
  input: ProductInput;
}

interface UpdateProductArgs {
  id: string;
  input: ProductInput;
}

interface DeleteProductArgs {
  id: string;
}

export const productResolvers = {
  Query: {
    products: async (
      _: any, 
      { categoryId, minPrice, maxPrice, offset, limit }: ProductArgs, 
      { prisma }: GraphQLContext
    ) => {
      const where: any = {};
      
      if (categoryId) {
        where.categoryId = categoryId;
      }
      
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
      }
      
      return prisma.product.findMany({
        where,
        skip: offset || 0,
        take: limit || 10,
        include: { category: true }
      });
    },
    
    product: async (_: any, { id }: ProductByIdArgs, { prisma }: GraphQLContext) => {
      const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true }
      });
      
      if (!product) {
        throw new NotFoundError('Product', id);
      }
      
      return product;
    }
  },
  
  Mutation: {
    createProduct: async (_: any, { input }: CreateProductArgs, { prisma, user }: GraphQLContext) => {
      // Check authentication
      if (!user) {
        throw new AuthenticationError();
      }
      
      // Check authorization
      if (user.role !== 'ADMIN') {
        throw new AuthorizationError('Only admins can create products');
      }
      
      // Create product
      return prisma.product.create({
        data: {
          ...input,
          price: parseFloat(input.price.toString())
        },
        include: { category: true }
      });
    },
    
    updateProduct: async (_: any, { id, input }: UpdateProductArgs, { prisma, user }: GraphQLContext) => {
      // Check authentication
      if (!user) {
        throw new AuthenticationError();
      }
      
      // Check authorization
      if (user.role !== 'ADMIN') {
        throw new AuthorizationError('Only admins can update products');
      }
      
      // Check if product exists
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        throw new NotFoundError('Product', id);
      }
      
      // Update product
      return prisma.product.update({
        where: { id },
        data: {
          ...input,
          price: parseFloat(input.price.toString())
        },
        include: { category: true }
      });
    },
    
    deleteProduct: async (_: any, { id }: DeleteProductArgs, { prisma, user }: GraphQLContext) => {
      // Check authentication
      if (!user) {
        throw new AuthenticationError();
      }
      
      // Check authorization
      if (user.role !== 'ADMIN') {
        throw new AuthorizationError('Only admins can delete products');
      }
      
      // Check if product exists
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        throw new NotFoundError('Product', id);
      }
      
      // Delete product
      await prisma.product.delete({ where: { id } });
      return true;
    }
  }
};
```

## 11. TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "lib": ["es2018", "esnext.asynciterable"],
    "skipLibCheck": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "resolveJsonModule": true,
    "baseUrl": "."
  },
  "exclude": ["node_modules"],
  "include": ["./src/**/*.ts"]
}
```

## 12. Jest Configuration

```typescript
// jest.config.ts
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  verbose: true,
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageDirectory: './coverage',
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/utils/setup.ts']
};

export default config;
```

## 13. Server Setup Example

```typescript
// src/server.ts
import dotenv from 'dotenv';
dotenv.config();

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';
import { PrismaClient } from '@prisma/client';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { authMiddleware } from './middleware/auth.middleware';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const prisma = new PrismaClient();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (error) => {
      console.error(error);
      return {
        message: error.message,
        extensions: error.extensions || { code: 'INTERNAL_SERVER_ERROR' }
      };
    }
  });

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => authMiddleware({ req, prisma })
    })
  );

  const PORT = process.env.PORT || 4000;
  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
});
```