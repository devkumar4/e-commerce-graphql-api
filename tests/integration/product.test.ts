import request from 'supertest';
import { createTestServer } from '../utils/setup';

describe('Product Integration', () => {
  let server: any;
  let adminToken: string;
  let categoryId: string;
  let productId: string;

  beforeAll(async () => {
    server = await createTestServer();
    // Register admin
    await request(server.httpServer).post('/graphql').send({
      query: `
        mutation {
          register(input: {
            email: "admin@e2e.com"
            password: "Admin123!"
            firstName: "Admin"
            lastName: "User"
          }) { token user { id } }
        }
      `
    });
    // You must manually promote this user to ADMIN in your DB or add a helper for this step.

    // Login as admin
    const res = await request(server.httpServer).post('/graphql').send({
      query: `
        mutation {
          login(email: "admin@e2e.com", password: "Admin123!") {
            token
          }
        }
      `
    });
    adminToken = res.body.data.login.token;

    // Create a category
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
        `
      });
    categoryId = catRes.body.data.createCategory.id;
  });

  afterAll(async () => {
    await server.stop();
  });

  it('creates a product', async () => {
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
            }
          }
        `
      });
    expect(res.body.data.createProduct.name).toBe('TestProduct');
    productId = res.body.data.createProduct.id;
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
            }
          }
        `
      });
    expect(res.body.data.products.length).toBeGreaterThan(0);
  });
});
