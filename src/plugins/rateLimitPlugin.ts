import { ApolloServerPlugin } from '@apollo/server';
import { GraphQLError } from 'graphql';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export function createRateLimitPlugin(options: RateLimitOptions): ApolloServerPlugin {
  const store: RateLimitStore = {};
  const { windowMs, maxRequests, skipSuccessfulRequests = false, skipFailedRequests = false } = options;

  // Clean up expired entries every minute
  setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  }, 60000);

  return {
    async requestDidStart() {
      return {
        async didResolveOperation(requestContext) {
          const { request } = requestContext;
          
          // Get client identifier (IP address or user ID)
          const clientId = getClientId(requestContext);
          const now = Date.now();
          
          // Initialize or get existing rate limit data
          if (!store[clientId] || store[clientId].resetTime < now) {
            store[clientId] = {
              count: 1, // Start with 1 for this request
              resetTime: now + windowMs
            };
          } else {
            // Increment counter for existing window
            store[clientId].count++;
          }

          // Check if limit exceeded AFTER incrementing
          if (store[clientId].count > maxRequests) {
            const resetIn = Math.ceil((store[clientId].resetTime - now) / 1000);
            throw new GraphQLError(
              `Rate limit exceeded. Try again in ${resetIn} seconds.`,
              {
                extensions: {
                  code: 'RATE_LIMIT_EXCEEDED',
                  rateLimitReset: store[clientId].resetTime,
                  rateLimitRemaining: 0,
                  rateLimitTotal: maxRequests
                }
              }
            );
          }
        },

        async willSendResponse(requestContext) {
          const clientId = getClientId(requestContext);
          const rateLimitData = store[clientId];
          
          if (rateLimitData) {
            // Add rate limit headers to response
            const remaining = Math.max(0, maxRequests - rateLimitData.count);
            const resetTime = Math.ceil(rateLimitData.resetTime / 1000);
            
            requestContext.response.http.headers.set('X-RateLimit-Limit', maxRequests.toString());
            requestContext.response.http.headers.set('X-RateLimit-Remaining', remaining.toString());
            requestContext.response.http.headers.set('X-RateLimit-Reset', resetTime.toString());
          }

          // Handle skip options for failed/successful requests
          if (requestContext.response.body.kind === 'single') {
            const hasErrors = requestContext.response.body.singleResult.errors?.length && requestContext.response.body.singleResult.errors.length > 0;
            
            if ((skipSuccessfulRequests && !hasErrors) || (skipFailedRequests && hasErrors)) {
              // Decrement counter if we should skip this request
              if (rateLimitData && rateLimitData.count > 0) {
                rateLimitData.count--;
              }
            }
          }
        }
      };
    }
  };
}

function getClientId(requestContext: any): string {
  // Try to get user ID from context first (for authenticated requests)
  if (requestContext.contextValue?.user?.id) {
    return `user:${requestContext.contextValue.user.id}`;
  }

  // Fall back to IP address
  const forwarded = requestContext.request.http?.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             requestContext.request.http?.headers.get('x-real-ip') ||
             requestContext.request.http?.headers.get('remote-addr') ||
             'unknown';
  
  return `ip:${ip}`;
}
