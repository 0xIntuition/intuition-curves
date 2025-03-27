import { Elysia } from 'elysia';
import { client } from '../utils/client';
import { getCurveById } from '../utils/client';
import { ABI_NAME } from '../utils/abi';

export const nameRoute = new Elysia()
  .get("/name/:id",
    async ({ params }) => {
      try {
        const { id } = params;
        const curveId = parseInt(id);

        const curve = getCurveById(curveId);

        const name = await client.readContract({
          address: curve.address as `0x${string}`,
          abi: ABI_NAME,
          functionName: 'name'
        });

        return { name };
      } catch (error) {
        console.error('Error in name endpoint:', error);
        return { error: error instanceof Error ? error.message : 'Failed to get curve name' };
      }
    },
    {
      detail: {
        tags: ['Curves'],
        summary: 'Get curve name',
        description: 'Retrieves the name of a specific curve by its ID',
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
            description: 'Successfully retrieved curve name',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'The name of the curve'
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