import { ApolloServer } from '@apollo/server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { typeDefs as baseTypeDefs } from '../../src/graphql/schema';  // adjust import
import { resolvers } from '../../src/graphql/resolvers';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../src/middleware/auth.middleware';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

// Compose directive SDL separately
const authDirectiveSDL = `
  directive @auth on FIELD_DEFINITION | OBJECT
`;

export type GraphQLContext = {
  prisma: PrismaClient;
  user?: any; // Adjust user type as needed
};

export async function createTestServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const prisma = new PrismaClient();

  // Merge typeDefs properly as array of SDLs or DocumentNodes
  const mergedTypeDefs = mergeTypeDefs([authDirectiveSDL, baseTypeDefs]);

  // Build executable schema
  let schema = makeExecutableSchema({
    typeDefs: mergedTypeDefs,
    resolvers,
  });

  // If you have a schema transformer for auth directive, apply it here
  // schema = authDirectiveTransformer(schema);

  const server = new ApolloServer<GraphQLContext>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    '/graphql',
    cors(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => authMiddleware({ req, prisma }),
    })
  );

  return {
    httpServer,
    stop: async () => {
      await server.stop();
      await prisma.$disconnect();
      httpServer.close();
    },
  };
}
