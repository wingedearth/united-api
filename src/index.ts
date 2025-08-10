// Load environment variables FIRST
import { config } from 'dotenv';
config();

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext } from './context';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // Enable Apollo Studio sandbox in production
    introspection: true,
    // Disable CSRF prevention for easier development/testing
    csrfPrevention: false,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Enable Apollo Studio landing page
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });

  await server.start();
  
  const port = parseInt(process.env.PORT || '4000', 10);
  
  // Apply CORS and JSON middleware
  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: createContext,
    }) as any
  );
  
  // Health check endpoint
  app.get('/', (req, res) => {
    res.json({ 
      message: 'United API GraphQL Server', 
      graphql: '/graphql',
      health: 'OK'
    });
  });

  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
  console.log(`🚀 Server ready at: http://localhost:${port}/graphql`);
}

startServer();
