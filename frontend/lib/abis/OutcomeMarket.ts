export const OutcomeMarketABI = [
  {
    "type": "function",
    "name": "openPosition",
    "inputs": [
      { "name": "direction", "type": "uint8" },
      { "name": "collateralUSD", "type": "uint256" },
      { "name": "leverage", "type": "uint256" }
    ],
    "outputs": [{ "name": "positionId", "type": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "closePosition",
    "inputs": [{ "name": "positionId", "type": "uint256" }],
    "outputs": [{ "name": "pnl", "type": "int256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getCurrentPrice",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getCachedPrice",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalLongOI",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalShortOI",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "assetPair",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "expiryTimestamp",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "settled",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "PositionOpened",
    "inputs": [
      { "name": "positionId", "type": "uint256", "indexed": true },
      { "name": "user", "type": "address", "indexed": true },
      { "name": "direction", "type": "uint8", "indexed": false },
      { "name": "collateralUSD", "type": "uint256", "indexed": false },
      { "name": "positionSize", "type": "uint256", "indexed": false },
      { "name": "leverage", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "PositionClosed",
    "inputs": [
      { "name": "positionId", "type": "uint256", "indexed": true },
      { "name": "user", "type": "address", "indexed": true },
      { "name": "pnl", "type": "int256", "indexed": false }
    ]
  }
] as const;
