export const config = {
  projectId: "YOUR_REOWN_PROJECT_ID", // Get from https://cloud.reown.com

  // Contract Addresses (Arbitrum Sepolia)
  // Deployed 2026-01-03
  contracts: {
    factory: "0x0000000000000000000000000000000000000000", // OutcomePerpsFactory (not deployed yet)
    vault: "0xa7209151acb6b484ab7d2a300b48c35ed5b55409", // CollateralVault
    positionManager: "0xcb3e422143d1c5603c86b0ccd419156bf5d8b045", // PositionManager
    priceAdapter: "0x50dde8ca05be55a046841a3d6ec5111af52a8d7d", // PythPriceAdapter
    insuranceFund: "0x0000000000000000000000000000000000000000", // InsuranceFund (not deployed yet)
    liquidationEngine: "0x2361425d154e66aca0272b718571836203601983", // LiquidationEngine
    orderBook: "0x0000000000000000000000000000000000000000", // OrderBook (not deployed yet)
    crossMargin: "0x0000000000000000000000000000000000000000", // CrossMargin (not deployed yet)
    userMarketFactory: "0x0000000000000000000000000000000000000000", // UserMarketFactory (not deployed yet)
    usdc: "0x75faf114eafb1BDbe2F0316DF893fd58cE9AF7E6", // Arbitrum Sepolia USDC
    markets: {
      btc: {
        micro: "0x0000000000000000000000000000000000000000", // 24h BTC market (not deployed yet)
        daily: "0x0000000000000000000000000000000000000000", // 7d BTC market
        macro: "0x0000000000000000000000000000000000000000", // 30d BTC market
      },
      eth: {
        micro: "0x3e741a1d222dc8a392a7caf4d12a8a8b6fb69800", // 24h ETH market (OutcomeMarket)
        daily: "0x0000000000000000000000000000000000000000", // 7d ETH market
        macro: "0x0000000000000000000000000000000000000000", // 30d ETH market
      },
      arb: {
        micro: "0x0000000000000000000000000000000000000000", // 24h ARB market (not deployed yet)
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
