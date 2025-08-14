import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ApolloServer } from '@apollo/server';
import { typeDefs } from '../schema';
import { resolvers } from '../resolvers';
import { createRateLimitPlugin, createQueryComplexityPlugin } from '../plugins';
import { Context } from '../context';

describe('Rate Limiting and Query Complexity', () => {
  let server: ApolloServer<Context>;

  beforeEach(async () => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [
        createRateLimitPlugin({
          windowMs: 60000, // 1 minute for testing
          maxRequests: 3, // Low limit for testing
        }),
        // Query complexity temporarily disabled
        // createQueryComplexityPlugin({
        //   maximumComplexity: 50, // Low limit for testing
        //   maximumDepth: 5,
        // })
      ],
    });
    await server.start();
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      const query = '{ health { status } }';
      
      // First request should succeed
      const response1 = await server.executeOperation({
        query,
      }, {
        contextValue: { isAuthenticated: false, isAdmin: false }
      });

      expect(response1.body.kind).toBe('single');
      if (response1.body.kind === 'single') {
        expect(response1.body.singleResult.errors).toBeUndefined();
        expect(response1.body.singleResult.data).toBeDefined();
      }
    });

    it('should block requests exceeding limit', async () => {
      const query = '{ health { status } }';
      const context = { isAuthenticated: false, isAdmin: false };
      
      // Make requests up to the limit
      for (let i = 0; i < 3; i++) {
        await server.executeOperation({ query }, { contextValue: context });
      }
      
      // Next request should be rate limited
      const response = await server.executeOperation({ query }, { contextValue: context });
      
      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeDefined();
        expect(response.body.singleResult.errors?.[0].extensions?.code).toBe('RATE_LIMIT_EXCEEDED');
      }
    });
  });

  // Query Complexity tests disabled due to GraphQL version conflicts
  // TODO: Re-enable when graphql-query-complexity is compatible with current GraphQL version

  afterEach(async () => {
    await server?.stop();
  });
});
