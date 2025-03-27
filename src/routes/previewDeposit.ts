import { Elysia } from 'elysia';
import { client } from '../utils/client';
import { getCurveById } from '../utils/client';
import { ABI_PREVIEW_DEPOSIT } from '../utils/abi';

export const previewDepositRoute = new Elysia()
  .get("/previewDeposit/:id/:assets/:totalAssets/:totalShares",
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
          abi: ABI_PREVIEW_DEPOSIT,
          functionName: 'previewDeposit',
          args: [assetsAmount, totalAssetsAmount, totalSharesAmount]
        });

        return { shares: shares.toString() };
      } catch (error) {
        console.error('Error in previewDeposit endpoint:', error);
        return { error: error instanceof Error ? error.message : 'Failed to preview deposit' };
      }
    },
    {
      detail: {
        tags: ['Preview'],
        summary: 'Preview deposit',
        description: 'Calculates the number of shares that would be received for a given amount of assets deposit',
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
              description: 'The amount of assets to deposit'
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
            description: 'Successfully calculated deposit preview',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    shares: {
                      type: 'string',
                      description: 'The number of shares that would be received as a string'
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