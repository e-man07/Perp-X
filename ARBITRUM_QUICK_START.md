# Arbitrum Migration Quick Start Guide

**Quick Reference**: See `ARBITRUM_MIGRATION_REPORT.md` for full details.

---

## 🚀 Quick Migration Steps (2-3 hours)

### 1. Set Up Arbitrum Sepolia (15 min)

```bash
# Get testnet ETH
# Visit: https://faucet.quicknode.com/arbitrum/sepolia
# Or: https://www.alchemy.com/faucets/arbitrum-sepolia

# Set environment variables
export RPC_URL="https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
export PRIVATE_KEY="your_private_key"
export ARBISCAN_API_KEY="your_arbiscan_api_key"
```

### 2. Update Foundry Config (5 min)

Edit `foundry.toml`:
```toml
[profile.default]
eth_rpc_url = "https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY"

[rpc_endpoints]
arbitrum_sepolia = "https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
```

### 3. Update Deployment Script (10 min)

Edit `script/Deploy.s.sol`:
```solidity
// Change Pyth address
address constant PYTH_ORACLE = 0xC5E56d6b40F3e5F65e23aEe2e85dD8139279C11C; // Arbitrum Sepolia

// Update USDC address
address public usdc = 0x75faf114eafb1BDbe2F0316DF893fd58cE9AF7E6; // Arbitrum Sepolia USDC
```

### 4. Deploy Contracts (30 min)

```bash
# Build
forge build

# Deploy
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ARBISCAN_API_KEY

# Create markets
forge script script/CreateMarkets.s.sol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### 5. Update Frontend Config (20 min)

Edit `frontend/lib/config.ts`:

```typescript
// Replace monadTestnet with:
arbitrumSepolia: {
  id: 421614,
  name: "Arbitrum Sepolia",
  network: "arbitrum-sepolia",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: { 
      http: ["https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY"] 
    },
  },
  blockExplorers: {
    default: { name: "Arbiscan Sepolia", url: "https://sepolia.arbiscan.io" },
  },
  testnet: true,
},

// Update contracts with new addresses
contracts: {
  factory: "0x...", // From deployment
  vault: "0x...",
  // ... etc
}
```

### 6. Update Wallet Connection (10 min)

Edit `frontend/lib/web3.ts`:
```typescript
import { arbitrumSepolia } from '@reown/appkit/networks'

export const { WagmiProvider } = createAppKit({
  networks: [arbitrumSepolia], // Add Arbitrum
  // ... rest
})
```

### 7. Test Everything (1 hour)

```bash
# Test contracts
forge test --fork-url $RPC_URL

# Test frontend
cd frontend && npm run dev
# Connect wallet to Arbitrum Sepolia
# Test: deposit, open position, close position
```

---

## 📋 Key Addresses

### Arbitrum Sepolia (Testnet)
- **Chain ID**: `421614`
- **Pyth Oracle**: `0xC5E56d6b40F3e5F65e23aEe2e85dD8139279C11C`
- **USDC**: `0x75faf114eafb1BDbe2F0316DF893fd58cE9AF7E6`
- **RPC**: `https://sepolia-rollup.arbitrum.io/rpc`
- **Explorer**: https://sepolia.arbiscan.io

### Arbitrum One (Mainnet)
- **Chain ID**: `42161`
- **Pyth Oracle**: `0xff1a0f4744e8582DF1aE09D5611b887B6a12925C`
- **USDC**: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`
- **RPC**: `https://arb1.arbitrum.io/rpc`
- **Explorer**: https://arbiscan.io

---

## 🔑 Pyth Price Feed IDs

```solidity
// Register these in PythPriceAdapter after deployment:
BTC/USD: 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a4b68b
ETH/USD: 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace
ARB/USD: 0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf
```

---

## ⚡ Quick Commands

```bash
# Check balance
cast balance YOUR_ADDRESS --rpc-url $RPC_URL

# Get testnet ETH
# Visit: https://faucet.quicknode.com/arbitrum/sepolia

# Verify contract
forge verify-contract CONTRACT_ADDRESS CONTRACT_NAME \
  --chain arbitrum-sepolia \
  --etherscan-api-key $ARBISCAN_API_KEY

# Check gas price
cast gas-price --rpc-url $RPC_URL
```

---

## 🐛 Common Issues

### Issue: "Insufficient funds"
**Solution**: Get testnet ETH from faucet

### Issue: "Contract verification failed"
**Solution**: Make sure compiler version matches (0.8.24)

### Issue: "Pyth price not updating"
**Solution**: Verify price feed IDs are correct

### Issue: "Frontend not connecting"
**Solution**: Make sure wallet is connected to Arbitrum Sepolia network

---

## 📚 Resources

- **Full Report**: `ARBITRUM_MIGRATION_REPORT.md`
- **Arbitrum Docs**: https://docs.arbitrum.io
- **Pyth Docs**: https://docs.pyth.network/documentation/pythnet-price-feeds/evm
- **Arbiscan**: https://sepolia.arbiscan.io

---

**Estimated Time**: 2-3 hours  
**Difficulty**: Medium  
**Status**: Ready to start! 🚀

