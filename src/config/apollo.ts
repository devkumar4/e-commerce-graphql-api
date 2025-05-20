import { ApolloServerOptions } from '@apollo/server';
import { BaseContext } from '@apollo/server/dist/esm/externalTypes/context';

// Import GraphQL schema here (will be implemented later)
// import { typeDefs } from '../graphql/schema';
// import { resolvers } from '../graphql/resolvers';

// Custom Apollo Server options
export const apolloOptions: ApolloServerOptions<BaseContext> = {
  // typeDefs and resolvers will be imported when created
  // typeDefs,
  // resolvers,
  
  // Enable introspection in all environments for development
  // In production, it should be disabled for security
  introspection: true,
  
  // Custom formatError function to standardize error responses
  formatError: (formattedError, error) => {
    // Log server errors but not client errors
    if (formattedError.extensions?.code === 'INTERNAL_SERVER_ERROR') {
      console.error('GraphQL ERROR:', error);
    }

    // Don't expose internal server errors to clients in production
    if (
      process.env.NODE_ENV === 'production' &&
      formattedError.extensions?.code === 'INTERNAL_SERVER_ERROR'
    ) {
      return {
        message: 'An internal error occurred',
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      };
    }

    // Return the formatted error
    return formattedError;
  },
};

// Apollo custom plugin for logging
export const apolloLoggingPlugin = {
  // Server startup
  serverWillStart: async () => {
    console.log('Apollo Server starting up...');
    return {
      async serverWillStop() {
        console.log('Apollo Server shutting down...');
      }
    };
  },
  
  // Request lifecycle
  async requestDidStart() {
    const start = Date.now();
    return {
      async willSendResponse({ response }) {
        const duration = Date.now() - start;
        console.log(`Request completed in ${duration}ms`);
        
        // Log detailed info in development
        if (process.env.NODE_ENV === 'development') {
          if (response.body.kind === 'single') {
            const { errors } = response.body.singleResult;
            if (errors && errors.length > 0) {
              console.log('GraphQL response errors:', errors);
            }
          }
        }
      }
    };
  }
};