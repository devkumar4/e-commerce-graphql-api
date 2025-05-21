// This file will combine all GraphQL type definitions

// We'll import our type definitions here when they're created
import { userTypeDefs } from './user.schema';
import { categoryTypeDefs } from './category.schema';
import { productTypeDefs } from './product.schema';
import { orderTypeDefs } from './order.schema';
import { commonTypeDefs } from './common.schema';

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
  commonTypeDefs,
  baseSchema,
  userTypeDefs,
  productTypeDefs,
  categoryTypeDefs,
  orderTypeDefs,
];