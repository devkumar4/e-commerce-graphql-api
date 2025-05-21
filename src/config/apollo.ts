import { ApolloServerOptions } from '@apollo/server';
import { BaseContext } from '@apollo/server/dist/esm/externalTypes/context';

import { typeDefs } from '../graphql/schema';
import { resolvers } from '../graphql/resolvers';

// Apollo Server configuration
export const apolloOptions: ApolloServerOptions<BaseContext> = {
  typeDefs,
  resolvers,

  // Enable introspection always for local/dev debugging
  introspection: true,

  // Unified error formatting
  formatError: (formattedError, error) => {
    // Log internal server errors
    if (formattedError.extensions?.code === 'INTERNAL_SERVER_ERROR') {
      console.error('GraphQL ERROR:', error);
    }

    // Mask internal errors in production
    if (
      process.env.NODE_ENV === 'production' &&
      formattedError.extensions?.code === 'INTERNAL_SERVER_ERROR'
    ) {
      return {
        message: 'An internal error occurred',
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      };
    }

    return formattedError;
  },
};

// Apollo plugin for lifecycle logging
export const apolloLoggingPlugin = {
  // Server startup/shutdown logs
  serverWillStart: async () => {
    console.log('Apollo Server starting up...');
    return {
      async serverWillStop() {
        console.log('Apollo Server shutting down...');
      }
    };
  },

  // Log request duration and GraphQL errors in dev
  async requestDidStart() {
    const start = Date.now();
    return {
      async willSendResponse({ response }: { response: any }) {
        const duration = Date.now() - start;
        console.log(`Request completed in ${duration}ms`);

        if (process.env.NODE_ENV === 'development') {
          if (response.body.kind === 'single') {
            const { errors } = response.body.singleResult;
            if (errors?.length) {
              console.log('GraphQL response errors:', errors);
            }
          }
        }
      }
    };
  }
};
