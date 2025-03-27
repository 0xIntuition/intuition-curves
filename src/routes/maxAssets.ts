import { Elysia } from 'elysia';
import { client } from '../utils/client';
import { getCurveById } from '../utils/client';
import { ABI_MAX_ASSETS } from '../utils/abi';

export const maxAssetsRoute = new Elysia()
  .get("/maxAssets/:id",
    async ({ params }) => {
      try {
        const { id } = params;
        const curveId = parseInt(id);

        const curve = getCurveById(curveId);

        const maxAssets = await client.readContract({
          address: curve.address as `0x${string}`,
          abi: ABI_MAX_ASSETS,
          functionName: 'maxAssets'
        });

        return { maxAssets: maxAssets.toString() };
      } catch (error) {
        console.error('Error in maxAssets endpoint:', error);
        return { error: error instanceof Error ? error.message : 'Failed to get max assets' };
      }
    },
    {
      detail: {
        tags: ['Curves'],
        summary: 'Get maximum assets',
        description: 'Retrieves the maximum number of assets allowed for a specific curve',
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
            description: 'Successfully retrieved maximum assets',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    maxAssets: {
                      type: 'string',
                      description: 'The maximum number of assets as a string'
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