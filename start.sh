#!/bin/bash

# Source foundry environment
. /root/.bashrc

# Create necessary directories
mkdir -p /app/contracts
mkdir -p /app/deployments

# Start anvil in the background
foundryup
anvil &

# Wait for anvil to be ready
sleep 2

# Run the setup scripts
echo "Running getCurveCode.ts..."
bun run scripts/getCurveCode.ts || { echo "Failed to get curve code"; exit 1; }

echo "Running deployCurvesToVM.ts..."
bun run scripts/deployCurvesToVM.ts || { echo "Failed to deploy curves"; exit 1; }

echo "Starting server..."
# Start the main application using the compiled binary
exec ./server 