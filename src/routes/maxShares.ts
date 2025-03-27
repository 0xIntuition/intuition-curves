import { Elysia } from 'elysia';
import { client } from '../utils/client';
import { getCurveById } from '../utils/client';
import { ABI_MAX_SHARES } from '../utils/abi';

export const maxSharesRoute = new Elysia()
  .get("/maxShares/:id",
    async ({ params }) => {
      try {
        const { id } = params;
        const curveId = parseInt(id);

        const curve = getCurveById(curveId);

        const maxShares = await client.readContract({
          address: curve.address as `0x${string}`,
          abi: ABI_MAX_SHARES,
          functionName: 'maxShares'
        });

        return { maxShares: maxShares.toString() };
      } catch (error) {
        console.error('Error in maxShares endpoint:', error);
        return { error: error instanceof Error ? error.message : 'Failed to get max shares' };
      }
    },
    {
      detail: {
        tags: ['Curves'],
        summary: 'Get maximum shares',
        description: 'Retrieves the maximum number of shares allowed for a specific curve',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
              description: 'The ID of the curve'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Successfully retrieved maximum shares',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    maxShares: {
                      type: 'string',
                      description: 'The maximum number of shares as a string'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      description: 'Error message'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  ); 