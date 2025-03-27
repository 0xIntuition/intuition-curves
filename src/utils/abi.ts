export const ABI_CURRENT_PRICE = [
  {
    inputs: [{ name: "totalShares", type: "uint256" }],
    name: "currentPrice",
    outputs: [{ name: "sharePrice", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export const ABI_NAME = [
  {
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export const ABI_MAX_SHARES = [
  {
    inputs: [],
    name: "maxShares",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export const ABI_MAX_ASSETS = [
  {
    inputs: [],
    name: "maxAssets",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export const ABI_PREVIEW_DEPOSIT = [
  {
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "totalAssets", type: "uint256" },
      { name: "totalShares", type: "uint256" }
    ],
    name: "previewDeposit",
    outputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export const ABI_PREVIEW_REDEEM = [
  {
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "totalShares", type: "uint256" },
      { name: "totalAssets", type: "uint256" }
    ],
    name: "previewRedeem",
    outputs: [{ name: "assets", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export const ABI_PREVIEW_WITHDRAW = [
  {
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "totalAssets", type: "uint256" },
      { name: "totalShares", type: "uint256" }
    ],
    name: "previewWithdraw",
    outputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export const ABI_PREVIEW_MINT = [
  {
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "totalShares", type: "uint256" },
      { name: "totalAssets", type: "uint256" }
    ],
    name: "previewMint",
    outputs: [{ name: "assets", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export const ABI_CONVERT_TO_SHARES = [
  {
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "totalAssets", type: "uint256" },
      { name: "totalShares", type: "uint256" }
    ],
    name: "convertToShares",
    outputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export const ABI_CONVERT_TO_ASSETS = [
  {
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "totalShares", type: "uint256" },
      { name: "totalAssets", type: "uint256" }
    ],
    name: "convertToAssets",
    outputs: [{ name: "assets", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const; 