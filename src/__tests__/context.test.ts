import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createContext } from '../context';
import jwt from 'jsonwebtoken';

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    decode: vi.fn(),
  },
}));

describe('Context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createContext', () => {
    it('should create unauthenticated context when no authorization header', async () => {
      const req = {
        headers: {},
      };

      const context = await createContext({ req });

      expect(context.isAuthenticated).toBe(false);
      expect(context.isAdmin).toBe(false);
      expect(context.token).toBeUndefined();
      expect(context.user).toBeUndefined();
    });

    it('should create unauthenticated context when authorization header is malformed', async () => {
      const req = {
        headers: {
          authorization: 'InvalidFormat token',
        },
      };

      const context = await createContext({ req });

      expect(context.isAuthenticated).toBe(false);
      expect(context.isAdmin).toBe(false);
      expect(context.token).toBeUndefined();
      expect(context.user).toBeUndefined();
    });

    it('should create authenticated context with valid JWT token', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      const mockDecoded = {
        userId: '123456789',
        iat: 1754452379,
        exp: 1755057179,
      };

      const req = {
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      };

      vi.mocked(jwt.decode).mockReturnValue(mockDecoded);

      const context = await createContext({ req });

      expect(context.isAuthenticated).toBe(true);
      expect(context.token).toBe(mockToken);
      expect(context.user).toEqual({
        id: '123456789',
        email: '',
        firstName: '',
        lastName: '',
        role: 'user',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
    });

    it('should handle invalid JWT token gracefully', async () => {
      const mockToken = 'invalid.jwt.token';
      const req = {
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      };

      vi.mocked(jwt.decode).mockReturnValue(null);

      const context = await createContext({ req });

      expect(context.isAuthenticated).toBe(false);
      expect(context.token).toBe(mockToken);
      expect(context.user).toBeUndefined();
    });

    it('should handle JWT decode error gracefully', async () => {
      const mockToken = 'malformed.token';
      const req = {
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      };

      vi.mocked(jwt.decode).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const context = await createContext({ req });

      expect(context.isAuthenticated).toBe(false);
      expect(context.token).toBe(mockToken);
      expect(context.user).toBeUndefined();
    });

    it('should extract userId from JWT payload correctly', async () => {
      const mockToken = 'valid.jwt.token';
      const mockDecoded = {
        userId: 'user-id-123',
        iat: 1754452379,
        exp: 1755057179,
        someOtherField: 'ignored',
      };

      const req = {
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      };

      vi.mocked(jwt.decode).mockReturnValue(mockDecoded);

      const context = await createContext({ req });

      expect(context.isAuthenticated).toBe(true);
      expect(context.user?.id).toBe('user-id-123');
    });

    it('should handle JWT without userId field', async () => {
      const mockToken = 'token.without.userid';
      const mockDecoded = {
        iat: 1754452379,
        exp: 1755057179,
        // No userId field
      };

      const req = {
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      };

      vi.mocked(jwt.decode).mockReturnValue(mockDecoded);

      const context = await createContext({ req });

      expect(context.isAuthenticated).toBe(false);
      expect(context.user).toBeUndefined();
    });

    it('should handle case-insensitive authorization header', async () => {
      const mockToken = 'test.token';
      const mockDecoded = {
        userId: '123',
        iat: 1754452379,
        exp: 1755057179,
      };

      const req = {
        headers: {
          Authorization: `Bearer ${mockToken}`, // Capital A
        },
      };

      vi.mocked(jwt.decode).mockReturnValue(mockDecoded);

      const context = await createContext({ req });

      expect(context.isAuthenticated).toBe(true);
      expect(context.token).toBe(mockToken);
    });
  });
});
