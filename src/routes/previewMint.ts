import { Elysia } from 'elysia';
import { client } from '../utils/client';
import { getCurveById } from '../utils/client';
import { ABI_PREVIEW_MINT } from '../utils/abi';

export const previewMintRoute = new Elysia()
  .get("/previewMint/:id/:shares/:totalShares/:totalAssets", async ({ params }) => {
    try {
      const { id, shares, totalShares, totalAssets } = params;
      const curveId = parseInt(id);
      const sharesAmount = BigInt(shares);
      const totalSharesAmount = BigInt(totalShares);
      const totalAssetsAmount = BigInt(totalAssets);

      const curve = getCurveById(curveId);

      const assets = await client.readContract({
        address: curve.address as `0x${string}`,
        abi: ABI_PREVIEW_MINT,
        functionName: 'previewMint',
        args: [sharesAmount, totalSharesAmount, totalAssetsAmount]
      });

      return { assets: assets.toString() };
    } catch (error) {
      console.error('Error in previewMint endpoint:', error);
      return { error: error instanceof Error ? error.message : 'Failed to preview mint' };
    }
  }); 