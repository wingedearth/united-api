import jwt from 'jsonwebtoken';
import { User } from './types/user';

export interface Context {
  token?: string;
  user?: User;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export async function createContext({ req }: { req: any }): Promise<Context> {
  const context: Context = {
    isAuthenticated: false,
    isAdmin: false,
  };

  try {
    // Extract token from Authorization header (case-insensitive)
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      context.token = token;

      // Decode JWT token to get basic info
      // Note: We're not verifying the token here since the users-service will do that
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.userId) {
        // Store minimal info from JWT, full user data will be fetched by resolvers
        context.user = {
          id: decoded.userId,
          email: '', // Will be populated by resolvers when needed
          firstName: '',
          lastName: '',
          role: 'user', // Default, will be updated by resolvers
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        context.isAuthenticated = true;
        // isAdmin will be determined when we fetch full user data
      }
    }
  } catch (error) {
    console.warn('Error creating context:', error);
    // Context remains unauthenticated
  }

  return context;
}
