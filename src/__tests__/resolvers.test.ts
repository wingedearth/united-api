import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { resolvers } from '../resolvers';
import { Context } from '../context';
import { usersService } from '../services/usersService';

// Mock the users service
vi.mock('../services/usersService', () => ({
  usersService: {
    healthCheck: vi.fn(),
    getCurrentUser: vi.fn(),
    getAllUsers: vi.fn(),
    getUserById: vi.fn(),
    register: vi.fn(),
    login: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    promoteUser: vi.fn(),
    demoteUser: vi.fn(),
    getAdminStats: vi.fn(),
  },
}));

describe('GraphQL Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Query resolvers', () => {
    describe('health', () => {
      it('should return health status from users service', async () => {
        const mockHealth = {
          status: 'OK',
          timestamp: '2025-08-06T03:00:00.000Z',
          service: 'users-service',
        };
        vi.mocked(usersService.healthCheck).mockResolvedValue(mockHealth);

        const result = await resolvers.Query.health();

        expect(result).toEqual(mockHealth);
        expect(usersService.healthCheck).toHaveBeenCalledOnce();
      });

      it('should return fallback health when users service is unavailable', async () => {
        vi.mocked(usersService.healthCheck).mockRejectedValue(new Error('Service unavailable'));

        const result = await resolvers.Query.health();

        expect(result.status).toBe('OK');
        expect(result.service).toBe('united-api (users-service unavailable)');
        expect(result.timestamp).toBeDefined();
      });
    });

    describe('me', () => {
      it('should return current user when authenticated', async () => {
        const mockUser = {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'user' as const,
          createdAt: '2025-08-06T03:00:00.000Z',
          updatedAt: '2025-08-06T03:00:00.000Z',
        };
        const context: Context = {
          token: 'valid-token',
          user: mockUser,
          isAuthenticated: true,
          isAdmin: false,
        };

        vi.mocked(usersService.getCurrentUser).mockResolvedValue(mockUser);

        const result = await resolvers.Query.me({}, {}, context);

        expect(result).toEqual(mockUser);
        expect(usersService.getCurrentUser).toHaveBeenCalledWith('valid-token');
      });

      it('should throw error when not authenticated', async () => {
        const context: Context = {
          isAuthenticated: false,
          isAdmin: false,
        };

        await expect(resolvers.Query.me({}, {}, context)).rejects.toThrow('Authentication required');
      });
    });

    describe('users', () => {
      it('should return all users when authenticated', async () => {
        const mockUsers = [
          {
            id: '1',
            email: 'user1@example.com',
            firstName: 'User',
            lastName: 'One',
            role: 'user' as const,
            createdAt: '2025-08-06T03:00:00.000Z',
            updatedAt: '2025-08-06T03:00:00.000Z',
          },
          {
            id: '2',
            email: 'user2@example.com',
            firstName: 'User',
            lastName: 'Two',
            role: 'admin' as const,
            createdAt: '2025-08-06T03:00:00.000Z',
            updatedAt: '2025-08-06T03:00:00.000Z',
          },
        ];
        const context: Context = {
          token: 'valid-token',
          isAuthenticated: true,
          isAdmin: false,
        };

        vi.mocked(usersService.getAllUsers).mockResolvedValue({
          users: mockUsers,
          count: mockUsers.length,
        });

        const result = await resolvers.Query.users({}, {}, context);

        expect(result).toEqual(mockUsers);
        expect(usersService.getAllUsers).toHaveBeenCalledWith('valid-token');
      });
    });

    describe('user', () => {
      it('should return specific user by ID when authenticated', async () => {
        const mockUser = {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'user' as const,
          createdAt: '2025-08-06T03:00:00.000Z',
          updatedAt: '2025-08-06T03:00:00.000Z',
        };
        const context: Context = {
          token: 'valid-token',
          isAuthenticated: true,
          isAdmin: false,
        };

        vi.mocked(usersService.getUserById).mockResolvedValue(mockUser);

        const result = await resolvers.Query.user({}, { id: '123' }, context);

        expect(result).toEqual(mockUser);
        expect(usersService.getUserById).toHaveBeenCalledWith('123', 'valid-token');
      });
    });
  });

  describe('Mutation resolvers', () => {
    describe('register', () => {
      it('should register a new user', async () => {
        const input = {
          email: 'new@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
        };
        const mockResponse = {
          token: 'new-token',
          user: {
            id: '456',
            email: 'new@example.com',
            firstName: 'New',
            lastName: 'User',
            role: 'user' as const,
            createdAt: '2025-08-06T03:00:00.000Z',
            updatedAt: '2025-08-06T03:00:00.000Z',
          },
        };

        vi.mocked(usersService.register).mockResolvedValue(mockResponse);

        const result = await resolvers.Mutation.register({}, { input });

        expect(result).toEqual(mockResponse);
        expect(usersService.register).toHaveBeenCalledWith(input);
      });
    });

    describe('login', () => {
      it('should login user with valid credentials', async () => {
        const input = {
          email: 'test@example.com',
          password: 'password123',
        };
        const mockResponse = {
          token: 'auth-token',
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

        const result = await resolvers.Mutation.login({}, { input });

        expect(result).toEqual(mockResponse);
        expect(usersService.login).toHaveBeenCalledWith(input);
      });
    });

    describe('createUser', () => {
      it('should create user when authenticated', async () => {
        const input = {
          email: 'created@example.com',
          password: 'password123',
          firstName: 'Created',
          lastName: 'User',
        };
        const mockUser = {
          id: '789',
          email: 'created@example.com',
          firstName: 'Created',
          lastName: 'User',
          role: 'user' as const,
          createdAt: '2025-08-06T03:00:00.000Z',
          updatedAt: '2025-08-06T03:00:00.000Z',
        };
        const context: Context = {
          token: 'valid-token',
          isAuthenticated: true,
          isAdmin: false,
        };

        vi.mocked(usersService.createUser).mockResolvedValue(mockUser);

        const result = await resolvers.Mutation.createUser({}, { input }, context);

        expect(result).toEqual(mockUser);
        expect(usersService.createUser).toHaveBeenCalledWith(input, 'valid-token');
      });
    });
  });

  describe('Admin operations', () => {
    describe('adminStats', () => {
      it('should return admin stats when user is admin', async () => {
        const mockStats = {
          stats: {
            totalUsers: 10,
            totalAdmins: 2,
            regularUsers: 8,
          },
          recentUsers: [],
        };
        const context: Context = {
          token: 'admin-token',
          isAuthenticated: true,
          isAdmin: true,
        };

        // Mock getCurrentUser to return admin user
        vi.mocked(usersService.getCurrentUser).mockResolvedValue({
          id: '1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          createdAt: '2025-08-06T03:00:00.000Z',
          updatedAt: '2025-08-06T03:00:00.000Z',
        });
        vi.mocked(usersService.getAdminStats).mockResolvedValue(mockStats);

        const result = await resolvers.Query.adminStats({}, {}, context);

        expect(result).toEqual(mockStats);
        expect(usersService.getCurrentUser).toHaveBeenCalledWith('admin-token');
        expect(usersService.getAdminStats).toHaveBeenCalledWith('admin-token');
      });

      it('should throw error when user is not admin', async () => {
        const context: Context = {
          token: 'user-token',
          isAuthenticated: true,
          isAdmin: false,
        };

        // Mock getCurrentUser to return regular user
        vi.mocked(usersService.getCurrentUser).mockResolvedValue({
          id: '1',
          email: 'user@example.com',
          firstName: 'Regular',
          lastName: 'User',
          role: 'user',
          createdAt: '2025-08-06T03:00:00.000Z',
          updatedAt: '2025-08-06T03:00:00.000Z',
        });

        await expect(resolvers.Query.adminStats({}, {}, context)).rejects.toThrow('Failed to verify admin status');
      });
    });
  });
});
