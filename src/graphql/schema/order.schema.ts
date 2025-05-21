import { gql } from 'graphql-tag';

export const orderTypeDefs = gql`
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

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  input OrderInput {
    items: [OrderItemInput!]!
  }

  extend type Query {
    orders: [Order!]!
    order(id: ID!): Order
  }

  extend type Mutation {
    createOrder(input: OrderInput!): Order!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
  }
`;
