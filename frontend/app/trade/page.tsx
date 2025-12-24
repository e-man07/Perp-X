'use client'

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { MarketSelector, type MarketInfo } from "@/components/trading/MarketSelector";
import { PriceChart } from "@/components/trading/PriceChart";
import { OrderBook } from "@/components/trading/OrderBook";
import { TradingPanel } from "@/components/trading/TradingPanel";
import { PositionsPanel } from "@/components/trading/PositionsPanel";
import { config } from "@/lib/config";

export default function TradePage() {
  const [selectedMarket, setSelectedMarket] = useState<MarketInfo>({
    name: "BTC/USD",
    address: config.contracts.markets.btc.micro,
    expiry: 'micro',
    expiryLabel: '24h',
    expiryHours: 24,
  });

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Market Selector */}
        <MarketSelector 
          selectedMarket={selectedMarket} 
          onSelectMarket={setSelectedMarket} 
        />

        {/* Main Trading Grid */}
        <div className="grid grid-cols-12 gap-4 mt-6">
          {/* Left Column - Chart & Order Book */}
          <div className="col-span-12 lg:col-span-9 space-y-4">
            {/* Price Chart */}
            <PriceChart market={selectedMarket.name} />

            {/* Positions Panel */}
            <PositionsPanel />
          </div>

          {/* Right Column - Order Book & Trading */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            {/* Order Book */}
            <OrderBook market={selectedMarket.name} />

            {/* Trading Panel */}
            <TradingPanel market={selectedMarket.address} />
          </div>
        </div>
      </div>
    </div>
  );
}
