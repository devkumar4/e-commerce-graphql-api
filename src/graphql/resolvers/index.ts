// This file will combine all GraphQL resolvers

// Import GraphQL scalars
import { GraphQLScalarType, Kind } from 'graphql';

// We'll import our resolver modules here when they're created
// import userResolvers from './user.resolver';
// import productResolvers from './product.resolver';
// import categoryResolvers from './category.resolver';
// import orderResolvers from './order.resolver';

// Define scalar resolvers
const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime scalar type',
  
  // Convert output Date to ISO string
  serialize(value: unknown) {
    return value instanceof Date ? value.toISOString() : null;
  },
  
  // Parse ISO string to Date for variables
  parseValue(value: unknown) {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return null;
  },
  
  // Parse literal ISO string (in query) to Date
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

// Define base resolvers with scalars
const baseResolvers = {
  DateTime: dateTimeScalar,
  
  // Empty resolvers to satisfy the base schema
  Query: {
    _empty: () => ''
  },
  
  Mutation: {
    _empty: () => ''
  }
};

// Combine all resolvers
export const resolvers = [
  baseResolvers,
  // userResolvers,
  // productResolvers,
  // categoryResolvers,
  // orderResolvers,
];