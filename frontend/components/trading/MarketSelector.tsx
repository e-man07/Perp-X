'use client'

import { config } from "@/lib/config";
import { cn, formatTimeRemaining } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { Clock, TrendingUp, Zap, Calendar } from "lucide-react";

export type ExpiryOption = 'micro' | 'daily' | 'macro';

export interface MarketInfo {
  name: string;
  address: string;
  expiry: ExpiryOption;
  expiryLabel: string;
  expiryHours: number;
}

const expiryOptions: { key: ExpiryOption; label: string; hours: number; icon: typeof Clock }[] = [
  { key: 'micro', label: '24h', hours: 24, icon: Zap },
  { key: 'daily', label: '7d', hours: 168, icon: Calendar },
  { key: 'macro', label: '30d', hours: 720, icon: TrendingUp },
];

const assetMarkets = [
  { name: "BTC/USD", key: "btc" as const, symbol: "BTC" },
  { name: "ETH/USD", key: "eth" as const, symbol: "ETH" },
  { name: "ARB/USD", key: "arb" as const, symbol: "ARB" },
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
  const expiryOption = expiryOptions.find(e => e.key === market.expiry);
  const Icon = expiryOption?.icon || Clock;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-2 px-4 py-3 rounded-xl border transition-all min-w-[160px]",
        "hover:shadow-glow-sm",
        isSelected
          ? "bg-white text-black border-white shadow-glow-md"
          : "bg-gray-950 border-gray-800 hover:border-gray-700"
      )}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", isSelected ? "text-gray-600" : "text-gray-500")} />
          <span className="font-semibold text-sm">{market.expiryLabel}</span>
        </div>
        {settled && (
          <span className="text-2xs px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded font-medium">Settled</span>
        )}
        {isExpired && !settled && (
          <span className="text-2xs px-1.5 py-0.5 bg-error/20 text-error rounded font-medium">Expired</span>
        )}
      </div>
      {timeRemaining && !isExpired && (
        <div className={cn(
          "flex items-center gap-1.5 text-xs",
          isSelected ? "text-gray-600" : "text-gray-500"
        )}>
          <Clock className="h-3 w-3" />
          <span className="font-mono">{timeRemaining}</span>
        </div>
      )}
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
    <div className="space-y-6 p-5 bg-gray-950 border border-gray-800/50 rounded-xl">
      {/* Asset Selection */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 block">
          Select Asset
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
                  "px-5 py-2.5 rounded-lg border-2 transition-all font-semibold text-sm",
                  "hover:shadow-glow-sm",
                  isSelected
                    ? "bg-white text-black border-white shadow-glow-md"
                    : "bg-gray-950 border-gray-800 hover:border-gray-700 text-white"
                )}
              >
                <span className="font-mono">{asset.symbol}</span>
                <span className="text-gray-400 ml-1">/USD</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expiry Selection */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 block">
          Select Expiry
        </label>
        <div className="flex gap-3 overflow-x-auto pb-2">
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
