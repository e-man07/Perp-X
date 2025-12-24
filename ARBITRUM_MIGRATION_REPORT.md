# Perp-X: Arbitrum Migration Report

**Project**: Perp-X (Outcome-Based Perpetual Futures DEX)  
**Current Network**: Monad Testnet (Chain ID: 10143)  
**Target Network**: Arbitrum (One Mainnet / Sepolia Testnet)  
**Date**: December 2024  
**Purpose**: Arbitrum Mini Hackathon Migration

---

## Executive Summary

This report outlines the complete migration strategy for Perp-X from Monad Testnet to Arbitrum using **Stylus (Rust-based smart contracts)**. The migration involves **completely rewriting all Solidity contracts in Rust**, updating network configurations, integrating Arbitrum-native oracle solutions, updating frontend infrastructure, and leveraging Arbitrum's Stylus feature for enhanced performance.

**⚠️ IMPORTANT**: All contracts are being rewritten in Rust using Stylus SDK. The Solidity implementation will be removed entirely.

**Estimated Migration Effort**: 5-7 days  
**Complexity**: High (full contract rewrite)  
**Risk Level**: Medium (new technology, but well-documented)

---

## Table of Contents

1. [Current Architecture Overview](#current-architecture-overview)
2. [Arbitrum Network Overview](#arbitrum-network-overview)
3. [Migration Requirements](#migration-requirements)
4. [Technical Changes Required](#technical-changes-required)
5. [Oracle Integration (Pyth on Arbitrum)](#oracle-integration-pyth-on-arbitrum)
6. [Contract Deployment Strategy](#contract-deployment-strategy)
7. [Frontend Updates](#frontend-updates)
8. [Gas Optimization Opportunities](#gas-optimization-opportunities)
9. [Arbitrum-Specific Features](#arbitrum-specific-features)
10. [Testing Strategy](#testing-strategy)
11. [Migration Checklist](#migration-checklist)
12. [Timeline & Effort Estimate](#timeline--effort-estimate)
13. [Risk Assessment & Mitigation](#risk-assessment--mitigation)

---

## Current Architecture Overview

### Smart Contracts Stack (Stylus/Rust)
- **OutcomeMarket.rs**: Main trading market with forced expiry (Rust)
- **PositionManager.rs**: Position tracking with perpX-inspired health metrics (Rust)
- **OutcomePerpsFactory.rs**: Market deployment factory (Rust)
- **CollateralVault.rs**: Multi-asset collateral management (Rust)
- **LiquidationEngine.rs**: Margin-based liquidation system (Rust)
- **InsuranceFund.rs**: Safety backstop fund (Rust)
- **PythPriceAdapter.rs**: Pyth Network oracle integration (Rust)
- **Math.rs**: Mathematical utilities library (Rust)

**Note**: All contracts are being rewritten in Rust using Stylus SDK. Solidity contracts will be removed.

### Frontend Stack
- **Framework**: Next.js 14+ with TypeScript
- **Web3**: Wagmi v2, AppKit (Reown) for wallet connection
- **State Management**: React hooks, localStorage for mock positions
- **Price Data**: CoinGecko API (via Next.js API routes)
- **Network**: Currently configured for Monad Testnet

### Key Dependencies
- **Rust**: Latest stable (for Stylus contracts)
- **Stylus SDK**: 0.7.0
- **cargo-stylus**: CLI tool for deployment
- **Pyth Network**: Oracle price feeds (same integration)
- **ERC-20**: Standard token interfaces (interoperable)

---

## Arbitrum Network Overview

### Network Options

#### 1. Arbitrum One (Mainnet)
- **Chain ID**: `42161`
- **RPC Endpoints**:
  - Public: `https://arb1.arbitrum.io/rpc`
  - Alchemy: `https://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY`
  - Infura: `https://arbitrum-mainnet.infura.io/v3/YOUR_API_KEY`
- **Block Explorer**: https://arbiscan.io
- **Native Token**: ETH (same as Ethereum)
- **Gas Token**: ETH
- **Status**: Production-ready, high liquidity

#### 2. Arbitrum Sepolia (Testnet)
- **Chain ID**: `421614`
- **RPC Endpoints**:
  - Public: `https://sepolia-rollup.arbitrum.io/rpc`
  - Alchemy: `https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY`
- **Block Explorer**: https://sepolia.arbiscan.io
- **Native Token**: Sepolia ETH (testnet)
- **Status**: Recommended for hackathon testing

### Key Arbitrum Features

1. **EVM Compatibility**: 100% EVM-compatible, no contract changes needed
2. **Lower Gas Costs**: ~90% cheaper than Ethereum L1
3. **Fast Finality**: ~1-2 second block times
4. **Stylus**: Rust-based smart contracts (optional upgrade path)
5. **Orbit**: Custom L3 chains (future scalability option)
6. **Native Bridge**: Built-in bridge to Ethereum L1

### Arbitrum-Specific Considerations

- **Gas Price**: Uses ETH, not a separate token
- **Block Time**: ~1-2 seconds (faster than Monad)
- **Finality**: Instant (unlike Monad's longer finality)
- **L1 Data Availability**: Posts data to Ethereum L1
- **Sequencer**: Centralized sequencer (trusted)

---

## Migration Requirements

### 1. Network Configuration Updates

#### Foundry Configuration (`foundry.toml`)
```toml
[profile.default]
src = "contracts"
out = "out"
libs = ["lib"]
solc = "0.8.24"
eth_rpc_url = "https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY"

[rpc_endpoints]
arbitrum_sepolia = "https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
arbitrum_one = "https://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
```

#### Frontend Configuration (`frontend/lib/config.ts`)
```typescript
export const config = {
  projectId: "YOUR_REOWN_PROJECT_ID",
  
  contracts: {
    // New Arbitrum addresses (to be deployed)
    factory: "0x...",
    vault: "0x...",
    positionManager: "0x...",
    priceAdapter: "0x...",
    // Collateral tokens on Arbitrum
    mockUSDC: "0x...", // Use Arbitrum USDC: 0xaf88d065e77c8cC2239327C5EDb3A432268e5831 (mainnet)
    // Arbitrum Sepolia USDC: 0x75faf114eafb1BDbe2F0316DF893fd58cE9AF7E6
    markets: {
      btc: { micro: "0x...", daily: "0x...", macro: "0x..." },
      eth: { micro: "0x...", daily: "0x...", macro: "0x..." },
      // Remove MON/USD or replace with ARB/USD
      arb: { micro: "0x...", daily: "0x...", macro: "0x..." },
    },
  },
  
  arbitrumSepolia: {
    id: 421614,
    name: "Arbitrum Sepolia",
    network: "arbitrum-sepolia",
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
    },
    rpcUrls: {
      default: { 
        http: [
          "https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY",
          "https://sepolia-rollup.arbitrum.io/rpc",
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
        name: "Arbiscan Sepolia",
        url: "https://sepolia.arbiscan.io",
      },
    },
    testnet: true,
  },
  
  arbitrumOne: {
    id: 42161,
    name: "Arbitrum One",
    network: "arbitrum-one",
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
    },
    rpcUrls: {
      default: { 
        http: [
          "https://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
          "https://arb1.arbitrum.io/rpc",
        ] 
      },
      public: { 
        http: [
          "https://arb1.arbitrum.io/rpc",
        ] 
      },
    },
    blockExplorers: {
      default: {
        name: "Arbiscan",
        url: "https://arbiscan.io",
      },
    },
    testnet: false,
  },
} as const;
```

### 2. Contract Code Changes

#### ⚠️ Complete Rewrite Required
**All contracts are being rewritten in Rust using Stylus SDK**

#### Migration Approach
1. **Rewrite all contracts in Rust** - Logic remains identical, implementation changes
2. **Use Stylus SDK patterns** - Storage, events, external calls
3. **Maintain ABI compatibility** - Frontend can still interact via standard ABI
4. **Leverage Rust benefits** - Type safety, performance, gas optimization

#### Key Stylus Patterns
- `sol_storage!` macro for contract storage
- `#[external]` attribute for public functions
- `msg::sender()`, `block::timestamp()` for blockchain context
- Custom error types with `#[derive(SolidityError)]`

See `STYLUS_MIGRATION_GUIDE.md` for detailed migration patterns.

### 3. Deployment Script Updates

#### Stylus Deployment (Rust)
Stylus contracts are deployed using `cargo-stylus`, not Foundry scripts.

```bash
# Build contracts
cd stylus
cargo stylus build

# Deploy to Arbitrum Sepolia
cargo stylus deploy \
  --rpc-url https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY \
  --private-key YOUR_PRIVATE_KEY

# Activate contract (required for Stylus)
cargo stylus activate \
  --rpc-url https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY \
  --private-key YOUR_PRIVATE_KEY \
  --contract-address DEPLOYED_ADDRESS

# Export ABI for frontend
cargo stylus export-abi
```

#### Deployment Order
1. Deploy PythPriceAdapter
2. Deploy PositionManager
3. Deploy CollateralVault
4. Deploy LiquidationEngine
5. Deploy InsuranceFund
6. Deploy OutcomePerpsFactory (which creates markets)

#### Environment Variables
```bash
export RPC_URL="https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
export PRIVATE_KEY="your_private_key"
export PYTH_ORACLE="0xC5E56d6b40F3e5F65e23aEe2e85dD8139279C11C" # Arbitrum Sepolia
export USDC_ADDRESS="0x75faf114eafb1BDbe2F0316DF893fd58cE9AF7E6" # Arbitrum Sepolia USDC
```

---

## Oracle Integration (Pyth on Arbitrum)

### Pyth Network on Arbitrum

Pyth Network has **native support** on Arbitrum with official deployments:

#### Arbitrum Sepolia (Testnet)
- **Pyth Contract**: `0xC5E56d6b40F3e5F65e23aEe2e85dD8139279C11C`
- **Price Feed IDs**: Same as other networks
  - BTC/USD: `0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a4b68b`
  - ETH/USD: `0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace`
  - ARB/USD: `0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf`

#### Arbitrum One (Mainnet)
- **Pyth Contract**: `0xff1a0f4744e8582DF1aE09D5611b887B6a12925C`
- **Price Feed IDs**: Same as Sepolia

### Integration Steps

1. **Update PythPriceAdapter Constructor**
   ```solidity
   // No changes needed - contract is network-agnostic
   // Just pass the correct Pyth address during deployment
   ```

2. **Register Price Feeds**
   ```solidity
   // After deployment, register price feeds:
   priceAdapter.registerPriceId("BTC/USD", 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a4b68b);
   priceAdapter.registerPriceId("ETH/USD", 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace);
   priceAdapter.registerPriceId("ARB/USD", 0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf);
   ```

3. **Update Price Update Mechanism**
   - Pyth on Arbitrum uses the same update mechanism
   - No changes needed to `PythPriceAdapter.sol`
   - Consider using Pyth's pull oracle model for gas savings

### Resources
- **Pyth Arbitrum Docs**: https://docs.pyth.network/documentation/pythnet-price-feeds/evm
- **Price Feed IDs**: https://pyth.network/developers/price-feed-ids

---

## Contract Deployment Strategy

### Deployment Order

1. **Deploy PythPriceAdapter**
   - Use Arbitrum Pyth address
   - Verify contract on Arbiscan

2. **Deploy OutcomePerpsFactory**
   - Factory deploys all core contracts
   - Get addresses from factory

3. **Register Collateral Tokens**
   - USDC: Use official Arbitrum USDC
   - USDT, WETH, WBTC: Deploy mocks or use existing tokens

4. **Register Price Feeds**
   - Register BTC/USD, ETH/USD, ARB/USD price IDs

5. **Create Initial Markets**
   - BTC/USD (24h, 7d, 30d)
   - ETH/USD (24h, 7d, 30d)
   - ARB/USD (24h, 7d, 30d) - Replace MON/USD

### Deployment Commands (Stylus)

```bash
# Navigate to stylus directory
cd stylus

# Build contracts
cargo stylus build

# Deploy each contract (example for PythPriceAdapter)
cargo stylus deploy \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --wasm-file target/wasm32-unknown-unknown/release/pyth_price_adapter.wasm

# Activate contract
cargo stylus activate \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --contract-address DEPLOYED_ADDRESS

# Export ABI
cargo stylus export-abi

# Repeat for all contracts in dependency order
```

**Note**: Stylus contracts must be activated after deployment before they can be called.

### Gas Costs Estimate (Arbitrum Sepolia)

| Contract | Estimated Gas | Cost (ETH) | Cost (USD @ $2500/ETH) |
|----------|---------------|------------|-------------------------|
| PythPriceAdapter | ~500k | ~0.0005 | ~$1.25 |
| OutcomePerpsFactory | ~3M | ~0.003 | ~$7.50 |
| PositionManager | ~2M | ~0.002 | ~$5.00 |
| CollateralVault | ~1.5M | ~0.0015 | ~$3.75 |
| LiquidationEngine | ~800k | ~0.0008 | ~$2.00 |
| InsuranceFund | ~600k | ~0.0006 | ~$1.50 |
| **Total** | **~8.4M** | **~0.0084** | **~$21.00** |

*Note: Arbitrum gas costs are ~90% cheaper than Ethereum L1*

---

## Frontend Updates

### 1. Network Configuration

Update `frontend/lib/config.ts` with Arbitrum network details (see [Network Configuration Updates](#1-network-configuration-updates))

### 2. Wallet Connection

#### Update `frontend/lib/web3.ts`
```typescript
import { createAppKit } from '@reown/appkit/react'
import { arbitrumSepolia, arbitrum } from '@reown/appkit/networks'

export const { WagmiProvider } = createAppKit({
  networks: [arbitrumSepolia, arbitrum], // Add Arbitrum networks
  projectId: config.projectId,
  // ... rest of config
})
```

### 3. Market Configuration

#### Replace MON/USD with ARB/USD
```typescript
// In frontend/lib/config.ts
markets: {
  btc: { micro: "...", daily: "...", macro: "..." },
  eth: { micro: "...", daily: "...", macro: "..." },
  arb: { micro: "...", daily: "...", macro: "..." }, // Replace MON
}
```

#### Update Market Selector
- Remove MON/USD option
- Add ARB/USD option
- Update CoinGecko mapping if needed

### 4. CoinGecko Integration

CoinGecko API works the same on Arbitrum - no changes needed. However, consider:
- Adding ARB token price fetching
- Updating market symbols if needed

### 5. RPC Configuration

Update RPC endpoints to use Arbitrum:
- Primary: Alchemy Arbitrum endpoint
- Fallback: Public Arbitrum RPC

### 6. Block Explorer Links

Update explorer URLs:
- Arbitrum Sepolia: `https://sepolia.arbiscan.io`
- Arbitrum One: `https://arbiscan.io`

---

## Gas Optimization Opportunities

### Arbitrum-Specific Optimizations

1. **Batch Operations**
   - Arbitrum supports efficient batching
   - Consider batch position operations

2. **Storage Optimization**
   - Pack structs efficiently
   - Use mappings instead of arrays where possible

3. **View Function Optimization**
   - Leverage Arbitrum's fast finality for view calls
   - Cache frequently accessed data

4. **Gas Price Strategy**
   - Arbitrum uses ETH for gas (not separate token)
   - Gas prices are more predictable than L1

### Estimated Gas Savings

| Operation | Monad (Est.) | Arbitrum (Est.) | Savings |
|-----------|--------------|-----------------|---------|
| Open Position | ~200k | ~180k | ~10% |
| Close Position | ~150k | ~135k | ~10% |
| Deposit Collateral | ~100k | ~90k | ~10% |
| Liquidate Position | ~250k | ~225k | ~10% |

*Note: Actual savings depend on network conditions*

---

## Arbitrum-Specific Features

### 1. Stylus (Rust Smart Contracts) - ✅ **IMPLEMENTED**

**What**: All contracts rewritten in Rust using Stylus SDK  
**Use Case**: All contract operations (PnL calculations, liquidations, position management)  
**Migration Status**: **Complete rewrite in progress**  
**Recommendation**: **✅ Using Stylus** - All contracts are Rust-based

**Benefits**:
- ✅ Faster execution for complex math operations
- ✅ Lower gas costs for compute-heavy functions
- ✅ Better performance for liquidation engine
- ✅ Type safety and memory safety
- ✅ Better developer experience

**Implementation**:
- All contracts in `stylus/src/` directory
- Using Stylus SDK 0.7.0
- ABI-compatible with frontend
- Full interoperability with Solidity contracts

**Resources**:
- Stylus Docs: https://docs.arbitrum.io/stylus
- Stylus Examples: https://github.com/OffchainLabs/stylus-examples
- Migration Guide: See `STYLUS_MIGRATION_GUIDE.md`

### 2. Orbit Chains (L3) - Future

**What**: Deploy custom L3 chains on Arbitrum  
**Use Case**: Isolated markets, custom fee structures  
**Migration Effort**: Very High  
**Recommendation**: **Not for hackathon** - too complex

### 3. Arbitrum Nitro Features

**What**: Built-in Arbitrum features  
**Benefits**:
- Fast finality (~1-2 seconds)
- Low gas costs
- EVM compatibility
- Native bridge to Ethereum

**Recommendation**: **Use these features** - they're automatic

---

## Testing Strategy

### 1. Unit Tests

Run existing Foundry tests on Arbitrum fork:
```bash
# Fork Arbitrum Sepolia for testing
forge test --fork-url https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

### 2. Integration Tests

Test full flow on Arbitrum Sepolia:
1. Deploy contracts
2. Register price feeds
3. Create markets
4. Deposit collateral
5. Open positions
6. Test liquidations
7. Test settlement

### 3. Frontend Testing

Test frontend against Arbitrum Sepolia:
1. Connect wallet to Arbitrum Sepolia
2. Test all trading flows
3. Verify price updates
4. Test position management
5. Verify mock position system

### 4. Gas Profiling

Profile gas usage on Arbitrum:
```bash
forge test --gas-report --fork-url https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

---

## Migration Checklist

### Pre-Migration

- [ ] Set up Arbitrum Sepolia RPC endpoint (Alchemy/Infura)
- [ ] Get Arbiscan API key for contract verification
- [ ] Obtain testnet ETH for Arbitrum Sepolia
- [ ] Review Arbitrum documentation
- [ ] Backup current Monad deployment addresses

### Contract Deployment

- [ ] Update `foundry.toml` with Arbitrum RPC
- [ ] Update `script/Deploy.s.sol` with Arbitrum Pyth address
- [ ] Deploy PythPriceAdapter to Arbitrum Sepolia
- [ ] Deploy OutcomePerpsFactory to Arbitrum Sepolia
- [ ] Verify all contracts on Arbiscan
- [ ] Register collateral tokens (USDC, etc.)
- [ ] Register Pyth price feeds (BTC/USD, ETH/USD, ARB/USD)
- [ ] Create initial markets (BTC, ETH, ARB)

### Frontend Updates

- [ ] Update `frontend/lib/config.ts` with Arbitrum networks
- [ ] Update wallet connection to support Arbitrum
- [ ] Replace MON/USD with ARB/USD in market config
- [ ] Update RPC endpoints
- [ ] Update block explorer URLs
- [ ] Test wallet connection on Arbitrum Sepolia
- [ ] Test price fetching (CoinGecko + Pyth)
- [ ] Test position opening/closing
- [ ] Test mock position system

### Testing

- [ ] Run unit tests on Arbitrum fork
- [ ] Run integration tests on Arbitrum Sepolia
- [ ] Test full user flow (deposit → trade → settle)
- [ ] Test liquidation scenarios
- [ ] Test settlement at expiry
- [ ] Profile gas usage
- [ ] Test error handling

### Documentation

- [ ] Update README.md with Arbitrum deployment instructions
- [ ] Update ARCHITECTURE.md with Arbitrum-specific notes
- [ ] Create ARBITRUM_DEPLOYMENT.md guide
- [ ] Update contract addresses in config
- [ ] Document any Arbitrum-specific considerations

### Post-Migration

- [ ] Monitor contract interactions
- [ ] Check gas usage vs estimates
- [ ] Verify oracle price updates
- [ ] Test with real users (if applicable)
- [ ] Prepare for Arbitrum One mainnet deployment (if needed)

---

## Timeline & Effort Estimate

### Phase 1: Contract Rewrite (3-4 days)
- Rewrite all contracts in Rust using Stylus SDK
- Implement Math library
- Implement PositionManager
- Implement CollateralVault
- Implement OutcomeMarket
- Implement LiquidationEngine
- Implement InsuranceFund
- Implement PythPriceAdapter
- Implement OutcomePerpsFactory
- **Effort**: High

### Phase 2: Testing (1-2 days)
- Write unit tests for all contracts
- Write integration tests
- Test with Stylus TestVM
- Fix any bugs
- **Effort**: Medium

### Phase 3: Deployment (1 day)
- Set up Stylus deployment environment
- Deploy contracts to Arbitrum Sepolia
- Activate all contracts
- Register price feeds
- Create initial markets
- Verify contracts on Arbiscan
- **Effort**: Medium

### Phase 4: Frontend Updates (1 day)
- Update network configuration
- Update wallet connection
- Replace MON/USD with ARB/USD
- Update contract ABIs
- Update RPC endpoints
- Test all flows
- **Effort**: Medium

### Phase 5: Documentation (0.5 day)
- Update documentation
- Create Stylus deployment guide
- Update migration report
- **Effort**: Low

### **Total Estimated Time: 5-7 days**

---

## Risk Assessment & Mitigation

### Low Risks ✅

1. **EVM Compatibility**
   - **Risk**: Contracts may not work on Arbitrum
   - **Mitigation**: Arbitrum is 100% EVM-compatible, no code changes needed
   - **Probability**: Very Low

2. **Oracle Integration**
   - **Risk**: Pyth may not work on Arbitrum
   - **Mitigation**: Pyth has official Arbitrum support, well-documented
   - **Probability**: Very Low

3. **Gas Costs**
   - **Risk**: Gas costs may be higher than expected
   - **Mitigation**: Arbitrum gas is ~90% cheaper than L1, costs are predictable
   - **Probability**: Low

### Medium Risks ⚠️

1. **Frontend Integration**
   - **Risk**: Wallet connection issues, RPC errors
   - **Mitigation**: Use well-tested libraries (Wagmi, AppKit), test thoroughly
   - **Probability**: Medium

2. **Price Feed Availability**
   - **Risk**: Pyth price feeds may not be available for all assets
   - **Mitigation**: Verify price feed IDs before deployment, use testnet first
   - **Probability**: Low

3. **Testnet Limitations**
   - **Risk**: Arbitrum Sepolia may have limitations
   - **Mitigation**: Test thoroughly, document any limitations
   - **Probability**: Low

### High Risks ❌

1. **Timeline Constraints**
   - **Risk**: Migration may take longer than estimated
   - **Mitigation**: Start early, prioritize core functionality
   - **Probability**: Medium

---

## Additional Resources

### Arbitrum Documentation
- **Official Docs**: https://docs.arbitrum.io
- **Developer Portal**: https://portal.arbitrum.io
- **Bridge Guide**: https://bridge.arbitrum.io

### Pyth Network on Arbitrum
- **Pyth Docs**: https://docs.pyth.network/documentation/pythnet-price-feeds/evm
- **Price Feed IDs**: https://pyth.network/developers/price-feed-ids
- **Arbitrum Integration**: https://docs.pyth.network/documentation/pythnet-price-feeds/evm#arbitrum

### Tools & Services
- **Arbiscan**: https://arbiscan.io (mainnet) / https://sepolia.arbiscan.io (testnet)
- **Alchemy**: https://www.alchemy.com/arbitrum
- **Infura**: https://www.infura.io/networks/arbitrum
- **Hardhat Arbitrum Plugin**: https://hardhat.org/plugins/nomicfoundation-hardhat-verify

### Community
- **Arbitrum Discord**: https://discord.gg/arbitrum
- **Arbitrum Forum**: https://forum.arbitrum.io
- **Arbitrum Twitter**: @arbitrum

---

## Conclusion

Migrating Perp-X from Monad Testnet to Arbitrum using **Stylus (Rust)** is a **significant rewrite** but offers substantial benefits:

1. ✅ **Complete Contract Rewrite**: All contracts rewritten in Rust using Stylus SDK
2. ✅ **Network Configuration**: Update RPC endpoints and chain IDs
3. ✅ **Stylus Deployment**: Deploy and activate contracts using cargo-stylus
4. ✅ **Oracle Integration**: Use Pyth's Arbitrum deployment (same interface)
5. ✅ **Frontend Updates**: Update network config, wallet connection, and ABIs
6. ✅ **Testing**: Comprehensive testing with Stylus TestVM

**Estimated Timeline**: 5-7 days  
**Complexity**: High (full rewrite)  
**Risk Level**: Medium (new technology, but well-documented)

The migration leverages **Arbitrum Stylus** for:
- ⚡ **Performance**: Faster execution, lower gas costs
- 🛡️ **Safety**: Rust's type system and memory safety
- 🔧 **Developer Experience**: Better tooling and error messages

The migration is **hackathon-appropriate** and showcases cutting-edge Arbitrum technology. Deploy to Arbitrum Sepolia first for testing, then to Arbitrum One for the final submission.

**See `STYLUS_MIGRATION_GUIDE.md` for detailed migration patterns and examples.**

---

## Next Steps

1. **Immediate Actions**:
   - Set up Arbitrum Sepolia RPC endpoint
   - Get Arbiscan API key
   - Obtain testnet ETH

2. **This Week**:
   - Deploy contracts to Arbitrum Sepolia
   - Update frontend configuration
   - Test basic functionality

3. **Before Submission**:
   - Complete full testing
   - Deploy to Arbitrum One (if required)
   - Update documentation
   - Prepare demo

---

**Report Generated**: December 2024  
**Last Updated**: December 2024  
**Status**: Ready for Implementation

