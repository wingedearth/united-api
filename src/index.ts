import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// Basic GraphQL schema
const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;

// Basic resolvers
const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL!',
  },
};

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀 Server ready at: ${url}`);
}

startServer();
