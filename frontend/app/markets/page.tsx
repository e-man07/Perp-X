'use client'

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatTimeRemaining, formatNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown, Clock, ArrowRight, Zap, Calendar, BarChart2 } from "lucide-react";
import { useMarketData } from "@/hooks/useMarketData";
import { useCoinGeckoPrice } from "@/hooks/useCoinGecko";
import { config } from "@/lib/config";

// Generate all market combinations with expiry options
const marketConfigs = [
  // BTC/USD markets
  { name: "BTC/USD", symbol: "BTC", address: config.contracts.markets.btc.micro, duration: "24h", expiry: "micro", icon: Zap },
  { name: "BTC/USD", symbol: "BTC", address: config.contracts.markets.btc.daily, duration: "7d", expiry: "daily", icon: Calendar },
  { name: "BTC/USD", symbol: "BTC", address: config.contracts.markets.btc.macro, duration: "30d", expiry: "macro", icon: BarChart2 },
  // ETH/USD markets
  { name: "ETH/USD", symbol: "ETH", address: config.contracts.markets.eth.micro, duration: "24h", expiry: "micro", icon: Zap },
  { name: "ETH/USD", symbol: "ETH", address: config.contracts.markets.eth.daily, duration: "7d", expiry: "daily", icon: Calendar },
  { name: "ETH/USD", symbol: "ETH", address: config.contracts.markets.eth.macro, duration: "30d", expiry: "macro", icon: BarChart2 },
  // ARB/USD markets
  { name: "ARB/USD", symbol: "ARB", address: config.contracts.markets.arb.micro, duration: "24h", expiry: "micro", icon: Zap },
  { name: "ARB/USD", symbol: "ARB", address: config.contracts.markets.arb.daily, duration: "7d", expiry: "daily", icon: Calendar },
  { name: "ARB/USD", symbol: "ARB", address: config.contracts.markets.arb.macro, duration: "30d", expiry: "macro", icon: BarChart2 },
];

function MarketCard({ marketConfig, index }: { marketConfig: typeof marketConfigs[0]; index: number }) {
  const {
    currentPrice,
    totalLongOI,
    totalShortOI,
    expiryTimestamp,
    assetPair,
    settled
  } = useMarketData(marketConfig.address);

  // Use CoinGecko for real-time price and 24h change
  const { price: coinGeckoPrice, change24hPercent } = useCoinGeckoPrice(marketConfig.name);

  // Use CoinGecko data for 24h change
  const change = change24hPercent || 0;
  const isPositive = change >= 0;

  const price = coinGeckoPrice > 0 ? coinGeckoPrice : (currentPrice ? Number(currentPrice) / 1e18 : 0);
  const longOI = totalLongOI ? Number(totalLongOI) / 1e18 : 0;
  const shortOI = totalShortOI ? Number(totalShortOI) / 1e18 : 0;
  const expiry = expiryTimestamp ? Number(expiryTimestamp) : 0;

  const totalOI = longOI + shortOI;
  const longPercentage = totalOI > 0 ? (longOI / totalOI) * 100 : 50;

  const Icon = marketConfig.icon;

  return (
    <Card
      variant="gradient"
      hoverable
      className="market-card animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 lg:gap-6 items-center p-5">
          {/* Market Name */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg">
                {marketConfig.symbol.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg">{marketConfig.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-white/10 text-gray-300 rounded-md font-medium flex items-center gap-1">
                    <Icon className="h-3 w-3" />
                    {marketConfig.duration}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {expiry > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Expires in {formatTimeRemaining(expiry)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Price & Change */}
          <div>
            <div className="text-2xs text-gray-500 uppercase tracking-wider mb-1">Price</div>
            <div className="text-xl font-bold font-mono">
              {price > 0 ? `$${formatNumber(price, 2)}` : '--'}
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-success' : 'text-error'}`}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{isPositive ? '+' : ''}{formatNumber(change, 2)}%</span>
            </div>
          </div>

          {/* Total OI */}
          <div>
            <div className="text-2xs text-gray-500 uppercase tracking-wider mb-1">Total OI</div>
            <div className="text-lg font-bold font-mono">
              ${formatNumber(totalOI / 1000, 1)}K
            </div>
            <div className="text-xs text-gray-500">Open Interest</div>
          </div>

          {/* Market Sentiment */}
          <div>
            <div className="text-2xs text-gray-500 uppercase tracking-wider mb-2">Sentiment</div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-success font-medium">{formatNumber(longPercentage, 0)}% Long</span>
                <span className="text-error font-medium">{formatNumber(100 - longPercentage, 0)}% Short</span>
              </div>
              <div className="h-2 bg-error/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all duration-500"
                  style={{ width: `${longPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex lg:justify-end">
            <Link href={`/trade`} className="w-full lg:w-auto">
              <Button size="lg" className="group w-full lg:w-auto">
                Trade
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MarketsPage() {
  // Group markets by asset
  const groupedMarkets = marketConfigs.reduce((acc, market) => {
    if (!acc[market.symbol]) {
      acc[market.symbol] = [];
    }
    acc[market.symbol].push(market);
    return acc;
  }, {} as Record<string, typeof marketConfigs>);

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-slide-down">
          <h1 className="text-4xl font-bold mb-2">Markets</h1>
          <p className="text-gray-500">
            Trade outcome-based perpetuals with forced expiry
          </p>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card variant="glass" className="animate-fade-in">
            <CardContent className="p-5 text-center">
              <div className="stat-value text-white">{marketConfigs.length}</div>
              <div className="stat-label mt-2">Active Markets</div>
            </CardContent>
          </Card>
          <Card variant="glass" className="animate-fade-in delay-100">
            <CardContent className="p-5 text-center">
              <div className="stat-value text-white">40x</div>
              <div className="stat-label mt-2">Max Leverage</div>
            </CardContent>
          </Card>
          <Card variant="glass" className="animate-fade-in delay-200">
            <CardContent className="p-5 text-center">
              <div className="stat-value text-white">3</div>
              <div className="stat-label mt-2">Assets</div>
            </CardContent>
          </Card>
        </div>

        {/* Markets by Asset */}
        {Object.entries(groupedMarkets).map(([symbol, markets], groupIndex) => (
          <div key={symbol} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center font-bold">
                {symbol.charAt(0)}
              </div>
              <h2 className="text-xl font-semibold">{symbol}/USD Markets</h2>
            </div>
            <div className="space-y-3">
              {markets.map((marketConfig, index) => (
                <MarketCard
                  key={marketConfig.address}
                  marketConfig={marketConfig}
                  index={groupIndex * 3 + index}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
