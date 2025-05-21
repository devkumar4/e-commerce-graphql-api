// Ensure this file exports a function for test server setup

import { ApolloServer } from '@apollo/server';
import { typeDefs } from '../../src/graphql/schema';
import { resolvers } from '../../src/graphql/resolvers';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../src/middleware/auth.middleware';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

export async function createTestServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const prisma = new PrismaClient();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    '/graphql',
    cors(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => authMiddleware({ req, prisma })
    })
  );

  return {
    httpServer,
    stop: async () => {
      await server.stop();
      await prisma.$disconnect();
      httpServer.close();
    }
  };
}
