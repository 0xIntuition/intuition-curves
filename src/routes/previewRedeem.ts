import { Elysia } from 'elysia';
import { client } from '../utils/client';
import { getCurveById } from '../utils/client';
import { ABI_PREVIEW_REDEEM } from '../utils/abi';

export const previewRedeemRoute = new Elysia()
  .get("/previewRedeem/:id/:shares/:totalShares/:totalAssets",
    async ({ params }) => {
      try {
        const { id, shares, totalShares, totalAssets } = params;
        const curveId = parseInt(id);
        const sharesAmount = BigInt(shares);
        const totalSharesAmount = BigInt(totalShares);
        const totalAssetsAmount = BigInt(totalAssets);

        const curve = getCurveById(curveId);

        const assets = await client.readContract({
          address: curve.address as `0x${string}`,
          abi: ABI_PREVIEW_REDEEM,
          functionName: 'previewRedeem',
          args: [sharesAmount, totalSharesAmount, totalAssetsAmount]
        });

        return { assets: assets.toString() };
      } catch (error) {
        console.error('Error in previewRedeem endpoint:', error);
        return { error: error instanceof Error ? error.message : 'Failed to preview redeem' };
      }
    },
    {
      detail: {
        tags: ['Preview'],
        summary: 'Preview redeem',
        description: 'Calculates the amount of assets that would be received for redeeming a given number of shares',
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
              description: 'The number of shares to redeem'
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
          },
          {
            name: 'totalAssets',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              description: 'The current total amount of assets in the curve'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Successfully calculated redeem preview',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    assets: {
                      type: 'string',
                      description: 'The amount of assets that would be received as a string'
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