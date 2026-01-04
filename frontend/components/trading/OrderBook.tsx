'use client'

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatNumber } from '@/lib/utils';

interface OrderBookProps {
  market: string;
  currentPrice: number;
}

// Generate realistic order book data based on current price
function generateOrderBook(basePrice: number) {
  if (basePrice <= 0) {
    return { asks: [], bids: [], spread: 0, spreadPercent: 0 };
  }

  // Calculate spread based on price magnitude (larger prices = larger spreads)
  const spreadBps = 5; // 0.05% spread
  const halfSpread = basePrice * (spreadBps / 10000);

  // Generate asks (sell orders) - above current price
  const asks = [];
  let askTotal = 0;
  for (let i = 0; i < 5; i++) {
    const priceOffset = halfSpread + (basePrice * 0.0001 * (i + 1) * Math.random());
    const price = basePrice + priceOffset;
    const amount = 0.5 + Math.random() * 10;
    askTotal += amount;
    asks.push({
      price,
      amount,
      total: askTotal,
    });
  }

  // Generate bids (buy orders) - below current price
  const bids = [];
  let bidTotal = 0;
  for (let i = 0; i < 5; i++) {
    const priceOffset = halfSpread + (basePrice * 0.0001 * (i + 1) * Math.random());
    const price = basePrice - priceOffset;
    const amount = 0.5 + Math.random() * 10;
    bidTotal += amount;
    bids.push({
      price,
      amount,
      total: bidTotal,
    });
  }

  // Sort asks ascending (lowest first at bottom, nearest to spread)
  asks.sort((a, b) => a.price - b.price);
  // Sort bids descending (highest first at top, nearest to spread)
  bids.sort((a, b) => b.price - a.price);

  const spread = asks[0]?.price - bids[0]?.price || 0;
  const spreadPercent = bids[0]?.price ? (spread / bids[0].price) * 100 : 0;

  return { asks: asks.reverse(), bids, spread, spreadPercent };
}

export function OrderBook({ market, currentPrice }: OrderBookProps) {
  // Generate order book based on real price
  const { asks, bids, spread, spreadPercent } = useMemo(() => {
    return generateOrderBook(currentPrice);
  }, [currentPrice]);

  const midPrice = currentPrice > 0 ? currentPrice : (bids[0]?.price || 0);

  if (currentPrice <= 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Order Book</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm">
            Loading price data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Order Book</CardTitle>
          <div className="flex gap-2 text-xs">
            <button className="px-2 py-1 rounded bg-secondary hover:bg-muted transition-colors">
              0.01
            </button>
            <button className="px-2 py-1 rounded bg-white text-black">
              0.1
            </button>
            <button className="px-2 py-1 rounded bg-secondary hover:bg-muted transition-colors">
              1
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Header */}
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-2 font-medium">
          <div className="text-left">Price</div>
          <div className="text-right">Size</div>
          <div className="text-right">Total</div>
        </div>

        {/* Asks (Sell Orders) */}
        <div className="space-y-0.5 mb-3">
          {asks.map((ask, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 text-xs relative group hover:bg-muted/50 py-0.5 rounded">
              <div className="absolute inset-y-0 right-0 bg-error/10" style={{ width: `${Math.min((ask.total / 50) * 100, 100)}%` }} />
              <div className="text-error font-mono relative z-10">{formatNumber(ask.price, 2)}</div>
              <div className="text-right font-mono text-muted-foreground relative z-10">{formatNumber(ask.amount, 4)}</div>
              <div className="text-right font-mono text-muted-foreground relative z-10">{formatNumber(ask.total, 4)}</div>
            </div>
          ))}
        </div>

        {/* Spread / Current Price */}
        <div className="py-2 px-2 bg-secondary rounded mb-3 text-center">
          <div className="text-lg font-mono font-bold">${formatNumber(midPrice, 2)}</div>
          <div className="text-xs text-muted-foreground">
            Spread: ${formatNumber(spread, 2)} ({formatNumber(spreadPercent, 3)}%)
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="space-y-0.5">
          {bids.map((bid, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 text-xs relative group hover:bg-muted/50 py-0.5 rounded">
              <div className="absolute inset-y-0 right-0 bg-success/10" style={{ width: `${Math.min((bid.total / 50) * 100, 100)}%` }} />
              <div className="text-success font-mono relative z-10">{formatNumber(bid.price, 2)}</div>
              <div className="text-right font-mono text-muted-foreground relative z-10">{formatNumber(bid.amount, 4)}</div>
              <div className="text-right font-mono text-muted-foreground relative z-10">{formatNumber(bid.total, 4)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
