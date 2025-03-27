import { createPublicClient, http, decodeAbiParameters } from 'viem';
import { baseSepolia } from 'viem/chains';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

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
  sourceFiles: string[];
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
        // Remove the extra { at the start and } at the end
        const sourceCode = data.result[0].SourceCode.replace(/^{/, '').replace(/}$/, '');
        const sourceJson = JSON.parse(sourceCode);
        const contractName = data.result[0].ContractName || `Curve${i}`;
        const abi = JSON.parse(data.result[0].ABI);

        // Create a temporary directory for the source files
        const tempDir = path.join(contractsDir, `temp_${contractName}`);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        // Write all source files to the temp directory
        for (const [filePath, fileContent] of Object.entries(sourceJson.sources)) {
          // Create subdirectories if needed
          const fullPath = path.join(tempDir, filePath);
          const dirPath = path.dirname(fullPath);
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }

          // Write the source file
          fs.writeFileSync(
            fullPath,
            (fileContent as any).content
          );
        }

        // Create a foundry.toml with the correct remappings
        const remappings = (sourceJson.settings?.remappings || [])
          .map((r: string) => `"${r}"`)
          .join(',\n  ');
        fs.writeFileSync(
          path.join(tempDir, 'foundry.toml'),
          `[profile.default]\nremappings = [\n  ${remappings}\n]\n`
        );

        // Find the main contract file
        const mainContract = Object.keys(sourceJson.sources).find(file =>
          file.includes(contractName) && file.endsWith('.sol')
        );

        if (!mainContract) {
          throw new Error(`Could not find main contract file for ${contractName}`);
        }

        // Use forge flatten to combine all sources
        const flattenedSource = execSync(
          `cd ${tempDir} && forge flatten ${mainContract}`,
          { encoding: 'utf8' }
        );

        // Write the flattened source to the contracts directory
        const fileName = `${contractName}.sol`;
        fs.writeFileSync(
          path.join(contractsDir, fileName),
          flattenedSource
        );
        console.log(`✅ Saved flattened ${fileName}`);

        // Clean up temp directory
        fs.rmSync(tempDir, { recursive: true, force: true });

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
          constructorArgTypes: types,
          sourceFiles: [fileName]
        });
      } else {
        console.log(`❌ Failed to fetch source code for curve ${i}`);
        console.log(`Status: ${data.status}`);
        console.log(`Message: ${data.message || 'No message provided'}`);
        if (data.result[0]) {
          console.log(`Result: ${JSON.stringify(data.result[0], null, 2)}`);
        }
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
    console.log('Source Files:');
    info.sourceFiles.forEach(file => console.log(`  ${file}`));
    console.log('Constructor Arguments:');
    info.constructorArgs.forEach((arg, i) => {
      console.log(`  ${info.constructorArgTypes[i]}: ${arg}`);
    });
  });

  // Save deployment information to JSON file
  const jsonOutput = {
    registryAddress,
    curves: deploymentInfo.map((info, index) => ({
      id: index + 1,
      name: info.name,
      address: info.address,
      sourceFiles: info.sourceFiles,
      constructorArgs: info.constructorArgs.map((arg, i) => ({
        type: info.constructorArgTypes[i],
        value: typeof arg === 'bigint' ? arg.toString() : arg
      }))
    }))
  };

  fs.writeFileSync(
    path.join(contractsDir, 'curves.json'),
    JSON.stringify(jsonOutput, null, 2)
  );
  console.log('\n✅ Saved deployment information to contracts/curves.json');
}

main().catch(console.error);
