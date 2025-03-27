import { Elysia } from 'elysia';
import { client } from '../utils/client';
import { getCurveById } from '../utils/client';
import { ABI_CURRENT_PRICE } from '../utils/abi';

export const currentPriceRoute = new Elysia()
  .get("/currentPrice/:id/:shares",
    async ({ params }) => {
      try {
        const { id, shares } = params;
        const curveId = parseInt(id);
        const totalShares = BigInt(shares);

        const curve = getCurveById(curveId);

        const price = await client.readContract({
          address: curve.address as `0x${string}`,
          abi: ABI_CURRENT_PRICE,
          functionName: 'currentPrice',
          args: [totalShares]
        });

        return { price: price.toString() };
      } catch (error) {
        console.error('Error in currentPrice endpoint:', error);
        return { error: error instanceof Error ? error.message : 'Failed to get current price' };
      }
    },
    {
      detail: {
        tags: ['Curves'],
        summary: 'Get current price',
        description: 'Retrieves the current price for a specific curve and number of shares',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
              description: 'The ID of the curve'
            }
          },
          {
            name: 'shares',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              description: 'The number of shares to calculate the price for'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Successfully retrieved current price',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    price: {
                      type: 'string',
                      description: 'The current price as a string'
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