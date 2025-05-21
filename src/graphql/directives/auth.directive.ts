import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';

// Transformer to enforce @auth directive at the field level
export function authDirectiveTransformer(schema: GraphQLSchema): GraphQLSchema {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(schema, fieldConfig, 'auth')?.[0];

      if (authDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;

        // Wrap resolver with auth check
        fieldConfig.resolve = async function (...args) {
          const context = args[2];
          if (!context.user) {
            throw new Error('Not authenticated');
          }
          return resolve.apply(this, args);
        };
      }

      return fieldConfig;
    },
  });
}
