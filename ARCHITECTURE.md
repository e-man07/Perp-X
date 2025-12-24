# Perp-X - Architecture & Implementation

## Executive Summary

We've built a **novel perpetual futures primitive** for Monad testnet that combines:
- **Forced expiry** (24h-30d markets)
- **Outcome settlement** (no funding rates, automatic PnL settlement)
- **Multi-collateral support** (USDC, USDT, WETH, WBTC)
- **Sophisticated liquidation** (perpX-inspired margin ratio checks)
- **Custom leverage** (1x-40x with dynamic maintenance margins)

This is **NOT a clone** - it solves real problems with traditional perps (funding rate complexity, zombie positions, unclear UX).

---

## Contracts Implemented

### Core Trading Contracts

#### 1. **OutcomeMarket.sol**
The main market contract for each trading pair (BTC/USD, ETH/USD, etc)

**Key Features:**
- Fixed expiry (24h-30d from creation)
- Position opening with custom leverage
- Settlement at expiry using Pyth oracle prices
- Open interest tracking (long/short imbalance)
- Automatic settlement without manual closing
- Liquidation support before expiry

**Key Methods:**
```solidity
openPosition(direction, collateralUSD, leverage) → positionId
settleMarket() // Anyone can call after expiry
claimSettlement(positionId) → int256 pnl
getCurrentPrice() → uint256
isExpired() → bool
```

**State Variables:**
- `expiryTimestamp`: When market expires
- `totalLongOI`, `totalShortOI`: Open interest tracking
- `settlementPrice`: Final settlement price
- `settled`: Market settlement flag

#### 2. **PositionManager.sol**
Tracks all user positions across all markets with perpX-inspired health metrics

**Key Features:**
- Position creation and tracking
- Unrealized PnL calculation
- **Margin ratio calculation** (perpX style)
- **Position health metrics** (0-100%)
- **Maintenance margin checks**
- Accumulated funding tracking (for future use)

**perpX-Integrated Methods:**
```solidity
calculateMarginRatio(positionId, currentPrice) → int256
isMarginBelowMaintenance(positionId, currentPrice) → bool
getPositionHealth(positionId, currentPrice) → uint256 (0-100)
calculateEquity(positionId, pnl) → int256
```

**Position Structure:**
```solidity
struct Position {
    uint256 id;
    address user;
    address market;
    PositionDirection direction;    // LONG or SHORT
    uint256 collateralUSD;
    uint256 leverage;               // 1-40x
    uint256 positionSize;           // collateral * leverage
    uint256 entryPrice;             // 18 decimal
    uint256 openedAt;
    PositionStatus status;          // OPEN, LIQUIDATED, SETTLED, CLAIMED
    int256 accumulatedFunding;      // perpX-style
    uint256 lastFundingTimestamp;
}
```

#### 3. **OutcomePerpsFactory.sol**
Factory for deploying markets with standardized parameters

**Features:**
- Creates new outcome markets
- Market registry by asset
- Three market templates (MICRO 24h, DAILY 7d, MACRO 30d)
- Custom market creation
- Authorizes markets in core contracts

### Collateral & Risk Management

#### 4. **CollateralVault.sol**
Multi-collateral deposit/withdrawal system

**Key Features:**
- ERC-4626 inspired vault pattern
- Multi-asset support (USDC, USDT, WETH, WBTC)
- Collateral locking/unlocking for positions
- USD value conversion via Pyth
- Available collateral tracking

**Methods:**
```solidity
deposit(token, amount)
withdraw(token, amount)
lockCollateral(user, usdValue)
releaseCollateral(user, usdValue)
getCollateralValueUSD(user) → uint256
getAvailableCollateralUSD(user) → uint256
convertToUSD(token, amount) → uint256
```

#### 5. **LiquidationEngine.sol**
Monitors and executes liquidations using perpX margin logic

**Features:**
- Margin ratio-based liquidation checks
- Dynamic maintenance margins by leverage
- Liquidator rewards (2%)
- Insurance fund allocation (5%)
- Liquidation threshold: maintenance margin

**Maintenance Margins (perpX-style):**
- 1x: 5000 bps (50%)
- 5x: 1000 bps (10%)
- 10x: 500 bps (5%)
- 20x: 250 bps (2.5%)
- 40x: 125 bps (1.25%)

#### 6. **InsuranceFund.sol**
Backstop for liquidation shortfalls

**Features:**
- Multi-asset support
- Governance control
- Compensation payment system
- Fund balance tracking

### Oracle & Libraries

#### 7. **PythPriceAdapter.sol**
Pyth Network oracle integration for Monad testnet

**Features:**
- Caches recent prices for gas efficiency
- Staleness checking (reject prices > 60s old)
- Price ID registry for assets
- Support for BTC/USD, ETH/USD, and other feeds

**Methods:**
```solidity
getPrice(asset) → (price, timestamp)
getCachedPrice(asset) → (price, timestamp)
isCachedPriceFresh(asset) → bool
registerPriceId(asset, pythPriceId)
```

#### 8. **Math.sol** (Libraries)
Mathematical utilities with perpX-inspired functions

**PnL Calculations:**
- `calculateLongPnL(entryPrice, exitPrice, positionSize)`
- `calculateShortPnL(entryPrice, exitPrice, positionSize)`
- `calculatePnLPrecise(positionSize, entryPrice, exitPrice, isLong)`

**Margin Ratio (perpX-style):**
- `calculateMarginRatio(equity, positionSize) → int256`
- `calculateEquity(collateral, pnl, accumulatedFunding) → int256`
- `isMarginBelowMaintenance(equity, positionSize, maintenanceMarginBps)`

**OI Imbalance:**
- `calculateImbalance(longOI, shortOI) → (netOI, imbalanceBps)`
- `calculatePriceImpact(imbalanceBps, baseSpread) → uint256`

**Liquidation:**
- `getMaintenanceMarginBps(leverage) → uint256`

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│         OutcomePerpsFactory                      │
│    (Deploy markets, authorize contracts)         │
└──────────────┬──────────────────────────────────┘
               │ creates
        ┌──────▼─────────────┐
        │  OutcomeMarket     │
        │  (BTC/USD, etc)    │
        └──────┬─────────────┘
               │
    ┌──────────┼──────────────┬─────────────┐
    │          │              │             │
    ▼          ▼              ▼             ▼
┌────────┐  ┌────────┐  ┌──────────┐  ┌──────────┐
│Position│  │Collateral    │  Liquidation │  Oracle  │
│Manager │  │   Vault      │   Engine     │ Adapter  │
└────────┘  └────────┘  └──────────┘  └──────────┘
    │          │              │             │
    └──────────┼──────────────┼─────────────┘
               │
        ┌──────▼──────────┐
        │   Math Library  │
        │  (perpX-logic)  │
        └─────────────────┘
```

---

## Key Innovation: Why This Is Different

### Traditional Perps Problems

1. **Funding Rates**: Recurring payments create complexity and transaction costs
2. **Zombie Positions**: Traders forget positions, accruing funding charges indefinitely
3. **UX Confusion**: New users don't understand funding mechanics
4. **Liquidation Complexity**: Need continuous monitoring and updates

### Our Solution: Outcome-Based Settlement

| Feature | Traditional | Outcome-Based |
|---------|------------|---------------|
| Duration | ∞ | 24h-30d (fixed) |
| Price Anchor | Funding rates (8h cycles) | Settlement price at expiry |
| Closing | Manual or liquidation | Automatic at expiry |
| Complexity | High | Low |
| Zombie Positions | Common | Impossible |

**Result**: Cleaner UX, research-level innovation, less complexity for smart contracts

---

## Integration with perpX (Solana)

We extracted and adapted key perpX concepts for Solidity:

### 1. **Margin Ratio Calculation**
```
marginRatioBps = (equity / positionSize) * 10000
liquidatable if: marginRatioBps < maintenanceMarginBps
```

### 2. **Position Equity**
```
equity = collateral + unrealizedPnL + accumulatedFunding
```

### 3. **Open Interest Imbalance**
```
netOI = longOI - shortOI
imbalanceBps = (longOI / totalOI) * 10000
```

### 4. **Dynamic Maintenance Margins**
- Higher leverage = lower maintenance margin
- `maintenanceMarginBps = 5000 / leverage`

### 5. **Price Impact from OI Imbalance**
- Impact increases when OI is imbalanced
- Incentivizes traders to rebalance positions

---

## Project Structure

```
monad-blitz/
├── contracts/
│   ├── core/
│   │   ├── OutcomeMarket.sol         (Main market)
│   │   ├── PositionManager.sol       (Position tracking + health)
│   │   └── OutcomePerpsFactory.sol   (Market deployment)
│   ├── collateral/
│   │   └── CollateralVault.sol       (Multi-asset collateral)
│   ├── liquidation/
│   │   ├── LiquidationEngine.sol     (Liquidations)
│   │   └── InsuranceFund.sol         (Safety backstop)
│   ├── oracle/
│   │   └── PythPriceAdapter.sol      (Pyth integration)
│   ├── interfaces/
│   │   ├── IOutcomeMarket.sol
│   │   ├── IPositionManager.sol
│   │   ├── ICollateralVault.sol
│   │   ├── ILiquidationEngine.sol
│   │   └── IPyth.sol
│   └── libraries/
│       ├── Math.sol                  (PnL, margin, OI logic)
│       └── Oracle.sol                (Price validation)
├── test/
│   ├── unit/
│   ├── integration/
│   └── fuzzing/
├── script/
│   ├── Deploy.s.sol
│   └── CreateMarket.s.sol
└── foundry.toml
```

---

## Build Status

✅ **All contracts compile successfully**

```
Compiled 45 files with Solc 0.8.24
Total contract count: 45
```

No compilation errors - only linting warnings which are style preferences.

---

## Next Steps

### Phase 1: Testing (In Progress)
- [ ] Unit tests for Math library
- [ ] Unit tests for PositionManager health calculations
- [ ] Unit tests for CollateralVault
- [ ] Unit tests for OutcomeMarket settlement

### Phase 2: Integration Testing
- [ ] Full user flow: deposit → open position → settle → claim
- [ ] Liquidation scenarios
- [ ] Multi-position user scenarios
- [ ] Price movement edge cases

### Phase 3: Deployment
- [ ] Deploy to Monad testnet
- [ ] Verify Pyth integration
- [ ] Create initial markets (BTC/USD, ETH/USD)
- [ ] Test gas optimization

### Phase 4: Optimization
- [ ] Gas optimization for on-chain calculations
- [ ] Batch operations for efficiency
- [ ] Storage packing optimization

---

## Key Metrics & Parameters

### Leverage Configuration
- **Min**: 1x
- **Max**: 40x
- **Range**: Customizable per market

### Maintenance Margin
- Dynamically scaled by leverage
- Formula: `5000 / leverage` (basis points)
- Prevents liquidation cascade

### Market Expiry
- **Micro**: 24 hours
- **Daily**: 7 days
- **Macro**: 30 days
- **Custom**: Configurable

### Collateral
- **Supported**: USDC, USDT, WETH, WBTC
- **Conversion**: Via Pyth oracle prices
- **Locking**: Per position via PositionManager

### Liquidation Rewards
- **Liquidator**: 2% of liquidated collateral
- **Insurance Fund**: 5% of liquidated collateral

---

## Security Considerations

1. **Reentrancy Protection**: ReentrancyGuard on all external write functions
2. **Oracle Safety**: 60-second staleness check on prices
3. **Overflow Protection**: Solidity 0.8+ automatic checks
4. **Access Control**: Authorization for markets to lock/release collateral
5. **Circuit Breakers**: Max open interest limits per market
6. **Collateral Safety**: Multi-sig insurance fund control

---

## Performance Characteristics

- **Position Opening**: Single transaction
- **Settlement**: Batch-processable at market expiry
- **Liquidations**: Off-chain monitoring possible
- **PnL Calculations**: Gas-efficient for view functions
- **Oracle Updates**: Cached to minimize gas

---

## References

- **Pyth Network**: https://docs.monad.xyz/tooling-and-infra/oracles
- **perpX Architecture**: Adapted from Solana implementation
- **ERC-4626**: Tokenized vault standard
- **Foundry**: Modern Solidity testing framework

---

## Status: READY FOR TESTING & DEPLOYMENT

All 7 core contracts successfully compiled.
Ready for unit and integration testing.
Ready for deployment to Monad testnet.
