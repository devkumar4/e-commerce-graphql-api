import request from 'supertest';
import { createTestServer } from '../utils/setup';

describe('Category Integration', () => {
  let server: any;
  let adminToken: string;

  beforeAll(async () => {
    server = await createTestServer();

    // Register admin user
    const registerRes = await request(server.httpServer).post('/graphql').send({
      query: `
        mutation {
          register(input: {
            email: "admin@cat.com"
            password: "Admin123!"
            firstName: "Admin"
            lastName: "Cat"
          }) {
            token
            user { id }
          }
        }
      `
    });

    if (registerRes.body.errors) {
      console.error('Register errors:', registerRes.body.errors);
    }

    // NOTE: If you need to promote to admin in DB manually here, do it.

    // Login admin user
    const loginRes = await request(server.httpServer).post('/graphql').send({
      query: `
        mutation {
          login(email: "admin@cat.com", password: "Admin123!") {
            token
          }
        }
      `
    });

    if (loginRes.body.errors) {
      console.error('Login errors:', loginRes.body.errors);
    }

    adminToken = loginRes.body.data?.login?.token;
    if (!adminToken) {
      throw new Error('Admin login failed, token not received');
    }
  });

  afterAll(async () => {
    await server.stop();
  });

  it('creates a category as admin', async () => {
    const res = await request(server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: `
          mutation {
            createCategory(input: { name: "Cat1", description: "desc" }) {
              id
              name
            }
          }
        `
      });
    expect(res.body.data?.createCategory?.name).toBe('Cat1');
  });

  it('queries categories', async () => {
    const res = await request(server.httpServer)
      .post('/graphql')
      .send({
        query: `
          query {
            categories {
              id
              name
            }
          }
        `
      });
    expect(res.body.data?.categories.length).toBeGreaterThan(0);
  });
});
