import request from 'supertest';
import { createTestServer } from '../utils/setup';

describe('Category Integration', () => {
  let server: any;
  let adminToken: string;
  let categoryId: string;

  beforeAll(async () => {
    server = await createTestServer();
    await request(server.httpServer).post('/graphql').send({
      query: `
        mutation {
          register(input: {
            email: "admin@cat.com"
            password: "Admin123!"
            firstName: "Admin"
            lastName: "Cat"
          }) { token user { id } }
        }
      `
    });
    // Promote to ADMIN in DB as needed
    const res = await request(server.httpServer).post('/graphql').send({
      query: `
        mutation {
          login(email: "admin@cat.com", password: "Admin123!") {
            token
          }
        }
      `
    });
    adminToken = res.body.data.login.token;
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
    expect(res.body.data.createCategory.name).toBe('Cat1');
    categoryId = res.body.data.createCategory.id;
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
    expect(res.body.data.categories.length).toBeGreaterThan(0);
  });
});
