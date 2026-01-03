export const BinaryMarketABI = [
  {
    type: "function",
    name: "init",
    inputs: [
      { name: "question", type: "string" },
      { name: "expiryTimestamp", type: "uint256" },
      { name: "maxShares", type: "uint256" },
      { name: "creator", type: "address" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "buyYes",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [{ name: "sharesBought", type: "uint256" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "buyNo",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [{ name: "sharesBought", type: "uint256" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "sellYes",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "amountReceived", type: "uint256" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "sellNo",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "amountReceived", type: "uint256" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "settleMarket",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "settleMarketManual",
    inputs: [{ name: "outcome", type: "uint8" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "redeemShares",
    inputs: [],
    outputs: [{ name: "payout", type: "uint256" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getQuestion",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getYesPrice",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getNoPrice",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getYesShares",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getNoShares",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "isExpired",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "settled",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "outcome",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view"
  }
] as const;
