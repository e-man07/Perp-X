# Perp-X

> **Leveraged Prediction Markets with Forced Expiry on Arbitrum**

**Status:** Live on Arbitrum Sepolia Testnet

---

## What is Perp-X?

Perp-X is a novel perpetual futures primitive that combines the simplicity of prediction markets with leveraged trading:

- **Forced Expiry**: Markets expire after 24h, 7d, or 30d - no zombie positions
- **No Funding Rates**: Simplified mechanics without complex funding calculations
- **Outcome Settlement**: Automatic PnL settlement at expiry
- **Up to 40x Leverage**: Dynamic margin requirements based on leverage
- **Real-time Prices**: CoinGecko integration for live price feeds

---

## Live Demo

**Network**: Arbitrum Sepolia (Chain ID: 421614)

### Deployed Markets

| Market | Address | Expiry |
|--------|---------|--------|
| BTC/USD | `0xbd1b96f0bcffee4dfdcc683fbec612cddb5d24d8` | 24h |
| ETH/USD | `0x3e741a1d222dc8a392a7caf4d12a8a8b6fb69800` | 24h |
| ARB/USD | `0x95d352b33d82985200c4b5eb83d7a78744f86e85` | 24h |

### Core Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| CollateralVault | `0x456628c1ac3da5b0a1b15f28762a643a38ae5745` | USDC collateral management |
| PositionManager | `0xcb3e422143d1c5603c86b0ccd419156bf5d8b045` | Position tracking & PnL |
| PriceAdapter | `0xcadfc95764e2480d3a44f3a74fb5bd225582e012` | Pyth oracle integration |
| LiquidationEngine | `0x2361425d154e66aca0272b718571836203601983` | Risk management |
| InsuranceFund | `0xb10706d5d65bba12092ff359005c216ee863a344` | Safety backstop |
| OrderBook | `0x0fcd5872c3730ac931d6ef52256b35e1079d40e6` | Order management |
| CrossMargin | `0xce63953845b7b9732ed5fd0f0b519881f7904f66` | Cross-margin accounts |

**Collateral**: Circle USDC (`0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`)

---

## Architecture

### Smart Contracts (Stylus/Rust)

Built with [Arbitrum Stylus](https://docs.arbitrum.io/stylus/stylus-gentle-introduction) - Rust-based WASM smart contracts for better performance and safety.

```
stylus/src/
├── outcome_market.rs      # Main trading market logic
├── position_manager.rs    # Position tracking & health
├── collateral_vault.rs    # Multi-asset collateral
├── liquidation_engine.rs  # Margin-based liquidations
├── price_adapter.rs       # Pyth oracle integration
├── insurance_fund.rs      # Protocol safety net
├── order_book.rs          # Order management
└── cross_margin.rs        # Cross-margin accounts
```

### Frontend (Next.js 16)

Modern React frontend with real-time trading capabilities.

```
frontend/
├── app/                   # Next.js App Router pages
│   ├── trade/            # Trading terminal
│   ├── markets/          # Market overview
│   └── portfolio/        # Portfolio management
├── components/
│   ├── trading/          # Trading UI components
│   ├── layout/           # Header, navigation
│   └── ui/               # Reusable UI components
├── hooks/                # React hooks for Web3
└── lib/                  # Configuration & utilities
```

---

## Key Features

### Trading
- **Long/Short Positions**: Predict price direction with leverage
- **Real-time PnL**: Live profit/loss calculations using CoinGecko prices
- **Position Management**: View, track, and close positions
- **Liquidation Protection**: Dynamic margin requirements

### User Experience
- **Wallet Connect**: Reown AppKit integration
- **Network Guard**: Automatic network switching
- **Responsive Design**: Mobile-friendly trading interface
- **Transaction Tracking**: Real-time transaction status

### Oracle Integration
- **Pyth Network**: On-chain price feeds
- **CoinGecko API**: Real-time price display
- **Price Caching**: Optimized for gas efficiency

---

## Getting Started

### Prerequisites
- Node.js 18+
- A wallet with Arbitrum Sepolia ETH
- Circle USDC (get from [Circle Faucet](https://faucet.circle.com/))

### Run Locally

```bash
# Clone the repository
git clone https://github.com/your-repo/perp-x.git
cd perp-x

# Install frontend dependencies
cd frontend
npm install

# Set up environment
cp .env.example .env.local
# Add your NEXT_PUBLIC_REOWN_PROJECT_ID

# Run development server
npm run dev
```

### Build for Production

```bash
cd frontend
npm run build
```

---

## How It Works

### 1. Deposit Collateral
Connect your wallet and deposit USDC to the vault. Your funds remain in your control.

### 2. Open Position
- Select a market (BTC, ETH, or ARB)
- Choose direction (Long or Short)
- Set collateral amount and leverage (1x-40x)
- Confirm transaction

### 3. Monitor & Close
- Track real-time PnL
- Close anytime before expiry
- Or wait for automatic settlement at expiry

### Position Mechanics

```
Position Size = Collateral × Leverage
Entry Price = Current market price at open

For LONG positions:
  PnL = Position Size × (Current Price - Entry Price) / Entry Price

For SHORT positions:
  PnL = Position Size × (Entry Price - Current Price) / Entry Price

Liquidation Price (LONG) = Entry Price × (1 - 1/Leverage)
Liquidation Price (SHORT) = Entry Price × (1 + 1/Leverage)
```

---

## What Makes This Different

| Aspect | Traditional Perps | Perp-X |
|--------|------------------|--------|
| Duration | Infinite | Fixed (24h-30d) |
| Settlement | Manual | Automatic at expiry |
| Funding Rates | Every 8h | None |
| Closing | Manual or liquidation | Forced at expiry |
| Complexity | High | Simple |
| UX | Confusing | Long/Short → Wait → Settle |

---

## Tech Stack

- **Smart Contracts**: Arbitrum Stylus (Rust/WASM)
- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Web3**: wagmi, viem, Reown AppKit
- **Oracles**: Pyth Network, CoinGecko API
- **Network**: Arbitrum Sepolia (Testnet)

---

## Project Structure

```
perp-x/
├── frontend/              # Next.js frontend application
│   ├── app/              # App Router pages
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities & config
├── stylus/               # Stylus smart contracts (Rust)
│   ├── src/              # Contract source code
│   └── deployments/      # Deployment artifacts
└── README.md             # This file
```

---

## Resources

- **Block Explorer**: [Arbiscan Sepolia](https://sepolia.arbiscan.io)
- **Get Test ETH**: [Arbitrum Sepolia Faucet](https://www.alchemy.com/faucets/arbitrum-sepolia)
- **Get Test USDC**: [Circle Faucet](https://faucet.circle.com/)
- **Pyth Network**: [docs.pyth.network](https://docs.pyth.network/)
- **Arbitrum Stylus**: [docs.arbitrum.io/stylus](https://docs.arbitrum.io/stylus/stylus-gentle-introduction)

---

## License

MIT License - see LICENSE file for details.

---

**Built for the Arbitrum ecosystem**
