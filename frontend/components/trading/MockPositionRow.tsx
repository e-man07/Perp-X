'use client'

import { useMockPositions } from '@/hooks/useMockPositions';
import { formatNumber, formatUSD } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface MockPositionRowProps {
  position: {
    id: string;
    marketName: string;
    direction: 0 | 1;
    positionSize: number;
    collateralUSD: number;
    leverage: number;
    entryPrice: number;
    currentPrice: number;
    pnl: number;
    pnlPercent: number;
    liquidationPrice: number;
  };
}

export function MockPositionRow({ position }: MockPositionRowProps) {
  const { removeMockPosition } = useMockPositions();
  const side = position.direction === 0 ? 'long' : 'short';

  const handleClose = () => {
    if (confirm(`Close position?`)) {
      removeMockPosition(position.id);
    }
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50">
      <td className="py-3 font-medium">
        {position.marketName}
      </td>
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
      <td className="text-right py-3 font-mono">{formatUSD(position.positionSize)}</td>
      <td className="text-right py-3 font-mono">
        {formatUSD(position.collateralUSD)}
        <span className="text-xs text-muted-foreground ml-1">
          {position.leverage}x
        </span>
      </td>
      <td className="text-right py-3 font-mono">${formatNumber(position.entryPrice, 2)}</td>
      <td className="text-right py-3 font-mono">${formatNumber(position.currentPrice, 2)}</td>
      <td className="text-right py-3">
        <div className={cn(
          'font-mono font-medium',
          position.pnl >= 0 ? 'text-success' : 'text-error'
        )}>
          {position.pnl >= 0 ? '+' : ''}{formatUSD(position.pnl)}
        </div>
        <div className={cn(
          'text-xs',
          position.pnl >= 0 ? 'text-success' : 'text-error'
        )}>
          {position.pnl >= 0 ? '+' : ''}{formatNumber(position.pnlPercent, 2)}%
        </div>
      </td>
      <td className="text-right py-3 font-mono text-error">
        ${formatNumber(position.liquidationPrice, 2)}
      </td>
      <td className="text-right py-3">
        <Button 
          size="sm" 
          variant="ghost"
          onClick={handleClose}
        >
          Close
        </Button>
      </td>
    </tr>
  );
}

