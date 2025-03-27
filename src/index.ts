import { Elysia } from "elysia";
import { currentPriceRoute } from './routes/currentPrice';
import { nameRoute } from './routes/name';
import { maxSharesRoute } from './routes/maxShares';
import { maxAssetsRoute } from './routes/maxAssets';
import { previewDepositRoute } from './routes/previewDeposit';
import { previewRedeemRoute } from './routes/previewRedeem';
import { previewWithdrawRoute } from './routes/previewWithdraw';
import { previewMintRoute } from './routes/previewMint';
import { convertToSharesRoute } from './routes/convertToShares';
import { convertToAssetsRoute } from './routes/convertToAssets';

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(currentPriceRoute)
  .use(nameRoute)
  .use(maxSharesRoute)
  .use(maxAssetsRoute)
  .use(previewDepositRoute)
  .use(previewRedeemRoute)
  .use(previewWithdrawRoute)
  .use(previewMintRoute)
  .use(convertToSharesRoute)
  .use(convertToAssetsRoute)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
