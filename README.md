# Intuition Curves API

A REST API service built with Elysia and Bun runtime for querying and interacting with Intuition Curves. This service provides endpoints for calculating prices, previewing operations, and converting between assets and shares.

## How It Works

This project looks for all of the Bonding Curves that have been deployed, clones their source code and constructor arguments, deploys them to a local Anvil node, and then provides an API to query them. This enables us to query curve parameters, calculate prices, and preview operations without having to make an RPC call to the mainnet -- and simulates the curve code in an isolated environment. This API will be expanded to include more utilities and metrics for the Intuition Curves as they are needed to support the Intuition Ecosystem.

## Features

- Current price calculation for curves
- Preview calculations for deposits, redeems, mints, and withdrawals
- Asset and share conversion utilities
- Curve parameter queries
- Swagger documentation for all endpoints

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) runtime installed
- [Foundry](https://book.getfoundry.sh) for smart contract interactions

### Installation

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

### Development

To start the development server:

```bash
bun run dev
```

The API will be available at http://localhost:3000/

### API Documentation

Once the server is running, visit http://localhost:3000/swagger to access the interactive API documentation.

## Docker Deployment

The project includes a Dockerfile for containerized deployment. Build and run with:

```bash
docker build -t intuition-curves .
docker run -p 3000:3000 intuition-curves
```
