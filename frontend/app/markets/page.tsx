'use client'

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatTimeRemaining, formatNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useMarketData } from "@/hooks/useMarketData";
import { useCoinGeckoPrice } from "@/hooks/useCoinGecko";
import { config } from "@/lib/config";

// Generate all market combinations with expiry options
const marketConfigs = [
  // BTC/USD markets
  { name: "BTC/USD", address: config.contracts.markets.btc.micro, duration: "24 Hours", expiry: "micro" },
  { name: "BTC/USD", address: config.contracts.markets.btc.daily, duration: "7 Days", expiry: "daily" },
  { name: "BTC/USD", address: config.contracts.markets.btc.macro, duration: "30 Days", expiry: "macro" },
  // ETH/USD markets
  { name: "ETH/USD", address: config.contracts.markets.eth.micro, duration: "24 Hours", expiry: "micro" },
  { name: "ETH/USD", address: config.contracts.markets.eth.daily, duration: "7 Days", expiry: "daily" },
  { name: "ETH/USD", address: config.contracts.markets.eth.macro, duration: "30 Days", expiry: "macro" },
  // ARB/USD markets
  { name: "ARB/USD", address: config.contracts.markets.arb.micro, duration: "24 Hours", expiry: "micro" },
  { name: "ARB/USD", address: config.contracts.markets.arb.daily, duration: "7 Days", expiry: "daily" },
  { name: "ARB/USD", address: config.contracts.markets.arb.macro, duration: "30 Days", expiry: "macro" },
];

function MarketCard({ marketConfig }: { marketConfig: typeof marketConfigs[0] }) {
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

  const price = coinGeckoPrice > 0 ? coinGeckoPrice : (currentPrice ? Number(currentPrice) / 1e18 : 0);
  const longOI = totalLongOI ? Number(totalLongOI) / 1e18 : 0;
  const shortOI = totalShortOI ? Number(totalShortOI) / 1e18 : 0;
  const expiry = expiryTimestamp ? Number(expiryTimestamp) : 0;

  const totalOI = longOI + shortOI;
  const longPercentage = totalOI > 0 ? (longOI / totalOI) * 100 : 50;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-center">
          {/* Market Name */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle>{marketConfig.name}</CardTitle>
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded font-medium">
                {marketConfig.duration}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {expiry > 0 && (
                <span>Expires in {formatTimeRemaining(expiry)}</span>
              )}
            </div>
          </div>

          {/* Price & Change */}
          <div>
            <div className="text-2xl font-bold font-mono">
              {price > 0 ? `$${formatNumber(price, 2)}` : '--'}
            </div>
            <div className="flex items-center gap-1 text-sm">
              {change >= 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-success">+{formatNumber(change, 2)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-error" />
                  <span className="text-error">{formatNumber(change, 2)}%</span>
                </>
              )}
            </div>
          </div>

          {/* Total OI */}
          <div>
            <div className="text-sm text-muted-foreground mb-1">Total OI</div>
            <div className="font-medium font-mono">
              ${formatNumber(totalOI / 1000, 0)}K
            </div>
          </div>

          {/* Open Interest */}
          <div>
            <div className="text-sm text-muted-foreground mb-2">Open Interest</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-success">Long {formatNumber(longPercentage, 1)}%</span>
                <span className="text-error">Short {formatNumber(100 - longPercentage, 1)}%</span>
              </div>
              <div className="h-2 bg-error rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success" 
                  style={{ width: `${longPercentage}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Total: ${formatNumber(totalOI / 1000, 0)}K
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex justify-end">
            <Link href={`/trade?market=${marketConfig.name}`}>
              <Button>Trade</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MarketsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Markets</h1>
          <p className="text-muted-foreground">
            Trade outcome-based perpetuals with forced expiry
          </p>
        </div>

        <div className="grid gap-4">
          {marketConfigs.map((marketConfig) => (
            <MarketCard key={marketConfig.address} marketConfig={marketConfig} />
          ))}
        </div>
      </div>
    </div>
  );
}
