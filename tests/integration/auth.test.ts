import request from 'supertest';
import { createTestServer } from '../utils/setup';

describe('Auth Integration', () => {
  let server: any;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  it('registers a new user', async () => {
    const res = await request(server.httpServer)
      .post('/graphql')
      .send({
        query: `
          mutation {
            register(input: {
              email: "testuser@example.com"
              password: "TestPassword123"
              firstName: "Test"
              lastName: "User"
            }) {
              token
              user { id email firstName lastName role }
            }
          }
        `
      });
    expect(res.body.data?.register?.user?.email).toBe('testuser@example.com');
    expect(res.body.data?.register?.token).toBeDefined();
  });

  it('logs in an existing user', async () => {
    const res = await request(server.httpServer)
      .post('/graphql')
      .send({
        query: `
          mutation {
            login(email: "testuser@example.com", password: "TestPassword123") {
              token
              user { id email role }
            }
          }
        `
      });
    expect(res.body.data?.login?.user?.email).toBe('testuser@example.com');
    expect(res.body.data?.login?.token).toBeDefined();
  });
});
