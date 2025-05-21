// Combine all GraphQL resolvers
import { GraphQLScalarType, Kind } from 'graphql';

import { userResolvers } from './user.resolver';
import { categoryResolvers } from './category.resolver';
import { productResolvers } from './product.resolver';
import { orderResolvers } from './order.resolver';

// Custom scalar for ISO DateTime
const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime scalar type',

  serialize(value: unknown) {
    return value instanceof Date ? value.toISOString() : null;
  },

  parseValue(value: unknown) {
    if (typeof value === 'string') return new Date(value);
    return null;
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return new Date(ast.value);
    return null;
  }
});

// Base resolvers with scalars and placeholder Query/Mutation
const baseResolvers = {
  DateTime: dateTimeScalar,
  Query: { _empty: () => '' },
  Mutation: { _empty: () => '' }
};

// Merge all module-specific resolvers
export const resolvers = [
  baseResolvers,
  userResolvers,
  productResolvers,
  categoryResolvers,
  orderResolvers
];
