import { createPublicClient, http } from 'viem';
import { anvil } from 'viem/chains';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Viem client
export const client = createPublicClient({
  chain: anvil,
  transport: http('http://127.0.0.1:8545')
});

// Load deployment info
export const deploymentInfo = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'deployments/anvil-deployment.json'), 'utf8')
);

// Helper function to get curve by ID
export const getCurveById = (id: number) => {
  const curve = deploymentInfo.curves.find((c: any) => c.id === id);
  if (!curve) {
    throw new Error(`Curve with ID ${id} not found`);
  }
  return curve;
}; 