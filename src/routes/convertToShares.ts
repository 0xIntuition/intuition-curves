import { Elysia } from 'elysia';
import { client } from '../utils/client';
import { getCurveById } from '../utils/client';
import { ABI_CONVERT_TO_SHARES } from '../utils/abi';

export const convertToSharesRoute = new Elysia()
  .get("/convertToShares/:id/:assets/:totalAssets/:totalShares",
    async ({ params }) => {
      try {
        const { id, assets, totalAssets, totalShares } = params;
        const curveId = parseInt(id);
        const assetsAmount = BigInt(assets);
        const totalAssetsAmount = BigInt(totalAssets);
        const totalSharesAmount = BigInt(totalShares);

        const curve = getCurveById(curveId);

        const shares = await client.readContract({
          address: curve.address as `0x${string}`,
          abi: ABI_CONVERT_TO_SHARES,
          functionName: 'convertToShares',
          args: [assetsAmount, totalAssetsAmount, totalSharesAmount]
        });

        return { shares: shares.toString() };
      } catch (error) {
        console.error('Error in convertToShares endpoint:', error);
        return { error: error instanceof Error ? error.message : 'Failed to convert to shares' };
      }
    },
    {
      detail: {
        tags: ['Conversion'],
        summary: 'Convert assets to shares',
        description: 'Converts a given amount of assets to the equivalent number of shares',
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
            name: 'assets',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              description: 'The amount of assets to convert'
            }
          },
          {
            name: 'totalAssets',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              description: 'The current total amount of assets in the curve'
            }
          },
          {
            name: 'totalShares',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              description: 'The current total number of shares in the curve'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Successfully converted assets to shares',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    shares: {
                      type: 'string',
                      description: 'The equivalent number of shares as a string'
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