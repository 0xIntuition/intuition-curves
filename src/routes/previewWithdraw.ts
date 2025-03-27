import { Elysia } from 'elysia';
import { client } from '../utils/client';
import { getCurveById } from '../utils/client';
import { ABI_PREVIEW_WITHDRAW } from '../utils/abi';

export const previewWithdrawRoute = new Elysia()
  .get("/previewWithdraw/:id/:assets/:totalAssets/:totalShares",
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
          abi: ABI_PREVIEW_WITHDRAW,
          functionName: 'previewWithdraw',
          args: [assetsAmount, totalAssetsAmount, totalSharesAmount]
        });

        return { shares: shares.toString() };
      } catch (error) {
        console.error('Error in previewWithdraw endpoint:', error);
        return { error: error instanceof Error ? error.message : 'Failed to preview withdraw' };
      }
    },
    {
      detail: {
        tags: ['Preview'],
        summary: 'Preview withdraw',
        description: 'Calculates the number of shares that would be required to withdraw a given amount of assets',
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
              description: 'The amount of assets to withdraw'
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
            description: 'Successfully calculated withdraw preview',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    shares: {
                      type: 'string',
                      description: 'The number of shares required as a string'
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