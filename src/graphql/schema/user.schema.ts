import { gql } from 'graphql-tag';

export const userTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum UserRole {
    ADMIN
    CUSTOMER
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
  }

  extend type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }

  extend type Query {
    me: User @auth
    users: [User!]! @auth
  }
`;
