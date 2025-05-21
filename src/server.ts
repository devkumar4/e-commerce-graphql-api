import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';
import { makeExecutableSchema } from '@graphql-tools/schema';

// Import configuration
import { apolloLoggingPlugin, corsOptions, serverConfig } from './config';
import { testConnection, disconnect } from './config/database';

// Import GraphQL schema and resolvers (will be populated in next features)
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { createContext, GraphQLContext } from './graphql/context';
import { authDirectiveTransformer } from './graphql/directives/auth.directive';

async function startServer() {
  // Create Express app and HTTP server
  const app = express();
  const httpServer = http.createServer(app);

  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('Failed to connect to database. Exiting...');
    process.exit(1);
  }

  // Create Apollo Server instance
  const rawSchema = makeExecutableSchema({ typeDefs, resolvers });
  const schema = authDirectiveTransformer(rawSchema);

  const server = new ApolloServer<GraphQLContext>({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      apolloLoggingPlugin
    ],
  });

  // Start Apollo Server
  await server.start();
  console.log('Apollo Server started');

  // Apply Express middleware
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(corsOptions),
    json(),
    expressMiddleware(server, {
      context: createContext
    })
  );

  // Add health check endpoint
  app.get('/health', (_, res) => {
    res.status(200).send({ status: 'ok' });
  });

  // Start server
  await new Promise<void>((resolve) => {
    httpServer.listen({ port: serverConfig.port }, resolve);
  });
  
  console.log(`🚀 Server ready at http://localhost:${serverConfig.port}/graphql`);
  console.log(`Environment: ${serverConfig.environment}`);

  // Handle shutdown gracefully
  const shutdownGracefully = async () => {
    console.log('Shutting down gracefully...');
    await server.stop();
    await disconnect();
    process.exit(0);
  };

  // Listen for termination signals
  process.on('SIGTERM', shutdownGracefully);
  process.on('SIGINT', shutdownGracefully);
}

// Start server and handle errors
startServer().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});