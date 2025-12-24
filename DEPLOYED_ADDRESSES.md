# 🎯 Deployed Contract Addresses - Monad Testnet

**Deployment Date:** December 20, 2025  
**Network:** Monad Testnet  
**Chain ID:** 10143  
**RPC:** https://testnet-rpc.monad.xyz  
**Deployer:** 0x21EB932bC4A296bd358be6E352894bad7b429a4C

---

## Core Contracts

### PythPriceAdapter
- **Address:** `0xc719485FEB9FE5C9bEBDa2563a95Eb9415c52685`
- **TX Hash:** `0x2ffb0dfc6d90bc0d523283473d1bec345564f7ce1c1d1e2eeb0a9d1e97dd60d1`
- **Purpose:** Oracle price adapter for Pyth Network

### OutcomePerpsFactory
- **Address:** `0xc0dE7CC8e01Be092ea46A6A7e5Fac30590cDcD12`
- **TX Hash:** `0x09ba4a455523f4b1c8b9a595ae1904dfbfb3da8319f3a77be9d39bcf292db79e`
- **Purpose:** Factory contract for creating markets and managing core contracts

### PositionManager
- **Address:** `0x6f4369a2f5ef635eb002239078f13ee8f5b72cdf`
- **Purpose:** Manages all user positions and health tracking

### CollateralVault (✅ FIXED VERSION)
- **Address:** `0x586506fadf4d357a9935ee8e3efa16395b8eb324`
- **Purpose:** Multi-collateral deposits and treasury-based PnL settlement
- **Features:**
  - ✅ Ownable access control
  - ✅ Fixed decimal conversion for USDC/USDT
  - ✅ Treasury reserve safety checks
  - ✅ Price staleness validation
  - ✅ Optimized gas usage

### LiquidationEngine
- **Address:** `0x19254e609519b89db57289cabd01f22ec8c80f12`
- **Purpose:** Handles position liquidations based on margin ratios

### InsuranceFund
- **Address:** `0x0b9a4e67bf5bacd377717aaf939e158825c39313`
- **Purpose:** Backstop for liquidation shortfalls

---

## Quick Reference Commands

### Check Contract Status
```bash
export FACTORY=0xc0dE7CC8e01Be092ea46A6A7e5Fac30590cDcD12
export VAULT=0x586506fadf4d357a9935ee8e3efa16395b8eb324
export PYTH_ADAPTER=0xc719485FEB9FE5C9bEBDa2563a95Eb9415c52685

# Check vault owner
cast call $VAULT "owner()" --rpc-url https://testnet-rpc.monad.xyz

# Check treasury balance (for a token)
cast call $VAULT "getTreasuryBalance(address)" <token_address> --rpc-url https://testnet-rpc.monad.xyz
```

---

## Next Steps for Setup

### 1. Deploy Mock ERC20 Tokens (for testing)
```bash
# You'll need to deploy test tokens like Mock USDC
# Example:
forge create src/mocks/MockERC20.sol:MockERC20 \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY \
  --constructor-args "Mock USDC" "mUSDC" 6 \
  --broadcast --legacy
```

### 2. Add Supported Tokens to Vault
```bash
# Add Mock USDC as collateral
cast send $VAULT "addSupportedToken(address,string)" \
  <mock_usdc_address> "USDC" \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY \
  --legacy

# Set as default stablecoin
cast send $VAULT "setDefaultStablecoin(address)" \
  <mock_usdc_address> \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY \
  --legacy
```

### 3. Seed Treasury
```bash
# Seed treasury with 100k USDC for demo
cast send $VAULT "seedTreasuryTestnet(address,uint256)" \
  <mock_usdc_address> 100000000000 \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY \
  --legacy
```

### 4. Register Price Feeds
```bash
# Register BTC/USD price feed
cast send $PYTH_ADAPTER "registerPriceId(string,bytes32)" \
  "BTC/USD" 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43 \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY \
  --legacy

# Register ETH/USD
cast send $PYTH_ADAPTER "registerPriceId(string,bytes32)" \
  "ETH/USD" 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY \
  --legacy
```

### 5. Create Markets
```bash
# Create BTC 24-hour market
cast send $FACTORY "createMarket(bytes32,string,uint8,uint256)" \
  0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43 \
  "BTC/USD" 0 1000000000000000000000000 \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY \
  --legacy
```

---

## Block Explorer

View contracts on Monad testnet explorer:
- Factory: https://explorer.testnet.monad.xyz/address/0xc0dE7CC8e01Be092ea46A6A7e5Fac30590cDcD12
- Vault: https://explorer.testnet.monad.xyz/address/0x586506fadf4d357a9935ee8e3efa16395b8eb324

---

## Key Features Deployed

✅ **Treasury-Based Settlement**
- Profits paid from treasury pool
- Losses collected to treasury pool
- Self-balancing system

✅ **Security Fixes Applied**
- Access control on all admin functions
- Correct decimal handling for all tokens
- Price staleness checks
- Treasury reserve protection (10k USDC minimum)

✅ **Multi-Collateral Support**
- Can add USDC, USDT, WETH, WBTC
- Automatic USD value conversion
- Cross-collateral position opening

✅ **Early Exit Functionality**
- Dynamic fees (0.1% - 0.5%)
- Real-time PnL settlement
- Immediate profit payouts

---

## Status: ✅ READY FOR DEMO

All contracts successfully deployed and ready for:
- Mock token setup
- Treasury seeding
- Market creation
- User testing

**Total Deployment Time:** ~2 minutes  
**Gas Used:** Minimal (testnet)  
**Status:** Production-ready for hackathon demo
