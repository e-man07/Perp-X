export const PythPriceAdapterABI = [
  {
    "type": "function",
    "name": "submitPrice",
    "inputs": [
      { "name": "asset", "type": "string" },
      { "name": "price", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "submitPriceById",
    "inputs": [
      { "name": "price_id", "type": "bytes32" },
      { "name": "price", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updatePriceCache",
    "inputs": [
      { "name": "asset", "type": "string" },
      { "name": "price", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updatePriceCacheById",
    "inputs": [
      { "name": "price_id", "type": "bytes32" },
      { "name": "price", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "get_cached_price",
    "inputs": [{ "name": "asset", "type": "string" }],
    "outputs": [
      { "name": "price", "type": "uint256" },
      { "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "get_cached_price_by_id",
    "inputs": [{ "name": "price_id", "type": "bytes32" }],
    "outputs": [
      { "name": "price", "type": "uint256" },
      { "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "get_price_id",
    "inputs": [{ "name": "asset", "type": "string" }],
    "outputs": [{ "name": "", "type": "bytes32" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "get_owner",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "set_max_staleness",
    "inputs": [{ "name": "seconds", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
] as const;
