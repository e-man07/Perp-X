export const config = {
  projectId: "YOUR_REOWN_PROJECT_ID", // Get from https://cloud.reown.com
  
  // Contract Addresses (Monad Testnet)
  contracts: {
    factory: "0x8C4286F9142734Ff8957048Dd7B8Bc21D54D6e42",
    vault: "0x780b37631cdeaf0cde2b91b67d50c8dca0c53432",
    positionManager: "0x6f4369a2f5ef635eb002239078f13ee8f5b72cdf",
    priceAdapter: "0xc719485FEB9FE5C9bEBDa2563a95Eb9415c52685",
    mockUSDC: "0x213b6548828e25889E6fDD1D4CFb3e328FCF7C40",
    markets: {
      btc: {
        micro: "0xc3ec3ec6ec1df1d555bba825d9dab03960f36835", // 24h - fallback to existing
        daily: "0xc3ec3ec6ec1df1d555bba825d9dab03960f36835", // 7d - TODO: update with actual address
        macro: "0xc3ec3ec6ec1df1d555bba825d9dab03960f36835", // 30d - TODO: update with actual address
      },
      eth: {
        micro: "0xc033f0b877bd405b48f3ad8b8e91340252f068e6", // 24h - fallback to existing
        daily: "0xc033f0b877bd405b48f3ad8b8e91340252f068e6", // 7d - TODO: update with actual address
        macro: "0xc033f0b877bd405b48f3ad8b8e91340252f068e6", // 30d - TODO: update with actual address
      },
      mon: {
        micro: "0x3ba4bb2582e214a6f571d3c89d073528e21b6baa", // 24h - fallback to existing
        daily: "0x3ba4bb2582e214a6f571d3c89d073528e21b6baa", // 7d - TODO: update with actual address
        macro: "0x3ba4bb2582e214a6f571d3c89d073528e21b6baa", // 30d - TODO: update with actual address
      },
    },
  },
  
  // Network Configuration
  monadTestnet: {
    id: 10143,
    name: "Monad Testnet",
    network: "monad-testnet",
    nativeCurrency: {
      decimals: 18,
      name: "Monad",
      symbol: "MON",
    },
    rpcUrls: {
      default: { 
        http: [
          "https://monad-testnet.g.alchemy.com/v2/lfzFRKcsu0i6H8DvmG3jPH9-E8GnaGop",
          "https://testnet-rpc.monad.xyz", // Fallback
        ] 
      },
      public: { 
        http: [
          "https://monad-testnet.g.alchemy.com/v2/lfzFRKcsu0i6H8DvmG3jPH9-E8GnaGop",
          "https://testnet-rpc.monad.xyz", // Fallback
        ] 
      },
    },
    blockExplorers: {
      default: {
        name: "Monad Explorer",
        url: "https://explorer.testnet.monad.xyz",
      },
    },
    testnet: true,
  },
} as const;
