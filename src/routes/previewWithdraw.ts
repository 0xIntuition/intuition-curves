import { Elysia } from 'elysia';
import { client } from '../utils/client';
import { getCurveById } from '../utils/client';
import { ABI_PREVIEW_WITHDRAW } from '../utils/abi';

export const previewWithdrawRoute = new Elysia()
  .get("/previewWithdraw/:id/:assets/:totalAssets/:totalShares", async ({ params }) => {
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
  }); 