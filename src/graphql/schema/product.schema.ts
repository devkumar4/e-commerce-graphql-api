import { gql } from 'graphql-tag';

export const productTypeDefs = gql`
  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    inventory: Int!
    category: Category
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Only this input should be used for product mutations
  input ProductInput {
    name: String!
    description: String!
    price: Float!
    inventory: Int!
    categoryId: ID!
  }

  extend type Query {
    products(
      categoryId: ID
      minPrice: Float
      maxPrice: Float
      offset: Int
      limit: Int
    ): [Product!]!
    product(id: ID!): Product
  }

  extend type Mutation {
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
  }
`;
