import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { anvil } from 'viem/chains';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const CONTRACTS_DIR = path.join(__dirname, '../contracts');
const DEPLOYMENTS_DIR = path.join(__dirname, '../deployments');
const ANVIL_RPC_URL = 'http://127.0.0.1:8545';

interface ConstructorArg {
  type: string;
  value: string;
}

async function compileAndDeploy(contractName: string, args: any[] = []) {
  console.log(`Compiling and deploying ${contractName}...`);

  // Compile using forge with explicit output path
  execSync(`forge build --force --out ${path.join(__dirname, '../out')} ${path.join(CONTRACTS_DIR, `${contractName}.sol`)}`, {
    stdio: 'inherit'
  });

  // Get the bytecode and abi from the artifacts
  const artifact = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../out', `${contractName}.sol`, `${contractName}.json`), 'utf8')
  );

  // Set up viem clients
  const publicClient = createPublicClient({
    chain: anvil,
    transport: http(ANVIL_RPC_URL),
  });

  const walletClient = createWalletClient({
    account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Anvil's first test account
    chain: anvil,
    transport: http(ANVIL_RPC_URL),
  });

  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode.object,
    args,
  });

  console.log(`Transaction hash: ${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (!receipt.contractAddress) {
    throw new Error(`Failed to deploy ${contractName}: No contract address in receipt`);
  }
  console.log(`${contractName} deployed to: ${receipt.contractAddress}`);
  return receipt.contractAddress;
}

async function main() {
  try {
    // Create deployments directory if it doesn't exist
    if (!fs.existsSync(DEPLOYMENTS_DIR)) {
      fs.mkdirSync(DEPLOYMENTS_DIR, { recursive: true });
    }

    // Read curves configuration
    const curvesConfig = JSON.parse(
      fs.readFileSync(path.join(CONTRACTS_DIR, 'curves.json'), 'utf8')
    );

    // Deploy all curves
    const addresses: { [key: string]: string } = {};

    for (const curve of curvesConfig.curves) {
      // Convert constructor args to the correct format
      const args = curve.constructorArgs.map((arg: ConstructorArg) => {
        switch (arg.type) {
          case 'uint256':
            return BigInt(arg.value);
          default:
            return arg.value;
        }
      });

      addresses[curve.name] = await compileAndDeploy(curve.name, args);
    }

    // Save deployment addresses
    const deploymentInfo = {
      timestamp: new Date().toISOString(),
      addresses,
      network: 'anvil'
    };

    fs.writeFileSync(
      path.join(DEPLOYMENTS_DIR, 'anvil-deployment.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log('Deployment completed successfully!');
    console.log('Deployment info saved to deployments/anvil-deployment.json');

  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

main();
