export const OrderBookABI = [
  {
    type: "function",
    name: "init",
    inputs: [{ name: "market", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "placeLimitOrder",
    inputs: [
      { name: "direction", type: "uint8" },
      { name: "price", type: "uint256" },
      { name: "size", type: "uint256" },
      { name: "collateral", type: "uint256" },
      { name: "leverage", type: "uint256" }
    ],
    outputs: [{ name: "orderId", type: "uint256" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "placeStopLoss",
    inputs: [
      { name: "positionId", type: "uint256" },
      { name: "stopPrice", type: "uint256" }
    ],
    outputs: [{ name: "orderId", type: "uint256" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "placeTakeProfit",
    inputs: [
      { name: "positionId", type: "uint256" },
      { name: "targetPrice", type: "uint256" }
    ],
    outputs: [{ name: "orderId", type: "uint256" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "cancelOrder",
    inputs: [{ name: "orderId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "executeOrders",
    inputs: [{ name: "currentPrice", type: "uint256" }],
    outputs: [{ name: "executedCount", type: "uint256" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getOrder",
    inputs: [{ name: "orderId", type: "uint256" }],
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "user", type: "address" },
          { name: "orderType", type: "uint8" },
          { name: "direction", type: "uint8" },
          { name: "price", type: "uint256" },
          { name: "size", type: "uint256" },
          { name: "collateral", type: "uint256" },
          { name: "leverage", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "createdAt", type: "uint256" },
          { name: "expiresAt", type: "uint256" }
        ],
        type: "tuple"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getUserOrders",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view"
  }
] as const;
