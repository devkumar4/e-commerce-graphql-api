import { gql } from 'graphql-tag';

export const categoryTypeDefs = gql`
  type Category {
    id: ID!
    name: String!
    description: String!
    products: [Product!]
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input CategoryInput {
    name: String!
    description: String!
  }

  extend type Query {
    categories: [Category!]!
    category(id: ID!): Category
  }

  extend type Mutation {
    createCategory(input: CategoryInput!): Category!
    updateCategory(id: ID!, input: CategoryInput!): Category!
  }
`;
