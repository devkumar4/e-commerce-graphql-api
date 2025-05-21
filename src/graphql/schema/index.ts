// This file will combine all GraphQL type definitions

// We'll import our type definitions here when they're created
import { userTypeDefs } from './user.schema';
// import productSchema from './product.schema';
// import categorySchema from './category.schema';
// import orderSchema from './order.schema';

// Base schema with common types and scalar definitions
const baseSchema = `#graphql
  # Custom scalars
  scalar DateTime
  
  # Base query type - must be extended by other schemas
  type Query {
    _empty: String
  }

  # Base mutation type - must be extended by other schemas
  type Mutation {
    _empty: String
  }
`;

// Export combined schema
// For now, we only have the base schema
export const typeDefs = [
  baseSchema,
  userTypeDefs,
  // productSchema,
  // categorySchema,
  // orderSchema,
];