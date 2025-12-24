# ⚡ Quick Start - 5 Minutes to Live

Get the frontend running in 5 minutes.

## Step 1: Install (1 min)

```bash
cd frontend
npm install
```

## Step 2: Configure (2 min)

### Get Reown Project ID

1. Go to [cloud.reown.com](https://cloud.reown.com)
2. Sign up/login
3. Create new project
4. Copy Project ID

### Create Environment File

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_REOWN_PROJECT_ID=paste_your_project_id_here
```

## Step 3: Run (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 4: Connect Wallet (1 min)

1. Click "Connect Wallet" button
2. Select MetaMask
3. Add Monad Testnet if prompted:
   - **Network Name:** Monad Testnet
   - **RPC URL:** https://testnet-rpc.monad.xyz
   - **Chain ID:** 10159
   - **Symbol:** MON
   - **Explorer:** https://explorer.testnet.monad.xyz

## Step 5: Get Test Tokens & Trade (Optional)

1. Go to Portfolio page
2. Click "Claim Test USDC" (10,000 USDC)
3. Go to Trade page
4. Deposit collateral
5. Open your first position!

---

## 🎨 What You'll See

### Landing Page
- Clean hero section with "Trade the Outcome"
- Feature cards explaining the protocol
- Stats showing 3 markets, 40x leverage, $100K treasury

### Trading Dashboard
- Market selector (BTC/ETH/MON)
- Price chart with candlesticks
- Order book with bids/asks
- Trading panel (Buy/Long, Sell/Short)
- Positions table

### Markets Page
- All 3 markets with stats
- Price, volume, open interest
- Time to expiry countdown

### Portfolio Page
- Balance overview
- Deposit/withdraw forms
- Testnet faucet

---

## 🎯 Design Highlights

✅ **Matt black background** (#000000)  
✅ **White text** for high contrast  
✅ **Gray accents** for secondary elements  
✅ **Green for longs/profits** (#10b981)  
✅ **Red for shorts/losses** (#ef4444)  
✅ **Professional trading UI** inspired by your reference image  
✅ **Fully responsive** for mobile, tablet, desktop  

---

## 🔥 Hot Tips

**Mock Data:**
- Charts use generated candlestick data
- Order book shows simulated bids/asks
- Positions show example data

**Real Integration:**
- Wallet connection is live (Reown Kit)
- Contract ABIs are ready
- Hooks are prepared for contract calls

**Next Steps:**
1. Connect real price feeds
2. Query positions from PositionManager
3. Add transaction notifications
4. Deploy to Vercel

---

## 🚀 Deploy to Production

```bash
# Build
npm run build

# Deploy to Vercel
vercel

# Or deploy to any hosting
npm start
```

---

## 📞 Need Help?

- Check `README.md` for full documentation
- Check `FRONTEND_SETUP.md` for detailed guide
- All contract addresses in `lib/config.ts`
- All ABIs in `lib/abis/`

---

**You're all set! Happy trading! 🎉**
