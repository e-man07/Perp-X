'use client'

import { config } from "@/lib/config";
import { cn, formatTimeRemaining } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { Clock } from "lucide-react";

export type ExpiryOption = 'micro' | 'daily' | 'macro';

export interface MarketInfo {
  name: string;
  address: string;
  expiry: ExpiryOption;
  expiryLabel: string;
  expiryHours: number;
}

const expiryOptions: { key: ExpiryOption; label: string; hours: number }[] = [
  { key: 'micro', label: '24h', hours: 24 },
  { key: 'daily', label: '7d', hours: 168 },
  { key: 'macro', label: '30d', hours: 720 },
];

const assetMarkets = [
  { name: "BTC/USD", key: "btc" as const },
  { name: "ETH/USD", key: "eth" as const },
  { name: "ARB/USD", key: "arb" as const },
];

interface MarketSelectorProps {
  selectedMarket: MarketInfo;
  onSelectMarket: (market: MarketInfo) => void;
}

function MarketButton({ 
  market, 
  isSelected, 
  onClick 
}: { 
  market: MarketInfo; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  const { expiryTimestamp, settled } = useMarketData(market.address);
  const expiry = expiryTimestamp ? Number(expiryTimestamp) : 0;
  const timeRemaining = expiry > 0 ? formatTimeRemaining(expiry) : null;
  const isExpired = expiry > 0 && Date.now() / 1000 >= expiry;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1.5 px-4 py-3 rounded-lg border transition-all whitespace-nowrap text-left min-w-[140px]",
        isSelected
          ? "bg-white text-black border-white shadow-md"
          : "bg-secondary border-border hover:border-muted-foreground hover:bg-secondary/80"
      )}
    >
      <div className="flex items-center gap-2 w-full">
        <span className="font-semibold text-sm">{market.name}</span>
        {settled && (
          <span className="text-xs px-1.5 py-0.5 bg-muted rounded">Settled</span>
        )}
        {isExpired && !settled && (
          <span className="text-xs px-1.5 py-0.5 bg-error/20 text-error rounded">Expired</span>
        )}
      </div>
      <div className="flex items-center gap-2 w-full">
        <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded">
          {market.expiryLabel}
        </span>
        {timeRemaining && !isExpired && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{timeRemaining}</span>
          </div>
        )}
      </div>
    </button>
  );
}

export function MarketSelector({ selectedMarket, onSelectMarket }: MarketSelectorProps) {
  // Generate all market combinations
  const allMarkets: MarketInfo[] = assetMarkets.flatMap(asset => 
    expiryOptions.map(expiry => ({
      name: asset.name,
      address: config.contracts.markets[asset.key][expiry.key],
      expiry: expiry.key,
      expiryLabel: expiry.label,
      expiryHours: expiry.hours,
    }))
  );

  return (
    <div className="space-y-4 p-4 bg-card border rounded-lg">
      {/* Asset Selection */}
      <div>
        <label className="text-sm font-semibold text-foreground mb-3 block">
          📊 Select Asset
        </label>
        <div className="flex gap-2 flex-wrap">
          {assetMarkets.map((asset) => {
            const isSelected = selectedMarket.name === asset.name;
            return (
              <button
                key={asset.name}
                onClick={() => {
                  // Switch to same expiry for new asset
                  const currentExpiry = selectedMarket.expiry;
                  const newMarket = allMarkets.find(
                    m => m.name === asset.name && m.expiry === currentExpiry
                  ) || allMarkets.find(m => m.name === asset.name) || allMarkets[0];
                  onSelectMarket(newMarket);
                }}
                className={cn(
                  "px-4 py-2.5 rounded-md border-2 transition-all font-medium text-sm",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                    : "bg-secondary border-border hover:border-primary/50 hover:bg-secondary/80"
                )}
              >
                {asset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expiry Selection */}
      <div>
        <label className="text-sm font-semibold text-foreground mb-3 block">
          ⏰ Select Expiry Duration
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {expiryOptions.map((expiry) => {
            const market = allMarkets.find(
              m => m.name === selectedMarket.name && m.expiry === expiry.key
            );
            if (!market) return null;
            
            return (
              <MarketButton
                key={`${selectedMarket.name}-${expiry.key}`}
                market={market}
                isSelected={
                  selectedMarket.name === market.name && 
                  selectedMarket.expiry === market.expiry
                }
                onClick={() => onSelectMarket(market)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
