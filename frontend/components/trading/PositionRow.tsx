'use client'

import { usePosition, usePositionDetails } from '@/hooks/usePositions';
import { useClosePosition } from '@/hooks/useTrading';
import { useCoinGeckoPrice } from '@/hooks/useCoinGecko';
import { formatNumber, formatUSD } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useEffect, useState, useMemo } from 'react';
import { config } from '@/lib/config';

interface PositionRowProps {
  positionId: bigint;
}

// Helper to get market name from address
function getMarketName(address: string): string {
  const markets = config.contracts.markets;
  const addrLower = address.toLowerCase();
  if (addrLower === markets.btc.micro.toLowerCase() ||
      addrLower === markets.btc.daily.toLowerCase() ||
      addrLower === markets.btc.macro.toLowerCase()) return 'BTC/USD';
  if (addrLower === markets.eth.micro.toLowerCase() ||
      addrLower === markets.eth.daily.toLowerCase() ||
      addrLower === markets.eth.macro.toLowerCase()) return 'ETH/USD';
  if (addrLower === markets.arb.micro.toLowerCase() ||
      addrLower === markets.arb.daily.toLowerCase() ||
      addrLower === markets.arb.macro.toLowerCase()) return 'ARB/USD';
  return address.slice(0, 6) + '...';
}

export function PositionRow({ positionId }: PositionRowProps) {
  const { position: rawPosition } = usePosition(positionId);
  const [marketAddress, setMarketAddress] = useState<string>('');

  // Get market address from position
  useEffect(() => {
    if (rawPosition) {
      setMarketAddress(rawPosition.market);
    }
  }, [rawPosition]);

  // Get market name for CoinGecko
  const marketName = useMemo(() => {
    if (!marketAddress) return 'BTC/USD';
    return getMarketName(marketAddress);
  }, [marketAddress]);

  // Get real-time price from CoinGecko
  const { price: coinGeckoPrice } = useCoinGeckoPrice(marketName);

  const { position } = usePositionDetails(positionId, marketAddress);
  const { closePosition, isPending } = useClosePosition();

  if (!position) {
    return (
      <tr>
        <td colSpan={9} className="py-3 text-center text-gray-500 text-sm">
          Loading position...
        </td>
      </tr>
    );
  }

  // Only show OPEN positions (status = 0)
  if (position.status !== 0) {
    return null;
  }

  const handleClose = () => {
    if (confirm(`Close position #${position.id.toString()}?`)) {
      closePosition(marketAddress, positionId);
    }
  };

  const side = position.direction === 0 ? 'long' : 'short';
  const size = Number(position.positionSize) / 1e18;
  const collateral = Number(position.collateralUSD) / 1e18;
  const entryPrice = Number(position.entryPrice) / 1e18;
  const leverage = Number(position.leverage);

  // Use CoinGecko price if available, otherwise fall back to contract price
  const currentPrice = coinGeckoPrice > 0 ? coinGeckoPrice : Number(position.currentPrice) / 1e18;

  // Calculate PnL based on live price
  // For LONG: PnL = positionSize * (currentPrice - entryPrice) / entryPrice
  // For SHORT: PnL = positionSize * (entryPrice - currentPrice) / entryPrice
  const priceChange = currentPrice - entryPrice;
  const priceChangePercent = entryPrice > 0 ? (priceChange / entryPrice) * 100 : 0;

  let pnl = 0;
  if (entryPrice > 0) {
    if (side === 'long') {
      pnl = size * (currentPrice - entryPrice) / entryPrice;
    } else {
      pnl = size * (entryPrice - currentPrice) / entryPrice;
    }
  }

  const pnlPercent = collateral > 0 ? (pnl / collateral) * 100 : 0;

  // Calculate liquidation price
  // For LONG: liqPrice = entryPrice * (1 - 1/leverage)
  // For SHORT: liqPrice = entryPrice * (1 + 1/leverage)
  const liquidationPrice = side === 'long'
    ? entryPrice * (1 - 1 / leverage)
    : entryPrice * (1 + 1 / leverage);

  return (
    <tr className="border-b border-gray-800 hover:bg-white/5 transition-colors">
      <td className="py-4 px-2 font-medium">{position.marketName}</td>
      <td className="py-4 px-2">
        <span className={cn(
          'px-2.5 py-1 rounded-md text-xs font-semibold uppercase',
          side === 'long'
            ? 'bg-success/20 text-success'
            : 'bg-error/20 text-error'
        )}>
          {side}
        </span>
      </td>
      <td className="text-right py-4 px-2 font-mono">{formatUSD(size)}</td>
      <td className="text-right py-4 px-2 font-mono">
        {formatUSD(collateral)}
        <span className="text-xs text-gray-500 ml-1">
          {leverage}x
        </span>
      </td>
      <td className="text-right py-4 px-2">
        <div className="font-mono">${formatNumber(entryPrice, 2)}</div>
        <div className="text-xs text-gray-500">Entry</div>
      </td>
      <td className="text-right py-4 px-2">
        <div className="font-mono">${formatNumber(currentPrice, 2)}</div>
        <div className={cn(
          'text-xs font-medium',
          priceChange >= 0 ? 'text-success' : 'text-error'
        )}>
          {priceChange >= 0 ? '+' : ''}{formatNumber(priceChangePercent, 2)}%
        </div>
      </td>
      <td className="text-right py-4 px-2">
        <div className={cn(
          'font-mono font-semibold',
          pnl >= 0 ? 'text-success' : 'text-error'
        )}>
          {pnl >= 0 ? '+' : ''}{formatUSD(pnl)}
        </div>
        <div className={cn(
          'text-xs font-medium',
          pnl >= 0 ? 'text-success' : 'text-error'
        )}>
          {pnl >= 0 ? '+' : ''}{formatNumber(pnlPercent, 2)}%
        </div>
      </td>
      <td className="text-right py-4 px-2 font-mono text-error">
        ${formatNumber(liquidationPrice, 2)}
      </td>
      <td className="text-right py-4 px-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleClose}
          disabled={isPending || position.status !== 0}
        >
          {isPending ? 'Closing...' : 'Close'}
        </Button>
      </td>
    </tr>
  );
}
