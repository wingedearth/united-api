// Load environment variables FIRST
import { config } from 'dotenv';
config();

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext } from './context';

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
    ],
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: parseInt(process.env.PORT || '4000', 10) },
    context: createContext,
  });

  console.log(`🚀 Server ready at: ${url}`);
}

startServer();
