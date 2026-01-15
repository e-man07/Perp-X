# perpX

<p align="center">
  <img src="frontend/public/perpx-logo.png" alt="perpX Logo" width="300" />
</p>

> **Leveraged Prediction Markets with Forced Expiry on Arbitrum**

[![Status](https://img.shields.io/badge/Status-Live%20on%20Testnet-green)]()
[![Network](https://img.shields.io/badge/Network-Arbitrum%20Sepolia-blue)]()
[![License](https://img.shields.io/badge/License-MIT-yellow)]()

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Key Innovations](#key-innovations)
- [Live Deployment](#live-deployment)
- [System Architecture](#system-architecture)
- [Smart Contracts Deep Dive](#smart-contracts-deep-dive)
- [Frontend Application](#frontend-application)
- [Trading Mechanics](#trading-mechanics)
- [Fee Structure](#fee-structure)
- [Risk Management](#risk-management)
- [Getting Started](#getting-started)
- [Development Guide](#development-guide)
- [API Reference](#api-reference)
- [Security Considerations](#security-considerations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Resources](#resources)

---

## Overview

perpX is a decentralized leveraged trading protocol that reimagines perpetual futures by introducing **forced expiry** and **outcome-based settlement**. Unlike traditional perpetuals that run indefinitely with complex funding rate mechanisms, perpX markets have fixed durations (24 hours, 7 days, or 30 days) and automatically settle at expiry based on the final price.

This design creates a hybrid between prediction markets and leveraged trading, offering users a simpler mental model: **"Will the price be higher or lower at expiry?"**

---

## The Problem

Traditional perpetual futures have several pain points:

1. **Funding Rate Complexity**: Users must understand and manage 8-hour funding cycles that can erode profits
2. **Zombie Positions**: Forgotten positions can accumulate losses indefinitely
3. **High Cognitive Load**: Managing open-ended positions requires constant monitoring
4. **Liquidation Anxiety**: No natural exit point leads to forced liquidations during volatility
5. **Poor UX for Beginners**: The mechanics are confusing for new traders

---

## Our Solution

perpX addresses these issues with a novel approach:

| Traditional Perps | perpX |
|------------------|--------|
| Infinite duration | Fixed expiry (24h/7d/30d) |
| Complex funding rates | No funding rates |
| Manual position management | Automatic settlement |
| Requires constant monitoring | Set and forget |
| Confusing for beginners | Simple prediction model |

### User Flow

```
1. User predicts: "BTC will be above $95,000 in 24 hours"
2. Opens LONG position with 10x leverage
3. Either:
   a) Closes early to lock in profits/cut losses (0.5% → 0.1% dynamic fee)
   b) Waits for automatic settlement at expiry
4. PnL is calculated and settled automatically
```

---

## Key Innovations

### 1. Forced Expiry Mechanism
Every market has a predetermined expiry timestamp. When reached:
- All positions are automatically settled
- PnL is calculated based on final oracle price
- Winners receive payouts from the treasury pool
- No manual intervention required

### 2. Treasury Pool Model
```
┌─────────────────────────────────────────────────────────┐
│                    TREASURY POOL                         │
│  ┌─────────────┐                    ┌─────────────┐     │
│  │   Losers    │ ──────────────────▶│   Winners   │     │
│  │  Pay In     │                    │  Paid Out   │     │
│  └─────────────┘                    └─────────────┘     │
│                         │                               │
│                         ▼                               │
│              ┌─────────────────┐                        │
│              │  Protocol Fees  │                        │
│              │  (Early Exit)   │                        │
│              └─────────────────┘                        │
└─────────────────────────────────────────────────────────┘
```

### 3. Dynamic Early Exit Fees
Users can close positions before expiry with a time-decaying fee:
- **At opening**: 0.5% fee
- **At expiry**: 0.1% fee
- **Linear decay**: Fee decreases as expiry approaches

### 4. No Funding Rates
By forcing expiry, we eliminate the need for funding rate mechanisms entirely. This simplifies the user experience and removes a major source of confusion and unexpected costs.

---

## Live Deployment

**Network**: Arbitrum Sepolia Testnet
**Chain ID**: 421614
**Block Explorer**: [sepolia.arbiscan.io](https://sepolia.arbiscan.io)

### Deployed Market Contracts

| Market | Contract Address | Pyth Price Feed | Expiry |
|--------|-----------------|-----------------|--------|
| BTC/USD | [`0xbd1b96f0bcffee4dfdcc683fbec612cddb5d24d8`](https://sepolia.arbiscan.io/address/0xbd1b96f0bcffee4dfdcc683fbec612cddb5d24d8) | `0xe62df6c8...` | 24h |
| ETH/USD | [`0x3e741a1d222dc8a392a7caf4d12a8a8b6fb69800`](https://sepolia.arbiscan.io/address/0x3e741a1d222dc8a392a7caf4d12a8a8b6fb69800) | `0xff61491a...` | 24h |
| ARB/USD | [`0x95d352b33d82985200c4b5eb83d7a78744f86e85`](https://sepolia.arbiscan.io/address/0x95d352b33d82985200c4b5eb83d7a78744f86e85) | `0x3fa42528...` | 24h |

### Core Infrastructure Contracts

| Contract | Address | Description |
|----------|---------|-------------|
| **CollateralVault** | [`0x456628c1ac3da5b0a1b15f28762a643a38ae5745`](https://sepolia.arbiscan.io/address/0x456628c1ac3da5b0a1b15f28762a643a38ae5745) | Manages user deposits, withdrawals, and collateral locking |
| **PositionManager** | [`0xcb3e422143d1c5603c86b0ccd419156bf5d8b045`](https://sepolia.arbiscan.io/address/0xcb3e422143d1c5603c86b0ccd419156bf5d8b045) | Tracks all positions, calculates PnL and health metrics |
| **PriceAdapter** | [`0xcadfc95764e2480d3a44f3a74fb5bd225582e012`](https://sepolia.arbiscan.io/address/0xcadfc95764e2480d3a44f3a74fb5bd225582e012) | Interfaces with Pyth Network for price feeds |
| **LiquidationEngine** | [`0x2361425d154e66aca0272b718571836203601983`](https://sepolia.arbiscan.io/address/0x2361425d154e66aca0272b718571836203601983) | Handles margin checks and liquidation execution |
| **InsuranceFund** | [`0xb10706d5d65bba12092ff359005c216ee863a344`](https://sepolia.arbiscan.io/address/0xb10706d5d65bba12092ff359005c216ee863a344) | Protocol safety net for extreme market conditions |
| **OrderBook** | [`0x0fcd5872c3730ac931d6ef52256b35e1079d40e6`](https://sepolia.arbiscan.io/address/0x0fcd5872c3730ac931d6ef52256b35e1079d40e6) | Manages pending and limit orders |
| **CrossMargin** | [`0xce63953845b7b9732ed5fd0f0b519881f7904f66`](https://sepolia.arbiscan.io/address/0xce63953845b7b9732ed5fd0f0b519881f7904f66) | Cross-margin account management |
| **UserMarketFactory** | [`0xbb738208be7a40977b34cf288c9fe13c01fa313d`](https://sepolia.arbiscan.io/address/0xbb738208be7a40977b34cf288c9fe13c01fa313d) | Factory for deploying new markets |

### External Contracts

| Contract | Address | Description |
|----------|---------|-------------|
| **Circle USDC** | [`0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`](https://sepolia.arbiscan.io/address/0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d) | Official Circle USDC on Arbitrum Sepolia (6 decimals) |
| **Pyth Oracle** | [`0xC5E56d6b40F3e5F65e23aEe2e85dD8139279C11C`](https://sepolia.arbiscan.io/address/0xC5E56d6b40F3e5F65e23aEe2e85dD8139279C11C) | Pyth Network price oracle |

---

## System Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │   Trade    │  │  Markets   │  │ Portfolio  │  │   Header   │     │
│  │   Page     │  │   Page     │  │   Page     │  │  + Wallet  │     │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘     │
│        │               │               │               │             │
│        └───────────────┴───────┬───────┴───────────────┘             │
│                                │                                      │
│                    ┌───────────▼───────────┐                         │
│                    │    React Hooks        │                         │
│                    │  (useTrading, etc.)   │                         │
│                    └───────────┬───────────┘                         │
└────────────────────────────────┼─────────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │      wagmi / viem       │
                    │    (Web3 Interface)     │
                    └────────────┬────────────┘
                                 │
┌────────────────────────────────▼─────────────────────────────────────┐
│                     ARBITRUM SEPOLIA                                  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                    OUTCOME MARKETS                           │     │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐                │     │
│  │  │  BTC/USD  │  │  ETH/USD  │  │  ARB/USD  │                │     │
│  │  │  Market   │  │  Market   │  │  Market   │                │     │
│  │  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘                │     │
│  │        └──────────────┼──────────────┘                       │     │
│  └───────────────────────┼──────────────────────────────────────┘     │
│                          │                                            │
│  ┌───────────────────────▼──────────────────────────────────────┐    │
│  │                  CORE INFRASTRUCTURE                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │    │
│  │  │ Collateral  │  │  Position   │  │ Liquidation │           │    │
│  │  │   Vault     │◄─┤  Manager    │◄─┤   Engine    │           │    │
│  │  └──────┬──────┘  └──────┬──────┘  └─────────────┘           │    │
│  │         │                │                                    │    │
│  │  ┌──────▼──────┐  ┌──────▼──────┐  ┌─────────────┐           │    │
│  │  │  Insurance  │  │   Price     │  │   Order     │           │    │
│  │  │    Fund     │  │  Adapter    │◄─┤    Book     │           │    │
│  │  └─────────────┘  └──────┬──────┘  └─────────────┘           │    │
│  └──────────────────────────┼────────────────────────────────────┘    │
│                             │                                         │
│                    ┌────────▼────────┐                               │
│                    │   Pyth Oracle   │                               │
│                    │  (Price Feeds)  │                               │
│                    └─────────────────┘                               │
└───────────────────────────────────────────────────────────────────────┘
```

### Contract Interaction Flow

```
Opening a Position:
──────────────────

User                    OutcomeMarket           PositionManager         CollateralVault
  │                          │                        │                       │
  │  openPosition()          │                        │                       │
  │─────────────────────────▶│                        │                       │
  │                          │  lockCollateral()      │                       │
  │                          │───────────────────────────────────────────────▶│
  │                          │                        │                       │
  │                          │  createPosition()      │                       │
  │                          │───────────────────────▶│                       │
  │                          │                        │                       │
  │                          │  positionId            │                       │
  │◀─────────────────────────│◀───────────────────────│                       │
  │                          │                        │                       │


Closing a Position:
───────────────────

User                    OutcomeMarket           PositionManager         CollateralVault
  │                          │                        │                       │
  │  closePosition()         │                        │                       │
  │─────────────────────────▶│                        │                       │
  │                          │  calculatePnL()        │                       │
  │                          │───────────────────────▶│                       │
  │                          │                        │                       │
  │                          │  pnl                   │                       │
  │                          │◀───────────────────────│                       │
  │                          │                        │                       │
  │                          │  releaseCollateral()   │                       │
  │                          │  + payProfit/Loss()    │                       │
  │                          │───────────────────────────────────────────────▶│
  │                          │                        │                       │
  │  funds                   │                        │                       │
  │◀─────────────────────────│                        │                       │
```

---

## Smart Contracts Deep Dive

All contracts are written in **Rust** and compiled to **WASM** using [Arbitrum Stylus](https://docs.arbitrum.io/stylus/stylus-gentle-introduction). This provides:

- **Better Performance**: WASM execution is faster than EVM bytecode
- **Memory Safety**: Rust's ownership model prevents common vulnerabilities
- **Lower Gas Costs**: More efficient computation
- **Rich Tooling**: Leverage the Rust ecosystem

### Contract Details

#### OutcomeMarket.rs
The main trading contract for each market.

**Key Functions:**
```rust
// Open a new leveraged position
fn open_position(
    direction: Direction,      // LONG (0) or SHORT (1)
    collateral_usd: U256,     // Collateral amount (18 decimals)
    leverage: U256            // Leverage multiplier (1-40)
) -> Result<U256, Error>      // Returns position ID

// Close an existing position
fn close_position(
    position_id: U256
) -> Result<(), Error>

// Settle all positions at expiry (admin only)
fn settle_market() -> Result<(), Error>

// Get current cached price
fn get_cached_price() -> U256

// Update price from oracle
fn update_price_cache(price: U256) -> Result<(), Error>
```

**State Variables:**
- `expiry_timestamp`: When the market settles
- `price_feed_id`: Pyth oracle price feed identifier
- `total_long_oi`: Total long open interest
- `total_short_oi`: Total short open interest
- `settled`: Whether market has been settled
- `settlement_price`: Final price at settlement

#### PositionManager.rs
Tracks all positions across all markets.

**Key Functions:**
```rust
// Create a new position record
fn create_position(
    user: Address,
    market: Address,
    direction: u8,
    collateral_usd: U256,
    leverage: U256,
    entry_price: U256
) -> Result<U256, Error>

// Get position details
fn get_position(position_id: U256) -> Position

// Get all positions for a user
fn get_user_positions(user: Address) -> Vec<U256>

// Calculate unrealized PnL
fn calculate_unrealized_pnl(
    position_id: U256,
    current_price: U256
) -> I256

// Get liquidation price
fn get_liquidation_price(position_id: U256) -> U256

// Check if position is liquidatable
fn is_margin_below_maintenance(
    position_id: U256,
    current_price: U256
) -> bool
```

**Position Struct:**
```rust
struct Position {
    id: U256,
    user: Address,
    market: Address,
    direction: u8,          // 0 = LONG, 1 = SHORT
    collateral_usd: U256,   // 18 decimals
    leverage: U256,
    position_size: U256,    // collateral * leverage
    entry_price: U256,      // 18 decimals
    opened_at: U256,        // timestamp
    status: u8              // 0=OPEN, 1=CLOSED, 2=LIQUIDATED, 3=SETTLED
}
```

#### CollateralVault.rs
Manages all user collateral.

**Key Functions:**
```rust
// Deposit collateral tokens
fn deposit(token: Address, amount: U256) -> Result<(), Error>

// Withdraw available collateral
fn withdraw(token: Address, amount: U256) -> Result<(), Error>

// Lock collateral for a position (called by markets)
fn lock_collateral(user: Address, usd_value: U256) -> Result<(), Error>

// Release locked collateral
fn release_collateral(user: Address, usd_value: U256) -> Result<(), Error>

// Pay profit to user (from treasury)
fn pay_profit(user: Address, usd_amount: U256) -> Result<(), Error>

// Collect loss from user
fn collect_loss(user: Address, usd_amount: U256) -> Result<(), Error>

// Get user's collateral balance
fn get_collateral_balance(user: Address, token: Address) -> U256

// Check if token is supported
fn is_supported_collateral(token: Address) -> bool

// Add supported token (admin only)
fn add_supported_token(token: Address, price_asset: String) -> Result<(), Error>
```

#### LiquidationEngine.rs
Handles position liquidations.

**Key Functions:**
```rust
// Liquidate an undercollateralized position
fn liquidate_position(
    market: Address,
    position_id: U256
) -> Result<(), Error>

// Check if position can be liquidated
fn can_liquidate(
    position_id: U256,
    current_price: U256
) -> bool

// Calculate liquidation penalty
fn calculate_penalty(position_size: U256) -> U256
```

#### PriceAdapter.rs
Interfaces with Pyth Network oracle.

**Key Functions:**
```rust
// Get latest price for an asset
fn get_price(price_feed_id: [u8; 32]) -> Result<U256, Error>

// Submit price update (with Pyth VAA)
fn submit_price(
    price_feed_id: [u8; 32],
    price: U256
) -> Result<(), Error>

// Get price with confidence interval
fn get_price_with_confidence(
    price_feed_id: [u8; 32]
) -> Result<(U256, U256), Error>
```

---

## Frontend Application

Built with **Next.js 16**, **React 19**, and **TypeScript** for a modern, performant trading experience.

### Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | React framework with App Router |
| React 19 | UI library |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| wagmi v2 | React hooks for Ethereum |
| viem | TypeScript Ethereum library |
| Reown AppKit | Wallet connection |
| TanStack Query | Data fetching & caching |

### Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   ├── trade/
│   │   └── page.tsx             # Trading terminal
│   ├── markets/
│   │   └── page.tsx             # Market overview
│   ├── portfolio/
│   │   └── page.tsx             # Portfolio management
│   └── api/
│       └── coingecko/
│           ├── price/route.ts   # Price API proxy
│           └── candles/route.ts # OHLCV data proxy
│
├── components/
│   ├── layout/
│   │   └── Header.tsx           # Navigation header
│   ├── trading/
│   │   ├── TradingPanel.tsx     # Position opening form
│   │   ├── PositionsPanel.tsx   # Open positions list
│   │   ├── PositionRow.tsx      # Individual position display
│   │   ├── MarketSelector.tsx   # Market dropdown
│   │   ├── PriceChart.tsx       # TradingView-style chart
│   │   └── OrderBook.tsx        # Order book display
│   ├── providers/
│   │   ├── Web3Provider.tsx     # wagmi + AppKit setup
│   │   └── NetworkGuard.tsx     # Network switching
│   └── ui/
│       ├── Button.tsx           # Styled button component
│       ├── Card.tsx             # Card container
│       └── Input.tsx            # Form input
│
├── hooks/
│   ├── useTrading.ts            # Position open/close hooks
│   ├── usePositions.ts          # Position data fetching
│   ├── useVault.ts              # Collateral management
│   ├── useMarketData.ts         # Market statistics
│   ├── useCoinGecko.ts          # Real-time price feeds
│   ├── useUpdatePrice.ts        # Oracle price updates
│   ├── useCrossMargin.ts        # Cross-margin accounts
│   └── useSupportedTokens.ts    # Supported collateral
│
├── lib/
│   ├── config.ts                # Contract addresses & config
│   ├── web3.ts                  # Web3 initialization
│   ├── utils.ts                 # Utility functions
│   └── abis/
│       ├── OutcomeMarket.ts     # Market ABI
│       ├── PositionManager.ts   # Position ABI
│       ├── CollateralVault.ts   # Vault ABI
│       └── ERC20.ts             # ERC20 ABI
│
└── public/                      # Static assets
```

### Key Components

#### TradingPanel
The main interface for opening positions:
- Direction selection (Long/Short)
- Collateral input
- Leverage slider (1x-40x)
- Position preview (size, entry price, liquidation price)
- Fee calculation
- Transaction status tracking

#### PositionsPanel
Displays all user positions with:
- Real-time PnL (using CoinGecko prices)
- Entry vs current price comparison
- Liquidation price warning
- Close position functionality
- Position status (Open/Closed/Liquidated/Settled)

#### PriceChart
TradingView-style price chart:
- OHLCV candlestick data
- Multiple timeframes
- Real-time price updates
- Responsive design

### Custom Hooks

#### useTrading
```typescript
// Open a new position
const { openPosition, isPending, isSuccess, error } = useOpenPosition();
openPosition(marketAddress, direction, collateralUSD, leverage);

// Close an existing position
const { closePosition, isPending, isSuccess } = useClosePosition();
closePosition(marketAddress, positionId);
```

#### usePositions
```typescript
// Get all user position IDs
const { positionIds, refetch } = useUserPositions();

// Get detailed position data
const { position } = usePositionDetails(positionId, marketAddress);
// Returns: { id, user, market, direction, collateralUSD, leverage,
//           positionSize, entryPrice, currentPrice, pnl, liquidationPrice }
```

#### useVault
```typescript
// Get vault balances
const { availableCollateral, totalCollateral, lockedCollateral } = useVaultBalance();

// Get wallet token balance and allowance
const { balance, allowance, isSupported } = useTokenBalance(tokenAddress);

// Approve token spending
const { approve, isPending } = useApproveToken();
approve(tokenAddress, amount);

// Deposit to vault
const { deposit, isPending } = useDepositCollateral();
deposit(tokenAddress, amount);

// Withdraw from vault
const { withdraw, isPending } = useWithdrawCollateral();
withdraw(tokenAddress, amount);
```

#### useCoinGecko
```typescript
// Get real-time price with 24h change
const { price, change24h, change24hPercent, isLoading, error } = useCoinGeckoPrice('BTC/USD');
```

---

## Trading Mechanics

### Position Calculations

#### Position Size
```
Position Size = Collateral × Leverage

Example:
- Collateral: $100 USDC
- Leverage: 10x
- Position Size: $1,000
```

#### Profit & Loss (PnL)

**For LONG positions:**
```
PnL = Position Size × (Current Price - Entry Price) / Entry Price

Example:
- Entry Price: $90,000
- Current Price: $95,000
- Position Size: $1,000
- PnL = $1,000 × ($95,000 - $90,000) / $90,000
- PnL = $1,000 × 0.0556 = $55.56 profit
```

**For SHORT positions:**
```
PnL = Position Size × (Entry Price - Current Price) / Entry Price

Example:
- Entry Price: $90,000
- Current Price: $85,000
- Position Size: $1,000
- PnL = $1,000 × ($90,000 - $85,000) / $90,000
- PnL = $1,000 × 0.0556 = $55.56 profit
```

#### Liquidation Price

**For LONG positions:**
```
Liquidation Price = Entry Price × (1 - 1/Leverage)

Example (10x leverage):
- Entry Price: $90,000
- Liquidation Price = $90,000 × (1 - 1/10)
- Liquidation Price = $90,000 × 0.9 = $81,000
```

**For SHORT positions:**
```
Liquidation Price = Entry Price × (1 + 1/Leverage)

Example (10x leverage):
- Entry Price: $90,000
- Liquidation Price = $90,000 × (1 + 1/10)
- Liquidation Price = $90,000 × 1.1 = $99,000
```

#### Margin Ratio
```
Margin Ratio = (Equity / Position Size) × 10000

Where:
- Equity = Collateral + Unrealized PnL

Maintenance Margin Requirements:
- 1x leverage: 50% (5000 basis points)
- 5x leverage: 10% (1000 basis points)
- 10x leverage: 5% (500 basis points)
- 20x leverage: 2.5% (250 basis points)
- 40x leverage: 1.25% (125 basis points)
```

---

## Fee Structure

### Trading Fees

| Fee Type | Amount | Description |
|----------|--------|-------------|
| Opening Fee | 0.0% | No fee to open positions |
| Early Close Fee | 0.5% → 0.1% | Time-decaying fee for closing before expiry |
| Settlement Fee | 0.0% | No fee for automatic settlement |
| Liquidation Penalty | 5% | Penalty on liquidated positions |

### Early Exit Fee Formula
```
Fee Rate = 0.5% - (0.4% × Time Elapsed / Total Duration)

Example (24h market):
- Close after 6 hours: 0.5% - (0.4% × 6/24) = 0.4%
- Close after 12 hours: 0.5% - (0.4% × 12/24) = 0.3%
- Close after 18 hours: 0.5% - (0.4% × 18/24) = 0.2%
- Close after 23 hours: 0.5% - (0.4% × 23/24) ≈ 0.1%
```

---

## Risk Management

### Position Limits
- **Maximum Leverage**: 40x
- **Minimum Collateral**: $1 USDC
- **Maximum Position Size**: Limited by available liquidity

### Liquidation Process
1. Position margin ratio falls below maintenance requirement
2. Anyone can call `liquidatePosition()`
3. Position is closed at current market price
4. 5% liquidation penalty is applied
5. Remaining collateral (if any) returned to user
6. Penalty goes to insurance fund

### Insurance Fund
The insurance fund serves as a safety net:
- Funded by liquidation penalties
- Covers bad debt from underwater liquidations
- Can be used for protocol emergencies

### Oracle Security
- **Primary**: Pyth Network (decentralized, low-latency)
- **Fallback**: CoinGecko API (for display only)
- **Staleness Check**: Prices must be updated within acceptable timeframe
- **Confidence Interval**: Large confidence intervals trigger caution

---

## Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **Wallet**: MetaMask or any WalletConnect-compatible wallet
- **Test ETH**: For gas fees on Arbitrum Sepolia
- **Test USDC**: For trading collateral

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/perp-x.git
cd perp-x

# 2. Install dependencies
cd frontend
npm install

# 3. Configure environment
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_from_cloud.reown.com
```

```bash
# 4. Start development server
npm run dev
```

Visit `http://localhost:3000`

### Getting Test Tokens

1. **Test ETH** (for gas):
   - [Alchemy Faucet](https://www.alchemy.com/faucets/arbitrum-sepolia)
   - [QuickNode Faucet](https://faucet.quicknode.com/arbitrum/sepolia)

2. **Test USDC** (for trading):
   - [Circle Faucet](https://faucet.circle.com/) - Select "Arbitrum Sepolia"

### First Trade

1. Connect your wallet
2. Switch to Arbitrum Sepolia network (automatic prompt)
3. Go to Portfolio → Deposit USDC to vault
4. Go to Trade → Select market (BTC/USD)
5. Choose Long or Short
6. Enter collateral amount and leverage
7. Click "Predict Price Goes UP/DOWN"
8. Confirm transaction in wallet

---

## Development Guide

### Building Stylus Contracts

```bash
cd stylus

# Install Rust toolchain
rustup default nightly-2024-01-01
rustup target add wasm32-unknown-unknown

# Build contracts
./build.sh

# Deploy (requires private key)
cargo stylus deploy --private-key $PRIVATE_KEY
```

### Frontend Development

```bash
cd frontend

# Development mode (with hot reload)
npm run dev

# Type checking
npm run lint

# Production build
npm run build

# Start production server
npm start
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_REOWN_PROJECT_ID` | Reown Cloud project ID for wallet connection | Yes |

### Testing Locally

```bash
# Run frontend tests
npm test

# Run with coverage
npm run test:coverage
```

---

## API Reference

### CoinGecko Price Proxy

**Endpoint**: `GET /api/coingecko/price`

**Query Parameters:**
- `symbol`: Trading pair (e.g., `BTC/USD`, `ETH/USD`, `ARB/USD`)

**Response:**
```json
{
  "price": 94523.45,
  "change24h": 1234.56,
  "change24hPercent": 1.32,
  "lastUpdated": "2024-01-15T12:00:00Z"
}
```

### CoinGecko Candles Proxy

**Endpoint**: `GET /api/coingecko/candles`

**Query Parameters:**
- `symbol`: Trading pair
- `days`: Number of days (1, 7, 30, 90, 365)

**Response:**
```json
{
  "candles": [
    {
      "timestamp": 1705312800000,
      "open": 94000,
      "high": 95000,
      "low": 93500,
      "close": 94500
    }
  ]
}
```

---

## Security Considerations

### Smart Contract Security

1. **Rust Memory Safety**: Stylus contracts benefit from Rust's ownership model
2. **Reentrancy Protection**: All state changes before external calls
3. **Access Control**: Admin functions protected by owner checks
4. **Integer Overflow**: Rust's checked arithmetic by default
5. **Oracle Manipulation**: Multiple price sources and staleness checks

### Frontend Security

1. **No Private Keys**: All signing done in wallet
2. **Input Validation**: All user inputs validated before transactions
3. **Slippage Protection**: Price checks before execution
4. **Rate Limiting**: API routes protected against abuse

### Known Limitations

- **Testnet Only**: Currently deployed on Arbitrum Sepolia testnet
- **Single Collateral**: Only USDC supported (multi-collateral planned)
- **Oracle Dependency**: Relies on Pyth Network availability

---

## Roadmap

### Phase 1: Testnet (Current)
- [x] Core contract deployment
- [x] Basic trading functionality
- [x] Frontend trading interface
- [x] CoinGecko price integration
- [ ] Comprehensive testing

### Phase 2: Testnet Improvements
- [ ] Multi-collateral support (USDT, WETH, WBTC)
- [ ] Limit orders
- [ ] Stop-loss orders
- [ ] Advanced charting
- [ ] Mobile optimization

### Phase 3: Mainnet Preparation
- [ ] Security audit
- [ ] Gas optimization
- [ ] Performance testing
- [ ] Documentation completion

### Phase 4: Mainnet Launch
- [ ] Arbitrum One deployment
- [ ] Liquidity bootstrapping
- [ ] Marketing campaign
- [ ] Community building

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **Rust**: Follow Rust formatting guidelines (`cargo fmt`)
- **TypeScript**: ESLint + Prettier configuration included
- **Commits**: Use conventional commit messages

---

## Resources

### Documentation
- [Arbitrum Stylus Docs](https://docs.arbitrum.io/stylus/stylus-gentle-introduction)
- [Pyth Network Docs](https://docs.pyth.network/)
- [wagmi Documentation](https://wagmi.sh/)
- [Next.js Documentation](https://nextjs.org/docs)

### Tools
- [Arbiscan Sepolia](https://sepolia.arbiscan.io) - Block explorer
- [Alchemy Faucet](https://www.alchemy.com/faucets/arbitrum-sepolia) - Test ETH
- [Circle Faucet](https://faucet.circle.com/) - Test USDC
- [Reown Cloud](https://cloud.reown.com) - Wallet connection

### Community
- GitHub Issues - Bug reports and feature requests

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with Rust, React, and Arbitrum Stylus**

[Website](#) · [Documentation](#) · [Twitter](#) · [Discord](#)

</div>
