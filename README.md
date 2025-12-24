# Perp-X

> **A novel perpetual futures primitive with forced expiry and outcome settlement**

Build status: ✅ **ALL CONTRACTS COMPILED & READY FOR TESTING**

---

## 🎯 What This Is

A **research-level innovation** in perpetual futures design that:
- Eliminates funding rate complexity
- Prevents zombie positions through forced expiry
- Uses outcome settlement instead of manual closing
- Supports 1x-40x leverage with dynamic margins
- Enables multi-collateral (USDC, USDT, WETH, WBTC)

---

## 🏗️ Contracts Built

| Contract | Purpose | Status |
|----------|---------|--------|
| OutcomeMarket.sol | Main trading market | ✅ Compiled |
| PositionManager.sol | Position tracking | ✅ Compiled |
| OutcomePerpsFactory.sol | Market deployment | ✅ Compiled |
| CollateralVault.sol | Multi-asset collateral | ✅ Compiled |
| LiquidationEngine.sol | Risk management | ✅ Compiled |
| PythPriceAdapter.sol | Oracle integration | ✅ Compiled |
| InsuranceFund.sol | Safety backstop | ✅ Compiled |

Plus **2 libraries** with perpX-inspired logic

---

## 🚀 Key Features

✨ **Forced Expiry**: 24h-30d market duration (no infinite positions)
💰 **Automatic Settlement**: PnL settles at expiry (no manual closing)
📊 **No Funding Rates**: Eliminated by design (simpler for users)
🛡️ **perpX Margin Logic**: Sophisticated liquidation checks
📈 **Dynamic Leverage**: 1x-40x with maintenance margin scaling
🪙 **Multi-Collateral**: USDC, USDT, WETH, WBTC

---

## 🧮 perpX Integration

Adapted key concepts from perpX Solana DEX:

1. **Margin Ratio Calculation**
   - `marginRatio = (equity / positionSize) * 10000`
   - Liquidatable when below maintenance threshold

2. **Position Equity**
   - `equity = collateral + PnL + accumulatedFunding`
   - Better tracking of position health

3. **Dynamic Maintenance Margins**
   - 1x: 50% | 5x: 10% | 10x: 5% | 40x: 1.25%
   - Higher leverage = stricter requirements

4. **Open Interest Imbalance**
   - Track long/short ratio
   - Calculate price impact from imbalance

---

## 📊 Build Status

```bash
✅ Compilation: SUCCESS
├─ 7 core contracts
├─ 2 libraries
├─ 5 interfaces
└─ 0 compilation errors (linting warnings only)
```

---

## 📁 Project Structure

```
contracts/
├── core/
│   ├── OutcomeMarket.sol
│   ├── PositionManager.sol      (+ perpX health metrics)
│   └── OutcomePerpsFactory.sol
├── collateral/
│   └── CollateralVault.sol
├── liquidation/
│   ├── LiquidationEngine.sol    (margin-based)
│   └── InsuranceFund.sol
├── oracle/
│   └── PythPriceAdapter.sol     (Pyth on Monad)
├── interfaces/ (5 files)
└── libraries/
    ├── Math.sol                 (perpX-inspired)
    └── Oracle.sol
```

---

## 🎓 What Makes This Different

| Aspect | Traditional Perps | Outcome-Based |
|--------|------------------|---------------|
| Duration | ∞ | Fixed (24h-30d) |
| Settlement | Manual + Liquidation | Automatic at expiry |
| Funding | 8h cycles | None (no infinite positions) |
| Closing | Manual | Forced at expiry |
| Complexity | High | Low |
| UX | Confusing for new users | Simple: Long/Short → Expiry |

---

## 🚀 Next Steps

### Phase 1: Testing ✍️
- [ ] Unit tests for Math library
- [ ] Unit tests for position health calculations
- [ ] Integration tests for full user flow
- [ ] Liquidation edge case tests

### Phase 2: Deployment 🎯
- [ ] Deploy to Monad testnet
- [ ] Initialize BTC/USD market
- [ ] Initialize ETH/USD market
- [ ] Verify Pyth integration

### Phase 3: Optimization ⚡
- [ ] Gas optimization
- [ ] Batch operation support
- [ ] Storage packing

---

## 💻 How to Build

```bash
# Build contracts
forge build

# Run tests (when ready)
forge test

# Deploy (when ready)
forge script script/Deploy.s.sol --rpc-url <RPC> --private-key <KEY>
```

---

## 📚 Documentation

- **ARCHITECTURE.md**: Detailed technical deep-dive
- **DEPLOYED_ADDRESSES.md**: Contract addresses on Monad Testnet
- **frontend/README.md**: Frontend documentation
- **frontend/QUICKSTART.md**: Frontend quickstart guide
- **contracts/interfaces/**: Contract interfaces
- **contracts/libraries/Math.sol**: Math utility documentation

---

## 🎯 This is NOT:
- ❌ A clone of GMX/dYdX/Synthetix
- ❌ Traditional perpetual futures
- ❌ A spot trading DEX
- ❌ A betting app with leverage

## 🎯 This IS:
- ✅ A new perp primitive with forced expiry
- ✅ Outcome settlement instead of funding rates
- ✅ Research-level innovation
- ✅ Monad-native performance
- ✅ perpX-inspired sophisticated liquidation logic

---

**Ready for testing and deployment!** 🚀
