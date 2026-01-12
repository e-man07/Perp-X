'use client'

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { MarketSelector, type MarketInfo } from "@/components/trading/MarketSelector";
import { PriceChart } from "@/components/trading/PriceChart";
import { OrderBook } from "@/components/trading/OrderBook";
import { TradingPanel } from "@/components/trading/TradingPanel";
import { PositionsPanel } from "@/components/trading/PositionsPanel";
import { useCoinGeckoPrice } from "@/hooks/useCoinGecko";
import { config } from "@/lib/config";

export default function TradePage() {
  const [selectedMarket, setSelectedMarket] = useState<MarketInfo>({
    name: "BTC/USD",
    address: config.contracts.markets.btc.micro,
    expiry: 'micro',
    expiryLabel: '24h',
    expiryHours: 24,
  });

  // Get real-time price from CoinGecko for OrderBook
  const { price: currentPrice } = useCoinGeckoPrice(selectedMarket.name);

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Market Selector */}
        <div className="animate-slide-down">
          <MarketSelector
            selectedMarket={selectedMarket}
            onSelectMarket={setSelectedMarket}
          />
        </div>

        {/* Main Trading Grid */}
        <div className="grid grid-cols-12 gap-4 mt-6">
          {/* Left Column - Chart & Positions */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {/* Price Chart */}
            <div className="animate-fade-in delay-100">
              <PriceChart market={selectedMarket.name} />
            </div>

            {/* Positions Panel */}
            <div className="animate-fade-in delay-200">
              <PositionsPanel />
            </div>
          </div>

          {/* Right Column - Order Book & Trading */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* Order Book */}
            <div className="animate-fade-in delay-100">
              <OrderBook market={selectedMarket.name} currentPrice={currentPrice} />
            </div>

            {/* Trading Panel */}
            <div className="animate-fade-in delay-200">
              <TradingPanel market={selectedMarket.address} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
