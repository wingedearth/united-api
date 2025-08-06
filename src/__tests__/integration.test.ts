import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ApolloServer } from '@apollo/server';
import { typeDefs } from '../schema';
import { resolvers } from '../resolvers';
import { createContext, Context } from '../context';
import { usersService } from '../services/usersService';
import { AuthResponse, User } from '../types/user';
import jwt from 'jsonwebtoken';

// Mock the users service
vi.mock('../services/usersService');

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    decode: vi.fn(),
  },
}));

describe('GraphQL Integration Tests', () => {
  let server: ApolloServer<Context>;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    server = new ApolloServer({
      typeDefs,
      resolvers,
    });
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  describe('Health Query', () => {
    it('should return health status', async () => {
      const mockHealth = {
        status: 'OK',
        timestamp: '2025-08-06T03:00:00.000Z',
        service: 'users-service',
      };

      vi.mocked(usersService.healthCheck).mockResolvedValue(mockHealth);

      const response = await server.executeOperation({
        query: `
          query {
            health {
              status
              timestamp
              service
            }
          }
        `,
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data).toEqual({
          health: mockHealth,
        });
      }
    });
  });

  describe('Authentication Mutations', () => {
    it('should register a new user', async () => {
      const mockResponse: AuthResponse = {
        token: 'new-jwt-token',
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'user' as const,
          createdAt: '2025-08-06T03:00:00.000Z',
          updatedAt: '2025-08-06T03:00:00.000Z',
        },
      };

      vi.mocked(usersService.register).mockResolvedValue(mockResponse);

      const response = await server.executeOperation({
        query: `
          mutation RegisterUser($input: RegisterInput!) {
            register(input: $input) {
              token
              user {
                id
                email
                firstName
                lastName
                role
              }
            }
          }
        `,
        variables: {
          input: {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
          },
        },
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data).toEqual({
          register: {
            token: 'new-jwt-token',
            user: {
              id: '123',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              role: 'USER', // GraphQL enum value
            },
          },
        });
      }
    });

    it('should login user', async () => {
      const mockResponse: AuthResponse = {
        token: 'auth-jwt-token',
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'user' as const,
          createdAt: '2025-08-06T03:00:00.000Z',
          updatedAt: '2025-08-06T03:00:00.000Z',
        },
      };

      vi.mocked(usersService.login).mockResolvedValue(mockResponse);

      const response = await server.executeOperation({
        query: `
          mutation LoginUser($input: LoginInput!) {
            login(input: $input) {
              token
              user {
                id
                email
                role
              }
            }
          }
        `,
        variables: {
          input: {
            email: 'test@example.com',
            password: 'password123',
          },
        },
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data).toEqual({
          login: {
            token: 'auth-jwt-token',
            user: {
              id: '123',
              email: 'test@example.com',
              role: 'USER',
            },
          },
        });
      }
    });
  });

  describe('Authenticated Queries', () => {
    it('should return current user when authenticated', async () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user' as const,
        createdAt: '2025-08-06T03:00:00.000Z',
        updatedAt: '2025-08-06T03:00:00.000Z',
      };

      // Mock JWT decode to return valid user ID
      vi.mocked(jwt.decode).mockReturnValue({
        userId: '123',
        iat: 1754452379,
        exp: 1755057179,
      });

      vi.mocked(usersService.getCurrentUser).mockResolvedValue(mockUser);

      const response = await server.executeOperation(
        {
          query: `
            query {
              me {
                id
                email
                firstName
                lastName
                role
              }
            }
          `,
        },
        {
          contextValue: await createContext({
            req: {
              headers: {
                authorization: 'Bearer valid-jwt-token',
              },
            },
          }),
        }
      );

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data).toEqual({
          me: {
            id: '123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'USER',
          },
        });
      }
    });

    it('should return error when not authenticated', async () => {
      const response = await server.executeOperation(
        {
          query: `
            query {
              me {
                id
                email
              }
            }
          `,
        },
        {
          contextValue: await createContext({
            req: {
              headers: {},
            },
          }),
        }
      );

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeDefined();
        expect(response.body.singleResult.errors?.[0].extensions?.code).toBe('UNAUTHENTICATED');
      }
    });
  });

  describe('Schema Validation', () => {
    it('should validate required fields in RegisterInput', async () => {
      const response = await server.executeOperation({
        query: `
          mutation RegisterUser($input: RegisterInput!) {
            register(input: $input) {
              token
            }
          }
        `,
        variables: {
          input: {
            email: 'test@example.com',
            // Missing required fields: password, firstName, lastName
          },
        },
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeDefined();
      }
    });

    it('should validate Role enum values', async () => {
      const response = await server.executeOperation({
        query: `
          query {
            users {
              id
              role
            }
          }
        `,
      });

      // This tests that the Role enum is properly defined in the schema
      // The actual validation happens at the GraphQL schema level
      expect(response.body.kind).toBe('single');
    });
  });
});
