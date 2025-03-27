import { Elysia } from 'elysia';
import { client } from '../utils/client';
import { getCurveById } from '../utils/client';
import { ABI_NAME } from '../utils/abi';

export const nameRoute = new Elysia()
  .get("/name/:id", async ({ params }) => {
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
  }); 