#!/bin/bash

# Perp-X - Monad Testnet Deployment Script
# Usage: ./deploy.sh

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Perp-X - Monad Testnet Deployment                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "   Copy .env.example to .env and set your values:"
    echo "   cp .env.example .env"
    exit 1
fi

# Load environment
source .env

# Validate required variables
if [ -z "$RPC_URL" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Missing required environment variables!"
    echo "   Please set RPC_URL and PRIVATE_KEY in .env"
    exit 1
fi

echo "🔧 Configuration:"
echo "   RPC_URL: $RPC_URL"
echo "   Deployer: $(cast wallet address --private-key $PRIVATE_KEY)"
echo "   Network: Monad Testnet (Chain ID: 10143)"
echo ""

# Step 1: Check balance
echo "📊 Checking account balance..."
BALANCE=$(cast balance $(cast wallet address --private-key $PRIVATE_KEY) --rpc-url $RPC_URL)
BALANCE_MON=$(echo "scale=4; $BALANCE / 1e18" | bc)
echo "   Balance: $BALANCE_MON MON"

if (( $(echo "$BALANCE_MON < 0.1" | bc -l) )); then
    echo "⚠️  Warning: Low balance (need at least 0.1 MON for gas)"
fi
echo ""

# Step 2: Build contracts
echo "🏗️  Building contracts..."
forge build --skip test 2>&1 | grep -E "Compiling|finished|Error" || true
echo "   ✅ Build complete"
echo ""

# Step 3: Deploy contracts
echo "🚀 Deploying core contracts..."
echo "   This may take a few minutes..."
echo ""

DEPLOY_OUTPUT=$(forge script script/Deploy.s.sol \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    2>&1)

echo "$DEPLOY_OUTPUT"

# Extract contract addresses from output
PRICE_ADAPTER=$(echo "$DEPLOY_OUTPUT" | grep "PythPriceAdapter deployed at:" | tail -1 | awk '{print $NF}')
FACTORY=$(echo "$DEPLOY_OUTPUT" | grep "OutcomePerpsFactory deployed at:" | tail -1 | awk '{print $NF}')

if [ -z "$PRICE_ADAPTER" ] || [ -z "$FACTORY" ]; then
    echo ""
    echo "❌ Deployment may have failed. Check output above."
    exit 1
fi

echo ""
echo "✅ Core contracts deployed!"
echo "   PythPriceAdapter: $PRICE_ADAPTER"
echo "   OutcomePerpsFactory: $FACTORY"
echo ""

# Step 4: Save deployment info
echo "💾 Saving deployment info..."
cat > deployments_$(date +%s).txt << EOF
=== OUTCOME-BASED LEVERAGE PERPS DEX DEPLOYMENT ===
Date: $(date)
Chain: Monad Testnet (10143)
Deployer: $(cast wallet address --private-key $PRIVATE_KEY)

CORE CONTRACTS:
PythPriceAdapter:    $PRICE_ADAPTER
OutcomePerpsFactory: $FACTORY

RPC_URL: $RPC_URL
EOF

echo "   ✅ Saved to deployments_*.txt"
echo ""

# Step 5: Verify deployment
echo "🔍 Verifying deployment..."
MARKET_COUNT=$(cast call $FACTORY "getMarketCount()" --rpc-url $RPC_URL)
echo "   Markets deployed: $MARKET_COUNT"
echo ""

# Step 6: Create markets
echo "📈 Creating initial markets..."
export FACTORY_ADDRESS=$FACTORY

MARKET_OUTPUT=$(forge script script/CreateMarkets.s.sol \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    2>&1)

echo "$MARKET_OUTPUT" | grep -E "created at|Markets created" || true
echo ""

# Final summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   ✅ DEPLOYMENT COMPLETE                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 Key Addresses:"
echo "   PythPriceAdapter:    $PRICE_ADAPTER"
echo "   OutcomePerpsFactory: $FACTORY"
echo ""
echo "📚 Next Steps:"
echo "   1. Register Pyth price feeds"
echo "   2. Test deposits and position opening"
echo "   3. Monitor liquidation events"
echo "   4. Verify contracts on block explorer"
echo ""
echo "📖 Documentation:"
echo "   - DEPLOYMENT.md - Detailed deployment guide"
echo "   - ARCHITECTURE.md - Technical architecture"
echo "   - README.md - Quick reference"
echo ""
echo "🔗 Monad Testnet Explorer:"
echo "   https://testnet.monad.xyz"
echo ""
