export const CrossMarginABI = [
  {
    type: "function",
    name: "init",
    inputs: [
      { name: "collateralVault", type: "address" },
      { name: "positionManager", type: "address" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "calculateAccountEquity",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "int256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "calculateMarginUsed",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getAvailableMargin",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "isAccountHealthy",
    inputs: [
      { name: "user", type: "address" },
      { name: "minMarginRatioBps", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "liquidateAccount",
    inputs: [{ name: "user", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getAccountEquity",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "int256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getMarginUsed",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  }
] as const;
