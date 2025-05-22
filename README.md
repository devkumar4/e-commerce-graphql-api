# E-Commerce GraphQL API

A robust, production-ready e-commerce backend built with Node.js, TypeScript, GraphQL, Prisma, and Zod.

---

## Features

- User authentication (JWT)
- Role-based authorization (Admin/Customer)
- Product, Category, and Order management
- Input validation with Zod
- DataLoader for efficient batching and resolve efficiently N+1 problem
- Modular GraphQL schema and resolvers
- Comprehensive unit and integration tests

---

## Setup & Usage

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/e-commerce-graphql-api.git
cd e-commerce-graphql-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the `.env.example` to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

**Example `.env.example`:**
```
# filepath: d:\e-commerce-graphql-api\.env.example
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"
JWT_SECRET="your_jwt_secret"
PORT=4000
```

### 4. Database Migration

Run Prisma migrations to set up your database schema:

```bash
npx prisma migrate dev --name init
```

To generate Prisma client:

```bash
npx prisma generate
```

### 5. Start the Server

```bash
npm run dev
```

The GraphQL Playground will be available at [http://localhost:4000/graphql](http://localhost:4000/graphql).

---

## Migration Scripts

- All migration scripts are managed by Prisma and stored in the `prisma/migrations` directory.
- Use `npx prisma migrate dev` for development and `npx prisma migrate deploy` for production.

---

## .gitignore

**Example `.gitignore`:**
```
# filepath: d:\e-commerce-graphql-api\.gitignore
node_modules/
.env
dist/
coverage/
prisma/dev.db
```

---

## Example GraphQL Queries & Mutations

### Register User

```graphql
mutation {
  register(input: {
    email: "user@example.com"
    password: "Password123"
    firstName: "John"
    lastName: "Doe"
  }) {
    token
    user { id email }
  }
}
```

### Login

```graphql
mutation {
  login(email: "user@example.com", password: "Password123") {
    token
    user { id email }
  }
}
```

### Create Category (Admin)

```graphql
mutation {
  createCategory(input: { name: "Electronics", description: "Devices" }) {
    id
    name
  }
}
```

### Create Product (Admin)

```graphql
mutation {
  createProduct(input: {
    name: "Phone"
    description: "Smartphone"
    price: 499
    inventory: 100
    categoryId: "category-id"
  }) {
    id
    name
    price
    category { id name }
  }
}
```

### Query Products (with Pagination)

```graphql
query {
  products(skip: 0, take: 10) {
    id
    name
    price
    inventory
    category { id name }
  }
}
```

### Create Order (Customer)

```graphql
mutation {
  createOrder(input: {
    items: [{ productId: "product-id", quantity: 2 }]
  }) {
    id
    status
    items {
      productId
      quantity
      product { name }
    }
  }
}
```

---

## Testing

Run all tests:

```bash
npm test
```

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/foo`)
3. Commit your changes
4. Push to the branch
5. Open a pull request

---

## License

MIT