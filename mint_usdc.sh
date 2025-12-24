#!/bin/bash

# Mint USDC to wallet address
# Usage: ./mint_usdc.sh <wallet_address> [amount]

WALLET_ADDRESS=${1:-"0x21EB932bC4A296bd358be6E352894bad7b429a4C"}
AMOUNT=${2:-"10000"}  # Default 10,000 USDC

# MockUSDC contract address
MOCK_USDC="0x213b6548828e25889E6fDD1D4CFb3e328FCF7C40"

# RPC URL
RPC_URL="https://testnet-rpc.monad.xyz"

# USDC has 6 decimals, so 10000 USDC = 10000 * 10^6 = 10000000000
AMOUNT_WEI=$(echo "$AMOUNT * 1000000" | bc)

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           Mint USDC to Wallet                               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Wallet: $WALLET_ADDRESS"
echo "Amount: $AMOUNT USDC"
echo "Contract: $MOCK_USDC"
echo ""

# Check if .env exists and has PRIVATE_KEY
if [ -f .env ]; then
    source .env
    if [ -z "$PRIVATE_KEY" ]; then
        echo "❌ PRIVATE_KEY not found in .env"
        echo ""
        echo "Please run this command manually:"
        echo "cast send $MOCK_USDC \\"
        echo "  \"mint(address,uint256)\" \\"
        echo "  $WALLET_ADDRESS $AMOUNT_WEI \\"
        echo "  --rpc-url $RPC_URL \\"
        echo "  --private-key YOUR_PRIVATE_KEY"
        exit 1
    fi
else
    echo "❌ .env file not found"
    echo ""
    echo "Please run this command manually:"
    echo "cast send $MOCK_USDC \\"
    echo "  \"mint(address,uint256)\" \\"
    echo "  $WALLET_ADDRESS $AMOUNT_WEI \\"
    echo "  --rpc-url $RPC_URL \\"
    echo "  --private-key YOUR_PRIVATE_KEY"
    exit 1
fi

echo "Minting $AMOUNT USDC to $WALLET_ADDRESS..."
echo ""

cast send $MOCK_USDC \
  "mint(address,uint256)" \
  $WALLET_ADDRESS $AMOUNT_WEI \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --legacy

echo ""
echo "✅ Mint complete!"
echo ""
echo "Check balance:"
echo "cast call $MOCK_USDC \"balanceOf(address)\" $WALLET_ADDRESS --rpc-url $RPC_URL"

