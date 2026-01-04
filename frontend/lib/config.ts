export const config = {
  // Get from https://cloud.reown.com - set in .env.local as NEXT_PUBLIC_REOWN_PROJECT_ID
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "YOUR_REOWN_PROJECT_ID",

  // Contract Addresses (Arbitrum Sepolia)
  // Deployed 2026-01-04 - Full working system
  contracts: {
    factory: "0x0000000000000000000000000000000000000000", // OutcomePerpsFactory (use markets directly)
    vault: "0xf77ada7706ab8869230900e3be8835ddd4f7195a", // CollateralVault (NEW)
    positionManager: "0xcb3e422143d1c5603c86b0ccd419156bf5d8b045", // PositionManager
    priceAdapter: "0xb4b7bc3957eaf4e75be74f83a25e659ed0bd8e5c", // PythPriceAdapter
    insuranceFund: "0xb10706d5d65bba12092ff359005c216ee863a344", // InsuranceFund
    liquidationEngine: "0x2361425d154e66aca0272b718571836203601983", // LiquidationEngine
    orderBook: "0x0fcd5872c3730ac931d6ef52256b35e1079d40e6", // OrderBook
    crossMargin: "0xce63953845b7b9732ed5fd0f0b519881f7904f66", // CrossMargin
    userMarketFactory: "0xbb738208be7a40977b34cf288c9fe13c01fa313d", // UserMarketFactory
    usdc: "0xdbc8c016287437ce2cf69ff64c245a4d74599a40", // MockUSDC for testing (18 decimals)
    markets: {
      btc: {
        micro: "0xe5c416f4d00359a23e9623f83d48342092d74b3e", // 24h BTC market (NEW)
        daily: "0x0000000000000000000000000000000000000000", // 7d BTC market
        macro: "0x0000000000000000000000000000000000000000", // 30d BTC market
      },
      eth: {
        micro: "0x3e741a1d222dc8a392a7caf4d12a8a8b6fb69800", // 24h ETH market
        daily: "0x0000000000000000000000000000000000000000", // 7d ETH market
        macro: "0x0000000000000000000000000000000000000000", // 30d ETH market
      },
      arb: {
        micro: "0x95d352b33d82985200c4b5eb83d7a78744f86e85", // 24h ARB market
        daily: "0x0000000000000000000000000000000000000000", // 7d ARB market
        macro: "0x0000000000000000000000000000000000000000", // 30d ARB market
      },
    },
  },

  // External Addresses
  external: {
    pythOracle: "0xC5E56d6b40F3e5F65e23aEe2e85dD8139279C11C",
  },

  // Pyth Price Feed IDs
  priceFeedIds: {
    "BTC/USD": "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a4b68b",
    "ETH/USD": "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    "ARB/USD": "0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf",
  },

  // Network Configuration - Arbitrum Sepolia
  arbitrumSepolia: {
    id: 421614,
    name: "Arbitrum Sepolia",
    network: "arbitrum-sepolia",
    nativeCurrency: {
      decimals: 18,
      name: "Ethereum",
      symbol: "ETH",
    },
    rpcUrls: {
      default: {
        http: [
          "https://arb-sepolia.g.alchemy.com/v2/lfzFRKcsu0i6H8DvmG3jPH9-E8GnaGop",
          "https://sepolia-rollup.arbitrum.io/rpc", // Fallback public RPC
        ]
      },
      public: {
        http: [
          "https://sepolia-rollup.arbitrum.io/rpc",
        ]
      },
    },
    blockExplorers: {
      default: {
        name: "Arbiscan",
        url: "https://sepolia.arbiscan.io",
      },
    },
    testnet: true,
  },
} as const;
