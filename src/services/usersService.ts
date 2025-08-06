import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  RegisterInput,
  LoginInput,
  AuthResponse,
  UsersServiceResponse,
  AdminStats,
} from '../types/user';

export class UsersService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.USERS_SERVICE_URL || 'http://localhost:3000';
    console.log('🔗 UsersService connecting to:', this.baseURL);
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      const token = config.headers?.['authorization'] || config.headers?.['Authorization'];
      if (token && !config.headers?.['Authorization']) {
        config.headers['Authorization'] = token;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Users Service Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          code: error.code,
        });
        throw error;
      }
    );
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; service: string }> {
    const response: AxiosResponse<{ status: string; timestamp: string; service: string }> = 
      await this.client.get('/health');
    return response.data;
  }

  // Authentication endpoints
  async register(input: RegisterInput): Promise<AuthResponse> {
    const response: AxiosResponse<UsersServiceResponse<AuthResponse>> = 
      await this.client.post('/api/auth/register', input);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Registration failed');
    }
    
    return response.data.data;
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const response: AxiosResponse<UsersServiceResponse<AuthResponse>> = 
      await this.client.post('/api/auth/login', input);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Login failed');
    }
    
    return response.data.data;
  }

  async getCurrentUser(token: string): Promise<User> {
    const response: AxiosResponse<UsersServiceResponse<User>> = 
      await this.client.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get current user');
    }
    
    return response.data.data;
  }

  // User CRUD endpoints
  async getAllUsers(token: string): Promise<{ users: User[]; count: number }> {
    const response: AxiosResponse<UsersServiceResponse<User[]>> = 
      await this.client.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get users');
    }
    
    return {
      users: response.data.data,
      count: response.data.count || response.data.data.length
    };
  }

  async getUserById(id: string, token: string): Promise<User> {
    const response: AxiosResponse<UsersServiceResponse<User>> = 
      await this.client.get(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'User not found');
    }
    
    return response.data.data;
  }

  async createUser(input: CreateUserInput, token: string): Promise<User> {
    const response: AxiosResponse<UsersServiceResponse<User>> = 
      await this.client.post('/api/users', input, {
        headers: { Authorization: `Bearer ${token}` }
      });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create user');
    }
    
    return response.data.data;
  }

  async updateUser(id: string, input: UpdateUserInput, token: string): Promise<User> {
    const response: AxiosResponse<UsersServiceResponse<User>> = 
      await this.client.put(`/api/users/${id}`, input, {
        headers: { Authorization: `Bearer ${token}` }
      });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update user');
    }
    
    return response.data.data;
  }

  async deleteUser(id: string, token: string): Promise<User> {
    const response: AxiosResponse<UsersServiceResponse<User>> = 
      await this.client.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to delete user');
    }
    
    return response.data.data;
  }

  // Admin endpoints
  async promoteUser(id: string, token: string): Promise<User> {
    const response: AxiosResponse<UsersServiceResponse<User>> = 
      await this.client.patch(`/api/admin/${id}/promote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to promote user');
    }
    
    return response.data.data;
  }

  async demoteUser(id: string, token: string): Promise<User> {
    const response: AxiosResponse<UsersServiceResponse<User>> = 
      await this.client.patch(`/api/admin/${id}/demote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to demote user');
    }
    
    return response.data.data;
  }

  async getAdminStats(token: string): Promise<AdminStats> {
    const response: AxiosResponse<UsersServiceResponse<AdminStats>> = 
      await this.client.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get admin stats');
    }
    
    return response.data.data;
  }
}

// Export singleton instance (lazy initialization)
let _usersService: UsersService | null = null;
export const usersService = {
  get instance(): UsersService {
    if (!_usersService) {
      _usersService = new UsersService();
    }
    return _usersService;
  },
  // Proxy all methods to the instance
  healthCheck: () => usersService.instance.healthCheck(),
  register: (input: RegisterInput) => usersService.instance.register(input),
  login: (input: LoginInput) => usersService.instance.login(input),
  getCurrentUser: (token: string) => usersService.instance.getCurrentUser(token),
  getAllUsers: (token: string) => usersService.instance.getAllUsers(token),
  getUserById: (id: string, token: string) => usersService.instance.getUserById(id, token),
  createUser: (input: CreateUserInput, token: string) => usersService.instance.createUser(input, token),
  updateUser: (id: string, input: UpdateUserInput, token: string) => usersService.instance.updateUser(id, input, token),
  deleteUser: (id: string, token: string) => usersService.instance.deleteUser(id, token),
  promoteUser: (id: string, token: string) => usersService.instance.promoteUser(id, token),
  demoteUser: (id: string, token: string) => usersService.instance.demoteUser(id, token),
  getAdminStats: (token: string) => usersService.instance.getAdminStats(token),
};
