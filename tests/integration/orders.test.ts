import request from 'supertest';
import { createTestServer } from '../utils/setup';

describe('Order Integration', () => {
  let server: any;
  let adminToken: string;
  let customerToken: string;
  let categoryId: string;
  let productId: string;
  let orderId: string;

  beforeAll(async () => {
    server = await createTestServer();

    // Register admin
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
    const resAdmin = await request(server.httpServer)
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
    adminToken = resAdmin.body.data.login.token;

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
    const resCustomer = await request(server.httpServer)
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
    customerToken = resCustomer.body.data.login.token;

    // Create category as admin
    const catRes = await request(server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: `
          mutation {
            createCategory(input: { name: "OrderCat", description: "desc" }) {
              id
            }
          }
        `,
      });
    categoryId = catRes.body.data.createCategory.id;

    // Create product as admin
    const prodRes = await request(server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: `
          mutation {
            createProduct(input: {
              name: "OrderProduct"
              description: "desc"
              price: 50
              inventory: 10
              categoryId: "${categoryId}"
            }) {
              id
            }
          }
        `,
      });
    productId = prodRes.body.data.createProduct.id;
  });

  afterAll(async () => {
    await server.stop();
  });

  it('creates an order as customer', async () => {
    const res = await request(server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        query: `
          mutation {
            createOrder(input: {
              items: [
                { productId: "${productId}", quantity: 2 }
              ]
            }) {
              id
              status
              totalAmount
              items {
                id
                quantity
                unitPrice
                product { id }
              }
            }
          }
        `,
      });

    expect(res.body.data.createOrder.status).toBe('PENDING');
    expect(res.body.data.createOrder.items[0].quantity).toBe(2);

    orderId = res.body.data.createOrder.id;
  });

  it('queries orders as customer', async () => {
    const res = await request(server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        query: `
          query {
            orders {
              id
              status
              items { id }
            }
          }
        `,
      });

    expect(res.body.data.orders.length).toBeGreaterThan(0);
    expect(res.body.data.orders.some((o: { id: string }) => o.id === orderId)).toBe(true);
  });

  it('updates order status as admin', async () => {
    const res = await request(server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: `
          mutation {
            updateOrderStatus(id: "${orderId}", status: SHIPPED) {
              id
              status
            }
          }
        `,
      });

    expect(res.body.data.updateOrderStatus.status).toBe('SHIPPED');
  });

  it('fails to update order status as customer', async () => {
    const res = await request(server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        query: `
          mutation {
            updateOrderStatus(id: "${orderId}", status: DELIVERED) {
              id
              status
            }
          }
        `,
      });

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/Only admins can update order status/);
  });
});
