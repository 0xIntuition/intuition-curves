import { Elysia } from 'elysia';
import { client } from '../utils/client';
import { getCurveById } from '../utils/client';
import { ABI_CURRENT_PRICE } from '../utils/abi';

export const currentPriceRoute = new Elysia()
  .get("/currentPrice/:id/:shares", async ({ params }) => {
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
  }); 