import request from 'supertest';
import { createTestServer } from '../utils/setup';

describe('Product Integration', () => {
  let server: any;
  let adminToken: string;
  let customerToken: string;
  let categoryId: string;
  let productId: string;

  beforeAll(async () => {
    server = await createTestServer();

    // Register admin user
    await request(server.httpServer)
      .post('/graphql')
      .send({
        query: `
          mutation {
            register(input: {
              email: "admin@e2e.com"
              password: "Admin123!"
              firstName: "Admin"
              lastName: "User"
            }) { token user { id } }
          }
        `,
      });

    // NOTE: You must manually promote this user to ADMIN in your DB or
    // add a helper method to do this here before proceeding.

    // Login as admin
    const loginRes = await request(server.httpServer)
      .post('/graphql')
      .send({
        query: `
          mutation {
            login(email: "admin@e2e.com", password: "Admin123!") {
              token
            }
          }
        `,
      });
    adminToken = loginRes.body.data.login.token;

    // Register customer
    await request(server.httpServer)
      .post('/graphql')
      .send({
        query: `
          mutation {
            register(input: {
              email: "customer@e2e.com"
              password: "Customer123!"
              firstName: "Customer"
              lastName: "User"
            }) { token user { id } }
          }
        `,
      });

    // Login as customer
    const resLogin = await request(server.httpServer)
      .post('/graphql')
      .send({
        query: `
          mutation {
            login(email: "customer@e2e.com", password: "Customer123!") {
              token
            }
          }
        `,
      });
    customerToken = resLogin.body.data.login.token;

    // Create category
    const catRes = await request(server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: `
          mutation {
            createCategory(input: { name: "TestCat", description: "desc" }) {
              id
            }
          }
        `,
      });
    categoryId = catRes.body.data.createCategory.id;
  });

  afterAll(async () => {
    await server.stop();
  });

  it('creates a product as admin', async () => {
    const res = await request(server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: `
          mutation {
            createProduct(input: {
              name: "TestProduct"
              description: "desc"
              price: 10
              inventory: 5
              categoryId: "${categoryId}"
            }) {
              id
              name
              price
              inventory
              category { id }
            }
          }
        `,
      });

    expect(res.body.data.createProduct.name).toBe('TestProduct');
    expect(res.body.data.createProduct.price).toBe(10);
    expect(res.body.data.createProduct.inventory).toBe(5);
    expect(res.body.data.createProduct.category.id).toBe(categoryId);

    productId = res.body.data.createProduct.id;
  });

  it('fails to create a product as customer', async () => {
    // Try to create product as customer (should fail)
    const res = await request(server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        query: `
          mutation {
            createProduct(input: {
              name: "ShouldFail"
              description: "desc"
              price: 10
              inventory: 5
              categoryId: "${categoryId}"
            }) {
              id
              name
            }
          }
        `,
      });

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/Only admins can create products/);
  });

  it('queries products', async () => {
    const res = await request(server.httpServer)
      .post('/graphql')
      .send({
        query: `
          query {
            products {
              id
              name
              price
              inventory
              category { id }
            }
          }
        `,
      });

    expect(res.body.data.products.length).toBeGreaterThan(0);
    expect(res.body.data.products.some((p: { id: string }) => p.id === productId)).toBe(true);
  });

  it('updates a product as admin', async () => {
    const res = await request(server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: `
          mutation {
            updateProduct(id: "${productId}", input: {
              name: "UpdatedProduct"
              description: "updated desc"
              price: 20
              inventory: 10
              categoryId: "${categoryId}"
            }) {
              id
              name
              price
              inventory
            }
          }
        `,
      });

    expect(res.body.data.updateProduct.name).toBe('UpdatedProduct');
    expect(res.body.data.updateProduct.price).toBe(20);
    expect(res.body.data.updateProduct.inventory).toBe(10);
  });

  it('deletes a product as admin', async () => {
    const res = await request(server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: `
          mutation {
            deleteProduct(id: "${productId}")
          }
        `,
      });

    expect(res.body.data.deleteProduct).toBe(true);
  });

  it('queries products filtered by categoryId', async () => {
    const res = await request(server.httpServer)
      .post('/graphql')
      .send({
        query: `
          query {
            products(categoryId: "${categoryId}") {
              id
              name
              category { id }
            }
          }
        `,
      });

    expect(res.body.data.products.length).toBeGreaterThan(0);
    expect(res.body.data.products.every((p: { category: { id: string } }) => p.category.id === categoryId)).toBe(true);
  });

  it('queries products filtered by minPrice and maxPrice', async () => {
    // Create another product with a different price
    await request(server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: `
          mutation {
            createProduct(input: {
              name: "ExpensiveProduct"
              description: "desc"
              price: 1000
              inventory: 2
              categoryId: "${categoryId}"
            }) {
              id
              name
              price
            }
          }
        `,
      });

    // Query products with price >= 500
    const resMin = await request(server.httpServer)
      .post('/graphql')
      .send({
        query: `
          query {
            products(minPrice: 500) {
              id
              name
              price
            }
          }
        `,
      });
    expect(resMin.body.data.products.some((p: { price: number }) => p.price >= 500)).toBe(true);

    // Query products with price <= 20
    const resMax = await request(server.httpServer)
      .post('/graphql')
      .send({
        query: `
          query {
            products(maxPrice: 20) {
              id
              name
              price
            }
          }
        `,
      });
    expect(resMax.body.data.products.every((p: { price: number }) => p.price <= 20)).toBe(true);
  });
});
