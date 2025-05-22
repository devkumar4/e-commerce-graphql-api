# E-Commerce GraphQL API — Features & Architecture

## Overview

This project is a full-featured e-commerce backend built with Node.js, TypeScript, GraphQL, Prisma ORM, and Zod for validation. It supports user authentication, product and category management, order processing, and robust validation and authorization.

---

## 1. **Authentication & Authorization**

- **User Registration & Login**
  - Users can register with email, password, first name, and last name.
  - Passwords are securely hashed.
  - Login returns a JWT token for authenticated requests.

- **Roles**
  - Two roles: `ADMIN` and `CUSTOMER`.
  - Role-based access enforced in resolvers (e.g., only admins can create/update/delete products and categories).

- **Auth Middleware**
  - JWT-based authentication middleware injects the user into the GraphQL context.
  - Custom `@auth` directive available for schema-level protection.

---

## 2. **User Management**

- **Register**
  - Validates input using Zod.
  - Stores user in the database with hashed password.

- **Login**
  - Validates credentials.
  - Returns JWT and user info.

- **User Queries**
  - Fetch current user (`me` query).
  - Fetch users (admin only, if implemented).

---

## 3. **Product Management**

- **CRUD Operations**
  - Create, update, delete products (admin only).
  - Query single or multiple products (with pagination).

- **Product Fields**
  - Name, description, price, inventory, categoryId.
  - Category is resolved via DataLoader for efficiency.

- **Validation**
  - All product inputs validated with Zod (e.g., price must be positive).

- **Pagination**
  - Products query supports `skip` and `take` arguments for pagination.

---

## 4. **Category Management**

- **CRUD Operations**
  - Create, update, delete categories (admin only).
  - Query single or multiple categories.

- **Category Fields**
  - Name, description.

- **Validation**
  - All category inputs validated with Zod.

---

## 5. **Order Management**

- **Order Creation**
  - Customers can create orders with one or more items.
  - Each item includes productId and quantity.
  - Order input validated with Zod.

- **Order Status**
  - Orders have statuses (e.g., PENDING, SHIPPED, DELIVERED).
  - Only admins can update order status.

- **Order Queries**
  - Customers can query their own orders.
  - Admins can query all orders.
  - Orders query supports pagination.

- **Order Items**
  - Each order contains items, each referencing a product (resolved via DataLoader).

---

## 6. **Validation**

- **Zod Validation**
  - All input types (user, product, category, order) are validated using Zod schemas.
  - Custom error messages for each field.
  - Validation errors are thrown as `ValidationError` with field-level details.

---

## 7. **DataLoader Usage**

- **Batching & Caching**
  - Product DataLoader batches product fetches by ID (used in order items).
  - Category DataLoader batches category fetches by ID (used in products).
  - Improves performance and prevents N+1 query problems.

---

## 8. **Testing**

- **Unit Tests**
  - Cover validation, service logic, and resolver logic.
  - Use Jest for mocking and assertions.

- **Integration Tests**
  - Use Supertest to send real HTTP requests to the GraphQL server.
  - Cover authentication, CRUD, authorization, and error scenarios.

- **Fixtures & Setup**
  - Utility functions for creating test users, categories, products, and orders.
  - Database cleanup between tests.

---

## 9. **Error Handling**

- **Custom Errors**
  - `AuthenticationError`, `AuthorizationError`, `ValidationError`, `NotFoundError`.
  - Consistent error responses for clients.

---

## 10. **GraphQL Schema**

- **Type Definitions**
  - Modularized by entity (user, product, category, order).
  - Common types and scalars (e.g., DateTime).
  - Extensible base `Query` and `Mutation` types.

- **Directives**
  - `@auth` directive for field-level or object-level protection.

---

## 11. **Project Structure**

- `src/graphql/schema/` — GraphQL type definitions.
- `src/graphql/resolvers/` — Resolver implementations.
- `src/graphql/dataloaders/` — DataLoader implementations.
- `src/services/` — Business logic and database access.
- `src/utils/` — Validation, error handling, and helpers.
- `tests/` — Unit and integration tests, fixtures, and setup.

---

## 12. **Minute Details**

- **Password Hashing:** Uses bcrypt for secure password storage.
- **JWT:** Used for stateless authentication.
- **Prisma ORM:** Handles all database interactions.
- **Pagination:** Implemented via `skip` and `take` arguments in queries.
- **Error Messages:** Field-level error reporting for validation.
- **Test Coverage:** Includes edge cases, authorization, and validation errors.
- **Environment Variables:** Used for secrets and configuration (not shown here).

---

## 13. **End-to-End Flow Example**

1. **User registers** → receives JWT.
2. **Admin logs in** → receives JWT.
3. **Admin creates category**.
4. **Admin creates product** (linked to category).
5. **Customer logs in**.
6. **Customer creates order** (with product).
7. **Admin updates order status**.
8. **All actions validated, authorized, and tested.**

---

## 14. **Extensibility**

- Add new entities (e.g., reviews, addresses) by following the same patterns.
- Add new DataLoaders for other relations as needed.
- Extend validation and error handling as business logic grows.

---

# Conclusion

This project is a robust, scalable, and well-tested e-commerce backend, ready for production and extensible for future needs.

