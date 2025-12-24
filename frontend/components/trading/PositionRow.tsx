'use client'

import { usePosition, usePositionDetails } from '@/hooks/usePositions';
import { useClosePosition } from '@/hooks/useTrading';
import { formatNumber, formatUSD } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';

interface PositionRowProps {
  positionId: bigint;
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

  const { position } = usePositionDetails(positionId, marketAddress);
  const { closePosition, isPending } = useClosePosition();

  if (!position) {
    return (
      <tr>
        <td colSpan={9} className="py-3 text-center text-muted-foreground text-sm">
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
  const currentPrice = Number(position.currentPrice) / 1e18;
  const pnl = Number(position.pnl) / 1e18;
  const liquidationPrice = Number(position.liquidationPrice) / 1e18;
  
  // Calculate price change percentage
  const priceChange = currentPrice - entryPrice;
  const priceChangePercent = entryPrice > 0 ? (priceChange / entryPrice) * 100 : 0;

  return (
    <tr className="border-b border-border hover:bg-muted/50">
      <td className="py-3 font-medium">{position.marketName}</td>
      <td className="py-3">
        <span className={cn(
          'px-2 py-1 rounded text-xs font-medium',
          side === 'long'
            ? 'bg-success/20 text-success'
            : 'bg-error/20 text-error'
        )}>
          {side.toUpperCase()}
        </span>
      </td>
      <td className="text-right py-3 font-mono">{formatUSD(size)}</td>
      <td className="text-right py-3 font-mono">
        {formatUSD(collateral)}
        <span className="text-xs text-muted-foreground ml-1">
          {position.leverage.toString()}x
        </span>
      </td>
      <td className="text-right py-3">
        <div className="font-mono">${formatNumber(entryPrice, 2)}</div>
        <div className="text-xs text-muted-foreground">Entry</div>
      </td>
      <td className="text-right py-3">
        <div className="font-mono">${formatNumber(currentPrice, 2)}</div>
        <div className={cn(
          'text-xs',
          priceChange >= 0 ? 'text-success' : 'text-error'
        )}>
          {priceChange >= 0 ? '+' : ''}{formatNumber(priceChangePercent, 2)}%
        </div>
      </td>
      <td className="text-right py-3">
        <div className={cn(
          'font-mono font-medium',
          pnl >= 0 ? 'text-success' : 'text-error'
        )}>
          {pnl >= 0 ? '+' : ''}{formatUSD(pnl)}
        </div>
        <div className={cn(
          'text-xs',
          pnl >= 0 ? 'text-success' : 'text-error'
        )}>
          {pnl >= 0 ? '+' : ''}{formatNumber(position.pnlPercent, 2)}%
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          vs Entry: ${formatNumber(entryPrice, 2)}
        </div>
      </td>
      <td className="text-right py-3 font-mono text-error">
        ${formatNumber(liquidationPrice, 2)}
      </td>
      <td className="text-right py-3">
        <Button 
          size="sm" 
          variant="ghost"
          onClick={handleClose}
          disabled={isPending || position.status !== 0} // 0 = OPEN
        >
          {isPending ? 'Closing...' : 'Close'}
        </Button>
      </td>
    </tr>
  );
}

