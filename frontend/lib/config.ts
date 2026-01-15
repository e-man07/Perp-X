export const config = {
  // Get from https://cloud.reown.com - set in .env.local as NEXT_PUBLIC_REOWN_PROJECT_ID
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "YOUR_REOWN_PROJECT_ID",

  // Contract Addresses (Arbitrum Sepolia)
  // Deployed 2026-01-04 - Full working system
  contracts: {
    factory: "0x0000000000000000000000000000000000000000", // OutcomePerpsFactory (use markets directly)
    vault: "0x456628c1ac3da5b0a1b15f28762a643a38ae5745", // CollateralVault (v3 - with admin release)
    positionManager: "0xcb3e422143d1c5603c86b0ccd419156bf5d8b045", // PositionManager
    priceAdapter: "0xcadfc95764e2480d3a44f3a74fb5bd225582e012", // PythPriceAdapter (v2 - with public submit_price)
    insuranceFund: "0xb10706d5d65bba12092ff359005c216ee863a344", // InsuranceFund
    liquidationEngine: "0x2361425d154e66aca0272b718571836203601983", // LiquidationEngine
    orderBook: "0x0fcd5872c3730ac931d6ef52256b35e1079d40e6", // OrderBook
    crossMargin: "0xce63953845b7b9732ed5fd0f0b519881f7904f66", // CrossMargin
    userMarketFactory: "0xbb738208be7a40977b34cf288c9fe13c01fa313d", // UserMarketFactory
    usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // Circle USDC (6 decimals)
    markets: {
      btc: {
        micro: "0xf8c4ea0762fa9f8c87aea45bc37b1f3f2e66bdaa", // 24h BTC market (fresh - deployed 2026-01-15)
        daily: "0x0000000000000000000000000000000000000000", // 7d BTC market
        macro: "0x091e2b7646594ea506f3ae5d10c6a5fc0376af68", // 30d BTC market (fresh - deployed 2026-01-15)
      },
      eth: {
        micro: "0xfa2644c8617bfcff3ea552fdb66b7dd4f7f01b04", // 24h ETH market (fresh - deployed 2026-01-15)
        daily: "0x0000000000000000000000000000000000000000", // 7d ETH market
        macro: "0x0000000000000000000000000000000000000000", // 30d ETH market
      },
      arb: {
        micro: "0xc66226ab3c4cb72bef653dc0f100186ddf515abc", // 24h ARB market (fresh - deployed 2026-01-15)
        daily: "0x0000000000000000000000000000000000000000", // 7d ARB market
        macro: "0x0000000000000000000000000000000000000000", // 30d ARB market
      },
    },
  },

  // External Addresses
  external: {
    pythOracle: "0xC5E56d6b40F3e5F65e23aEe2e85dD8139279C11C",
  },

  // Pyth Price Feed IDs (bytes32 - exactly as used by OutcomeMarket contracts)
  priceFeedIds: {
    "BTC/USD": "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a4b68b0",
    "ETH/USD": "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    "ARB/USD": "0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5",
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
          "https://sepolia-rollup.arbitrum.io/rpc", // Public RPC first (more reliable)
          "https://arb-sepolia.g.alchemy.com/v2/lfzFRKcsu0i6H8DvmG3jPH9-E8GnaGop", // Alchemy fallback
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
