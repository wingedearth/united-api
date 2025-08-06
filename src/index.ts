// Load environment variables FIRST
import { config } from 'dotenv';
config();

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext } from './context';

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: createContext,
  });

  console.log(`🚀 Server ready at: ${url}`);
}

startServer();
