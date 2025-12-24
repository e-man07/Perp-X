export const PositionManagerABI = [
  {
    "type": "function",
    "name": "getPosition",
    "inputs": [{ "name": "positionId", "type": "uint256" }],
    "outputs": [
      {
        "components": [
          { "name": "id", "type": "uint256" },
          { "name": "user", "type": "address" },
          { "name": "market", "type": "address" },
          { "name": "direction", "type": "uint8" },
          { "name": "collateralUSD", "type": "uint256" },
          { "name": "leverage", "type": "uint256" },
          { "name": "positionSize", "type": "uint256" },
          { "name": "entryPrice", "type": "uint256" },
          { "name": "openedAt", "type": "uint256" },
          { "name": "status", "type": "uint8" },
          { "name": "accumulatedFunding", "type": "int256" },
          { "name": "lastFundingTimestamp", "type": "uint256" }
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserPositions",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserPositionsInMarket",
    "inputs": [
      { "name": "user", "type": "address" },
      { "name": "market", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "calculateUnrealizedPnL",
    "inputs": [
      { "name": "positionId", "type": "uint256" },
      { "name": "currentPrice", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "int256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getLiquidationPrice",
    "inputs": [{ "name": "positionId", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "positionExists",
    "inputs": [{ "name": "positionId", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMarketPositions",
    "inputs": [{ "name": "market", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "calculateMarginRatio",
    "inputs": [
      { "name": "positionId", "type": "uint256" },
      { "name": "currentPrice", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "int256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPositionHealth",
    "inputs": [
      { "name": "positionId", "type": "uint256" },
      { "name": "currentPrice", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "PositionCreated",
    "inputs": [
      { "name": "positionId", "type": "uint256", "indexed": true },
      { "name": "user", "type": "address", "indexed": true },
      { "name": "market", "type": "address", "indexed": true },
      { "name": "direction", "type": "uint8", "indexed": false },
      { "name": "collateralUSD", "type": "uint256", "indexed": false },
      { "name": "leverage", "type": "uint256", "indexed": false },
      { "name": "entryPrice", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "PositionUpdated",
    "inputs": [
      { "name": "positionId", "type": "uint256", "indexed": true },
      { "name": "newStatus", "type": "uint8", "indexed": false }
    ]
  }
] as const;

