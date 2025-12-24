'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatNumber } from '@/lib/utils';

interface OrderBookProps {
  market: string;
}

export function OrderBook({ market }: OrderBookProps) {
  // Mock order book data
  const asks = [
    { price: 88522.96, amount: 1.0669, total: 22.5767 },
    { price: 88505.31, amount: 4.0397, total: 21.5098 },
    { price: 88496.26, amount: 9.7868, total: 17.4701 },
    { price: 88475.92, amount: 1.2265, total: 7.6833 },
    { price: 88467.29, amount: 2.9932, total: 6.4568 },
  ].reverse();

  const bids = [
    { price: 88422.96, amount: 1.0669, total: 21.4878 },
    { price: 88375.18, amount: 10.4921, total: 89.6946 },
    { price: 88344.70, amount: 1.0463, total: 62.9698 },
    { price: 88275.92, amount: 2.5265, total: 56.4968 },
    { price: 88167.29, amount: 6.7856, total: 95.7986 },
  ];

  const spread = asks[0].price - bids[0].price;
  const spreadPercent = (spread / bids[0].price) * 100;

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
              <div className="absolute inset-y-0 right-0 bg-error/10" style={{ width: `${(ask.total / 100) * 100}%` }} />
              <div className="text-error font-mono relative z-10">{formatNumber(ask.price, 2)}</div>
              <div className="text-right font-mono text-muted-foreground relative z-10">{formatNumber(ask.amount, 4)}</div>
              <div className="text-right font-mono text-muted-foreground relative z-10">{formatNumber(ask.total, 4)}</div>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="py-2 px-2 bg-secondary rounded mb-3 text-center">
          <div className="text-lg font-mono font-bold">${formatNumber(bids[0].price, 2)}</div>
          <div className="text-xs text-muted-foreground">
            Spread: ${formatNumber(spread, 2)} ({formatNumber(spreadPercent, 3)}%)
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="space-y-0.5">
          {bids.map((bid, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 text-xs relative group hover:bg-muted/50 py-0.5 rounded">
              <div className="absolute inset-y-0 right-0 bg-success/10" style={{ width: `${(bid.total / 100) * 100}%` }} />
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
