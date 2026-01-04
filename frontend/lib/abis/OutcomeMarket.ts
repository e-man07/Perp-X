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
    "type": "function",
    "name": "closePositionPartial",
    "inputs": [
      { "name": "positionId", "type": "uint256" },
      { "name": "closePercentage", "type": "uint256" }
    ],
    "outputs": [{ "name": "pnl", "type": "int256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimSettlement",
    "inputs": [{ "name": "positionId", "type": "uint256" }],
    "outputs": [{ "name": "pnl", "type": "int256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "settleMarket",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "isExpired",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isSettled",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getExpiryTimestamp",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "settlementPrice",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "init",
    "inputs": [
      { "name": "positionManager", "type": "address" },
      { "name": "collateralVault", "type": "address" },
      { "name": "liquidationEngine", "type": "address" },
      { "name": "priceAdapter", "type": "address" },
      { "name": "pythPriceId", "type": "bytes32" },
      { "name": "assetPair", "type": "string" },
      { "name": "expiryDuration", "type": "uint256" },
      { "name": "maxOpenInterest", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
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
