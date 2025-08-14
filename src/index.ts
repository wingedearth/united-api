// Load environment variables FIRST
import { config } from 'dotenv';
config();

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext } from './context';
import { createRateLimitPlugin, createQueryComplexityPlugin } from './plugins';

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // Enable Apollo Studio sandbox in production
    introspection: true,
    // Disable CSRF prevention for easier development/testing  
    csrfPrevention: false,
    plugins: [
      // Force Apollo Studio sandbox in all environments
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
      // Rate limiting: 100 requests per 15 minutes per client
      createRateLimitPlugin({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        skipSuccessfulRequests: false,
        skipFailedRequests: false
      }),
      // Query complexity and depth limits (temporarily disabled due to GraphQL version conflicts)
      // createQueryComplexityPlugin({
      //   maximumComplexity: 1000,
      //   maximumDepth: 10,
      //   scalarCost: 1,
      //   objectCost: 1,
      //   listFactor: 10,
      //   introspectionCost: 100
      // })
    ],
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: parseInt(process.env.PORT || '4000', 10) },
    context: createContext,
  });

  console.log(`🚀 Server ready at: ${url}`);
}

startServer();
