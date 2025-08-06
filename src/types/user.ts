export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  phoneNumber?: string;
  address?: Address;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: Address;
}

export interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: Address;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: Address;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UsersServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

export interface AdminStats {
  stats: {
    totalUsers: number;
    totalAdmins: number;
    regularUsers: number;
  };
  recentUsers: User[];
}
