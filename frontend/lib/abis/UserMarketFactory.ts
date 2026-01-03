export const UserMarketFactoryABI = [
  {
    type: "function",
    name: "init",
    inputs: [
      { name: "outcomePerpsFactory", type: "address" },
      { name: "binaryMarketTemplate", type: "address" },
      { name: "governance", type: "address" },
      { name: "feeToken", type: "address" },
      { name: "feeRecipient", type: "address" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "approveCreator",
    inputs: [
      { name: "creator", type: "address" },
      { name: "approved", type: "bool" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "createPriceMarket",
    inputs: [
      { name: "pythPriceId", type: "bytes32" },
      { name: "assetPair", type: "string" },
      { name: "expiryDuration", type: "uint256" },
      { name: "maxOpenInterest", type: "uint256" }
    ],
    outputs: [{ name: "marketAddress", type: "address" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "createBinaryMarket",
    inputs: [
      { name: "question", type: "string" },
      { name: "expiryTimestamp", type: "uint256" },
      { name: "maxShares", type: "uint256" }
    ],
    outputs: [{ name: "marketAddress", type: "address" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getUserMarkets",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getAllUserMarkets",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "isUserMarket",
    inputs: [{ name: "market", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getMarketCreator",
    inputs: [{ name: "market", type: "address" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "setMarketCreationFee",
    inputs: [{ name: "newFee", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "setFeeRecipient",
    inputs: [{ name: "newRecipient", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable"
  }
] as const;
