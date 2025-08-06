import { GraphQLError } from 'graphql';
import { usersService } from '../services/usersService';
import { Context } from '../context';
import {
  RegisterInput,
  LoginInput,
  CreateUserInput,
  UpdateUserInput,
} from '../types/user';

// Helper function to require authentication
function requireAuth(context: Context) {
  if (!context.isAuthenticated || !context.token) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.token;
}

// Helper function to require admin role
async function requireAdmin(context: Context) {
  const token = requireAuth(context);
  try {
    // Fetch current user to check admin status
    const currentUser = await usersService.getCurrentUser(token);
    if (currentUser.role !== 'admin') {
      throw new GraphQLError('Admin access required', {
        extensions: { code: 'FORBIDDEN' },
      });
    }
    return token;
  } catch (error) {
    throw new GraphQLError('Failed to verify admin status', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}

export const resolvers = {
  Query: {
    // Health check (public)
    health: async () => {
      try {
        // Try to check users-service health
        return await usersService.healthCheck();
      } catch (error) {
        // If users-service is unavailable, return GraphQL server health
        console.warn('Users service unavailable, returning GraphQL server health');
        return {
          status: 'OK',
          timestamp: new Date().toISOString(),
          service: 'united-api (users-service unavailable)',
        };
      }
    },

    // Get current user (requires authentication)
    me: async (_: any, __: any, context: Context) => {
      const token = requireAuth(context);
      try {
        return await usersService.getCurrentUser(token);
      } catch (error) {
        throw new GraphQLError('Failed to get current user', {
          extensions: { code: 'USER_FETCH_ERROR' },
        });
      }
    },

    // Get all users (requires authentication)
    users: async (_: any, __: any, context: Context) => {
      const token = requireAuth(context);
      try {
        const result = await usersService.getAllUsers(token);
        return result.users;
      } catch (error) {
        throw new GraphQLError('Failed to fetch users', {
          extensions: { code: 'USERS_FETCH_ERROR' },
        });
      }
    },

    // Get user by ID (requires authentication)
    user: async (_: any, { id }: { id: string }, context: Context) => {
      const token = requireAuth(context);
      try {
        return await usersService.getUserById(id, token);
      } catch (error) {
        throw new GraphQLError(`Failed to fetch user with id: ${id}`, {
          extensions: { code: 'USER_FETCH_ERROR' },
        });
      }
    },

    // Get admin statistics (requires admin role)
    adminStats: async (_: any, __: any, context: Context) => {
      const token = await requireAdmin(context);
      try {
        return await usersService.getAdminStats(token);
      } catch (error) {
        throw new GraphQLError('Failed to fetch admin statistics', {
          extensions: { code: 'ADMIN_STATS_ERROR' },
        });
      }
    },
  },

  Mutation: {
    // Register new user (public)
    register: async (_: any, { input }: { input: RegisterInput }) => {
      try {
        return await usersService.register(input);
      } catch (error) {
        throw new GraphQLError('Registration failed', {
          extensions: { code: 'REGISTRATION_ERROR' },
        });
      }
    },

    // Login user (public)
    login: async (_: any, { input }: { input: LoginInput }) => {
      try {
        return await usersService.login(input);
      } catch (error) {
        throw new GraphQLError('Login failed', {
          extensions: { code: 'LOGIN_ERROR' },
        });
      }
    },

    // Create user (requires authentication)
    createUser: async (_: any, { input }: { input: CreateUserInput }, context: Context) => {
      const token = requireAuth(context);
      try {
        return await usersService.createUser(input, token);
      } catch (error) {
        throw new GraphQLError('Failed to create user', {
          extensions: { code: 'USER_CREATE_ERROR' },
        });
      }
    },

    // Update user (requires authentication)
    updateUser: async (
      _: any,
      { id, input }: { id: string; input: UpdateUserInput },
      context: Context
    ) => {
      const token = requireAuth(context);
      try {
        return await usersService.updateUser(id, input, token);
      } catch (error) {
        throw new GraphQLError(`Failed to update user with id: ${id}`, {
          extensions: { code: 'USER_UPDATE_ERROR' },
        });
      }
    },

    // Delete user (requires authentication)
    deleteUser: async (_: any, { id }: { id: string }, context: Context) => {
      const token = requireAuth(context);
      try {
        return await usersService.deleteUser(id, token);
      } catch (error) {
        throw new GraphQLError(`Failed to delete user with id: ${id}`, {
          extensions: { code: 'USER_DELETE_ERROR' },
        });
      }
    },

    // Promote user to admin (requires admin role)
    promoteUser: async (_: any, { id }: { id: string }, context: Context) => {
      const token = await requireAdmin(context);
      try {
        return await usersService.promoteUser(id, token);
      } catch (error) {
        throw new GraphQLError(`Failed to promote user with id: ${id}`, {
          extensions: { code: 'USER_PROMOTE_ERROR' },
        });
      }
    },

    // Demote admin to user (requires admin role)
    demoteUser: async (_: any, { id }: { id: string }, context: Context) => {
      const token = await requireAdmin(context);
      try {
        return await usersService.demoteUser(id, token);
      } catch (error) {
        throw new GraphQLError(`Failed to demote user with id: ${id}`, {
          extensions: { code: 'USER_DEMOTE_ERROR' },
        });
      }
    },
  },

  // Enum resolvers
  Role: {
    USER: 'user',
    ADMIN: 'admin',
  },
};
