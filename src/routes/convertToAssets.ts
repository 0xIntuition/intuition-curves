import { Elysia } from 'elysia';
import { client } from '../utils/client';
import { getCurveById } from '../utils/client';
import { ABI_CONVERT_TO_ASSETS } from '../utils/abi';

export const convertToAssetsRoute = new Elysia()
  .get("/convertToAssets/:id/:shares/:totalShares/:totalAssets",
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
          abi: ABI_CONVERT_TO_ASSETS,
          functionName: 'convertToAssets',
          args: [sharesAmount, totalSharesAmount, totalAssetsAmount]
        });

        return { assets: assets.toString() };
      } catch (error) {
        console.error('Error in convertToAssets endpoint:', error);
        return { error: error instanceof Error ? error.message : 'Failed to convert to assets' };
      }
    },
    {
      detail: {
        tags: ['Conversion'],
        summary: 'Convert shares to assets',
        description: 'Converts a given number of shares to the equivalent amount of assets',
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
              description: 'The number of shares to convert'
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
            description: 'Successfully converted shares to assets',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    assets: {
                      type: 'string',
                      description: 'The equivalent amount of assets as a string'
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