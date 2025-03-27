import { createPublicClient, http, decodeAbiParameters } from 'viem';
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

interface DeploymentInfo {
  address: string;
  name: string;
  constructorArgs: any[];
  constructorArgTypes: string[];
}

function decodeConstructorArgs(hexArgs: string, abi: any[]): { args: any[], types: string[] } {
  try {
    // Find the constructor in the ABI
    const constructor = abi.find(item => item.type === 'constructor');
    if (!constructor) {
      return { args: [], types: [] };
    }

    // Get the input parameters
    const inputParams = constructor.inputs || [];
    const types = inputParams.map((param: { type: string }) => param.type);

    // Remove the '0x' prefix if present and ensure we have valid hex data
    const cleanHexArgs = hexArgs.startsWith('0x') ? hexArgs.slice(2) : hexArgs;

    // Decode the arguments
    const args = decodeAbiParameters(inputParams, `0x${cleanHexArgs}` as `0x${string}`);

    return { args, types };
  } catch (error) {
    console.error('Error decoding constructor arguments:', error);
    // Log the hex arguments for debugging
    console.log('Hex arguments:', hexArgs);
    return { args: [], types: [] };
  }
}

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

  // Array to store deployment information
  const deploymentInfo: DeploymentInfo[] = [];

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
      // Fetch source code and ABI from Basescan
      const response = await fetch(
        `https://api-sepolia.basescan.org/api?module=contract&action=getsourcecode&address=${curveAddress}&apikey=${process.env.BASESCAN_API_KEY}`
      );

      const data = await response.json();

      if (data.status === '1' && data.result[0].SourceCode) {
        let sourceCode = data.result[0].SourceCode;
        const contractName = data.result[0].ContractName || `Curve${i}`;
        const abi = JSON.parse(data.result[0].ABI);

        // Decode constructor arguments
        const { args, types } = decodeConstructorArgs(
          data.result[0].ConstructorArguments,
          abi
        );

        // Store deployment information
        deploymentInfo.push({
          address: curveAddress,
          name: contractName,
          constructorArgs: args,
          constructorArgTypes: types
        });

        // Handle JSON formatted source code
        try {
          const parsedSource = JSON.parse(sourceCode.replace(/^{/, '').replace(/}$/, ''));
          if (parsedSource.sources) {
            // Extract all source files
            for (const [filePath, fileContent] of Object.entries(parsedSource.sources)) {
              const fileName = path.basename(filePath);
              const fullPath = path.join(contractsDir, fileName);
              fs.writeFileSync(
                fullPath,
                (fileContent as any).content
              );
              console.log(`✅ Saved ${fileName}`);
            }
          }
        } catch (e) {
          // If not JSON, write as is
          fs.writeFileSync(
            path.join(contractsDir, `${contractName}.sol`),
            sourceCode
          );
          console.log(`✅ Saved ${contractName}.sol`);
        }
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

  // Display deployment information at the end
  console.log('\n=== Deployment Information ===');
  deploymentInfo.forEach((info, index) => {
    console.log(`\nCurve ${index + 1}:`);
    console.log(`Name: ${info.name}`);
    console.log(`Address: ${info.address}`);
    console.log('Constructor Arguments:');
    info.constructorArgs.forEach((arg, i) => {
      console.log(`  ${info.constructorArgTypes[i]}: ${arg}`);
    });
  });
}

main().catch(console.error);
