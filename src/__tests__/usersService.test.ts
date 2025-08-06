import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { UsersService, usersService } from '../services/usersService';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

describe('UsersService', () => {
  let service: UsersService;
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    };
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance);
    service = new UsersService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance with default base URL', () => {
      expect(service).toBeInstanceOf(UsersService);
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should use environment variable for base URL if provided', () => {
      const originalEnv = process.env.USERS_SERVICE_URL;
      process.env.USERS_SERVICE_URL = 'https://api.example.com';
      
      const newService = new UsersService();
      expect(newService).toBeInstanceOf(UsersService);
      
      // Restore original env
      process.env.USERS_SERVICE_URL = originalEnv;
    });
  });

  describe('healthCheck', () => {
    it('should call health endpoint and return status', async () => {
      const mockResponse = {
        data: {
          status: 'OK',
          timestamp: '2025-08-06T03:00:00.000Z',
          service: 'users-service',
        },
      };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await service.healthCheck();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Authentication methods', () => {
    describe('register', () => {
      it('should register a new user', async () => {
        const input = {
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        };
        const mockResponse = {
          data: {
            success: true,
            data: {
              token: 'jwt-token',
              user: {
                id: '123',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                role: 'user',
                createdAt: '2025-08-06T03:00:00.000Z',
                updatedAt: '2025-08-06T03:00:00.000Z',
              },
            },
          },
        };
        mockAxiosInstance.post.mockResolvedValue(mockResponse);

        const result = await service.register(input);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/register', input);
        expect(result).toEqual(mockResponse.data.data);
      });

      it('should throw error when registration fails', async () => {
        const input = {
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        };
        const mockResponse = {
          data: {
            success: false,
            error: 'Email already exists',
          },
        };
        mockAxiosInstance.post.mockResolvedValue(mockResponse);

        await expect(service.register(input)).rejects.toThrow('Email already exists');
      });
    });

    describe('login', () => {
      it('should login user with valid credentials', async () => {
        const input = {
          email: 'test@example.com',
          password: 'password123',
        };
        const mockResponse = {
          data: {
            success: true,
            data: {
              token: 'jwt-token',
              user: {
                id: '123',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                role: 'user',
                createdAt: '2025-08-06T03:00:00.000Z',
                updatedAt: '2025-08-06T03:00:00.000Z',
              },
            },
          },
        };
        mockAxiosInstance.post.mockResolvedValue(mockResponse);

        const result = await service.login(input);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/login', input);
        expect(result).toEqual(mockResponse.data.data);
      });
    });

    describe('getCurrentUser', () => {
      it('should get current user with valid token', async () => {
        const token = 'valid-jwt-token';
        const mockResponse = {
          data: {
            success: true,
            data: {
              id: '123',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              role: 'user',
              createdAt: '2025-08-06T03:00:00.000Z',
              updatedAt: '2025-08-06T03:00:00.000Z',
            },
          },
        };
        mockAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await service.getCurrentUser(token);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(result).toEqual(mockResponse.data.data);
      });
    });
  });

  describe('User CRUD methods', () => {
    const token = 'valid-jwt-token';

    describe('getAllUsers', () => {
      it('should get all users', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: [
              {
                id: '1',
                email: 'user1@example.com',
                firstName: 'User',
                lastName: 'One',
                role: 'user',
                createdAt: '2025-08-06T03:00:00.000Z',
                updatedAt: '2025-08-06T03:00:00.000Z',
              },
            ],
            count: 1,
          },
        };
        mockAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await service.getAllUsers(token);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(result).toEqual({
          users: mockResponse.data.data,
          count: mockResponse.data.count,
        });
      });
    });

    describe('getUserById', () => {
      it('should get user by ID', async () => {
        const userId = '123';
        const mockResponse = {
          data: {
            success: true,
            data: {
              id: userId,
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              role: 'user',
              createdAt: '2025-08-06T03:00:00.000Z',
              updatedAt: '2025-08-06T03:00:00.000Z',
            },
          },
        };
        mockAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await service.getUserById(userId, token);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(result).toEqual(mockResponse.data.data);
      });
    });
  });

  describe('Singleton instance', () => {
    it('should provide singleton access', () => {
      expect(usersService).toBeDefined();
      expect(typeof usersService.healthCheck).toBe('function');
      expect(typeof usersService.register).toBe('function');
      expect(typeof usersService.login).toBe('function');
    });

    it('should create instance lazily', () => {
      // Access the instance property to trigger lazy initialization
      const instance = usersService.instance;
      expect(instance).toBeInstanceOf(UsersService);
    });
  });
});
