import { ApolloServerPlugin } from '@apollo/server';
import { GraphQLError } from 'graphql';
import {
  getComplexity,
  fieldExtensionsEstimator,
  simpleEstimator
} from 'graphql-query-complexity';
import { visit, DocumentNode } from 'graphql';

interface QueryComplexityOptions {
  maximumComplexity: number;
  maximumDepth: number;
  scalarCost?: number;
  objectCost?: number;
  listFactor?: number;
  introspectionCost?: number;
}

// Custom depth limiting function
function checkQueryDepth(document: DocumentNode, maxDepth: number): void {
  let currentDepth = 0;
  let maxReachedDepth = 0;

  visit(document, {
    Field: {
      enter() {
        currentDepth++;
        maxReachedDepth = Math.max(maxReachedDepth, currentDepth);
        
        if (currentDepth > maxDepth) {
          throw new GraphQLError(
            `Query depth limit of ${maxDepth} exceeded, actual depth is ${currentDepth}`,
            {
              extensions: {
                code: 'QUERY_DEPTH_LIMIT_EXCEEDED',
                maxDepth,
                actualDepth: currentDepth
              }
            }
          );
        }
      },
      leave() {
        currentDepth--;
      }
    }
  });
}

export function createQueryComplexityPlugin(options: QueryComplexityOptions): ApolloServerPlugin {
  const {
    maximumComplexity,
    maximumDepth,
    scalarCost = 1,
    objectCost = 1,
    listFactor = 10,
    introspectionCost = 1000
  } = options;

  return {
    async requestDidStart() {
      return {
        async didResolveOperation(requestContext) {
          const { document, schema, request } = requestContext;
          
          if (!document || !schema) {
            return;
          }

          try {
            // Check query depth
            checkQueryDepth(document, maximumDepth);

            // Calculate query complexity
            const complexity = getComplexity({
              estimators: [
                fieldExtensionsEstimator(),
                simpleEstimator({ defaultComplexity: scalarCost })
              ],
              schema,
              query: document,
              variables: request.variables || {}
            });

            // Check if complexity exceeds limit
            if (complexity > maximumComplexity) {
              throw new GraphQLError(
                `Query complexity limit of ${maximumComplexity} exceeded, actual complexity is ${complexity}`,
                {
                  extensions: {
                    code: 'QUERY_COMPLEXITY_LIMIT_EXCEEDED',
                    maxComplexity: maximumComplexity,
                    actualComplexity: complexity
                  }
                }
              );
            }

            // Add complexity info to context for monitoring
            if (requestContext.contextValue) {
              (requestContext.contextValue as any).queryComplexity = complexity;
            }

            console.log(`Query complexity: ${complexity}/${maximumComplexity}`);

          } catch (error) {
            // Re-throw GraphQL errors
            if (error instanceof GraphQLError) {
              throw error;
            }
            
            // Handle unexpected errors
            console.error('Query complexity analysis error:', error);
            throw new GraphQLError('Query analysis failed', {
              extensions: { code: 'QUERY_ANALYSIS_ERROR' }
            });
          }
        }
      };
    }
  };
}
