import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import * as fs from 'fs';
import * as path from 'path';

// ABI fragments
const MULTIVAULT_ABI = [
  {
    inputs: [],
    name: "bondingCurveConfig",
    outputs: [{ name: "address", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

const REGISTRY_ABI = [
  {
    inputs: [],
    name: "count",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "curveAddresses",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

async function main() {
  // Initialize Viem client
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC_URL)
  });

  // Get registry address from multivault
  const registryAddress = await client.readContract({
    address: process.env.MULTIVAULT_ADDRESS as `0x${string}`,
    abi: MULTIVAULT_ABI,
    functionName: 'bondingCurveConfig'
  });

  console.log(`Found registry at: ${registryAddress}`);

  // Get number of curves
  const count = await client.readContract({
    address: registryAddress,
    abi: REGISTRY_ABI,
    functionName: 'count'
  });

  console.log(`Found ${count} curves`);

  // Create contracts directory if it doesn't exist
  const contractsDir = path.join(process.cwd(), 'contracts');
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // Fetch each curve's source code
  for (let i = 1; i <= count; i++) {
    const curveAddress = await client.readContract({
      address: registryAddress,
      abi: REGISTRY_ABI,
      functionName: 'curveAddresses',
      args: [BigInt(i)]
    });

    console.log(`\nFetching source code for curve ${i} at ${curveAddress}`);

    try {
      // Fetch source code from Basescan
      const response = await fetch(
        `https://api-sepolia.basescan.org/api?module=contract&action=getsourcecode&address=${curveAddress}&apikey=${process.env.BASESCAN_API_KEY}`
      );

      const data = await response.json();

      console.log('API Response:', JSON.stringify(data, null, 2));

      if (data.status === '1' && data.result[0].SourceCode) {
        const sourceCode = data.result[0].SourceCode;
        const contractName = data.result[0].ContractName || `Curve${i}`;

        // Write to file
        fs.writeFileSync(
          path.join(contractsDir, `${contractName}.sol`),
          sourceCode
        );

        console.log(`✅ Saved ${contractName}.sol`);
      } else {
        console.log(`❌ Failed to fetch source code for curve ${i}`);
        console.log(`Status: ${data.status}`);
        console.log(`Message: ${data.message || 'No message provided'}`);
      }
    } catch (error) {
      console.error(`Error fetching curve ${i}:`, error);
    }

    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main().catch(console.error);
