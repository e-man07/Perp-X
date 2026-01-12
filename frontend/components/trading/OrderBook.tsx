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
  for (let i = 0; i < 6; i++) {
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
  for (let i = 0; i < 6; i++) {
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
  const maxTotal = Math.max(
    ...asks.map(a => a.total),
    ...bids.map(b => b.total)
  );

  if (currentPrice <= 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Order Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500 text-sm">
            <div className="h-6 w-6 mx-auto mb-2 rounded-full border-2 border-gray-700 border-t-gray-500 animate-spin" />
            Loading price data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Order Book</CardTitle>
          <div className="flex gap-1">
            {['0.01', '0.1', '1'].map((precision, i) => (
              <button
                key={precision}
                className={`px-2 py-1 rounded text-2xs font-mono transition-colors ${
                  i === 1 ? 'bg-white text-black' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                }`}
              >
                {precision}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Header */}
        <div className="grid grid-cols-3 gap-2 text-2xs text-gray-500 mb-2 font-medium uppercase tracking-wider">
          <div className="text-left">Price</div>
          <div className="text-right">Size</div>
          <div className="text-right">Total</div>
        </div>

        {/* Asks (Sell Orders) */}
        <div className="space-y-0.5 mb-2">
          {asks.map((ask, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 text-xs relative group hover:bg-white/5 py-1 rounded transition-colors">
              <div
                className="absolute inset-y-0 right-0 bg-error/10 rounded-r transition-all"
                style={{ width: `${Math.min((ask.total / maxTotal) * 100, 100)}%` }}
              />
              <div className="text-error font-mono relative z-10">{formatNumber(ask.price, 2)}</div>
              <div className="text-right font-mono text-gray-400 relative z-10">{formatNumber(ask.amount, 4)}</div>
              <div className="text-right font-mono text-gray-500 relative z-10">{formatNumber(ask.total, 4)}</div>
            </div>
          ))}
        </div>

        {/* Spread / Current Price */}
        <div className="py-3 px-3 bg-gray-900 rounded-lg mb-2 text-center border border-gray-800">
          <div className="text-xl font-mono font-bold">${formatNumber(midPrice, 2)}</div>
          <div className="text-2xs text-gray-500 mt-1">
            Spread: <span className="font-mono">${formatNumber(spread, 2)}</span>
            <span className="text-gray-600 ml-1">({formatNumber(spreadPercent, 3)}%)</span>
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="space-y-0.5">
          {bids.map((bid, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 text-xs relative group hover:bg-white/5 py-1 rounded transition-colors">
              <div
                className="absolute inset-y-0 right-0 bg-success/10 rounded-r transition-all"
                style={{ width: `${Math.min((bid.total / maxTotal) * 100, 100)}%` }}
              />
              <div className="text-success font-mono relative z-10">{formatNumber(bid.price, 2)}</div>
              <div className="text-right font-mono text-gray-400 relative z-10">{formatNumber(bid.amount, 4)}</div>
              <div className="text-right font-mono text-gray-500 relative z-10">{formatNumber(bid.total, 4)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
