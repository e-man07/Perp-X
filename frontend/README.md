# Perp-X - Frontend

Professional trading interface for leveraged prediction markets on Monad.

## 🎨 Design

- **Matt black theme** with white and gray accents
- Inspired by professional trading platforms
- Clean, minimal UI with Vercel branding aesthetic
- Fully responsive design

## 🚀 Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Reown Kit (AppKit)** - Wallet connection
- **Wagmi** - Ethereum interactions
- **Viem** - Ethereum utilities
- **TradingView Lightweight Charts** - Price charts
- **Lucide React** - Icons

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment template (create manually)
# Create .env.local file with:
# NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here
```

## 🔧 Configuration

### 1. Get Reown Project ID

Visit [cloud.reown.com](https://cloud.reown.com) and create a new project to get your Project ID.

### 2. Update Configuration

Edit `lib/config.ts` if needed to change:
- Contract addresses
- Network configuration
- RPC URLs

### 3. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here
```

## 🏃 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── trade/page.tsx     # Trading dashboard
│   ├── markets/page.tsx   # Markets overview
│   └── portfolio/page.tsx # Portfolio management
├── components/
│   ├── layout/            # Layout components (Header)
│   ├── trading/           # Trading components
│   │   ├── MarketSelector.tsx
│   │   ├── PriceChart.tsx
│   │   ├── OrderBook.tsx
│   │   ├── TradingPanel.tsx
│   │   └── PositionsPanel.tsx
│   ├── ui/                # Reusable UI components
│   └── providers/         # Web3 providers
├── hooks/                 # Custom React hooks
│   ├── useMarketData.ts   # Market data hooks
│   ├── useVault.ts        # Vault operations
│   └── useTrading.ts      # Trading operations
├── lib/
│   ├── config.ts          # App configuration
│   ├── web3.ts            # Web3 setup
│   ├── utils.ts           # Utility functions
│   └── abis/              # Contract ABIs
└── tailwind.config.ts     # Tailwind configuration
```

## 🎯 Features

### Landing Page
- Hero section with clear value proposition
- Feature cards explaining the protocol
- Live stats (markets, leverage, treasury)
- CTA buttons to trading and markets

### Trading Dashboard
- **Market Selector** - Switch between BTC/ETH/MON markets
- **Price Chart** - TradingView candlestick charts with real-time data
- **Order Book** - Live bids/asks with depth visualization
- **Trading Panel** - Buy/Long and Sell/Short with leverage slider
- **Positions Table** - Open positions with PnL tracking

### Markets Page
- Overview of all active markets
- Price, volume, and OI stats
- Time to expiry countdown
- Long/Short OI distribution visualization

### Portfolio Page
- Wallet and vault balance overview
- Deposit and withdraw collateral
- Total PnL tracking
- Testnet faucet integration

## 🔗 Contract Integration

The app integrates with:
- **OutcomeMarket** - Trading operations
- **CollateralVault** - Collateral management
- **ERC20 (USDC)** - Token operations

### Key Hooks

```typescript
// Market data
const { price } = useMarketPrice(marketAddress);
const { assetPair, currentPrice, totalLongOI } = useMarketData(marketAddress);

// Vault operations
const { availableCollateral, totalCollateral } = useVaultBalance();
const { approve } = useApproveToken();
const { deposit } = useDepositCollateral();

// Trading
const { openPosition } = useOpenPosition();
const { closePosition } = useClosePosition();
```

## 🎨 Theme Configuration

Custom dark theme in `tailwind.config.ts`:

```typescript
colors: {
  background: "#000000",    // Pure black
  foreground: "#ffffff",    // White text
  primary: "#ffffff",       // Primary actions
  secondary: "#1a1a1a",     // Secondary bg
  muted: "#262626",         // Muted elements
  border: "#262626",        // Borders
  success: "#10b981",       // Green for longs/profits
  error: "#ef4444",         // Red for shorts/losses
}
```

## 🔌 Wallet Connection

Using Reown Kit (formerly WalletConnect AppKit):

```typescript
// Automatically injected in Header component
<appkit-button />

// Access wallet state
const { address, isConnected } = useAccount();
```

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: `sm`, `md`, `lg`, `xl`
- Collapsible navigation on mobile
- Optimized trading interface for tablets

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Other Platforms

```bash
# Build
npm run build

# Output in .next directory
# Serve with any Node.js hosting
```

## 🧪 Testing Locally

1. Connect to Monad Testnet
2. Get test USDC from faucet (Portfolio page)
3. Approve and deposit collateral
4. Open a position on any market
5. Close position to realize PnL

## 📝 Notes

- Mock data is used for charts and order book (replace with real API)
- Position management needs PositionManager contract integration
- Add error handling and loading states for production
- Implement real-time price feeds via WebSocket

## 🛠️ Next Steps

1. Connect real price feeds (Pyth or custom API)
2. Implement position queries from PositionManager
3. Add transaction notifications
4. Add slippage protection
5. Implement advanced charting features
6. Add dark/light mode toggle (currently dark only)

## 📄 License

MIT
