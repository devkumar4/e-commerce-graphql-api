# E-Commerce GraphQL API

A TypeScript-based e-commerce GraphQL API built with Apollo Server, Prisma, and PostgreSQL.

## Features

- User authentication with JWT
- Product management
- Category management
- Order processing
- Role-based authorization (Admin/Customer)

## Tech Stack

- **Backend**: Node.js with TypeScript
- **Database**: PostgreSQL
- **API Framework**: Apollo Server v4
- **ORM**: Prisma
- **Authentication**: JWT
- **Testing**: Jest with ts-jest

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL (v13+)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Copy the environment example file and update it with your values
   ```bash
   cp .env.example .env
   ```
4. Set up the database
   ```bash
   npm run migrate
   ```
5. Generate Prisma client
   ```bash
   npm run generate
   ```
6. Start the development server
   ```bash
   npm run dev
   ```

### Scripts

- `npm run build` - Build the project
- `npm run start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run migrate` - Run Prisma migrations
- `npm run generate` - Generate Prisma client
- `npm run studio` - Open Prisma Studio
- `npm run seed` - Seed the database

## Project Structure

```
e-commerce-graphql-api/
├── src/
│   ├── config/                       # Configuration settings
│   ├── graphql/                      # GraphQL schema and resolvers
│   ├── middleware/                   # Express/Apollo middleware
│   ├── services/                     # Business logic layer
│   ├── utils/                        # Helper functions
│   ├── constants/                    # Application constants
│   ├── types/                        # TypeScript type definitions
│   └── server.ts                     # Server entry point
├── prisma/
│   ├── schema.prisma                 # Prisma schema definition
│   ├── migrations/                   # Database migrations
│   └── seed.ts                       # Database seed script
└── tests/                            # Test files
```

## API Documentation

The GraphQL API documentation can be accessed through the Apollo Studio Explorer at `http://localhost:4000/graphql` when the server is running.