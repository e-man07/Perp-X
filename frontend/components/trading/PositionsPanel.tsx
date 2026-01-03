'use client'

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useUserPositions } from '@/hooks/usePositions';
import { PositionRow } from './PositionRow';

type TabType = 'positions' | 'orders' | 'history';

export function PositionsPanel() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>('positions');

  const { positionIds, isLoading: loadingPositions, refetch: refetchPositions } = useUserPositions();

  // Filter only OPEN positions (status = 0)
  // Note: We'll filter in PositionRow component since we need to fetch position first
  const openPositionIds = positionIds || [];

  // Debug logging
  useEffect(() => {
    console.log('=== PositionsPanel Debug ===');
    console.log('openPositionIds count:', openPositionIds.length);
    console.log('isConnected:', isConnected);
    console.log('address:', address);
  }, [openPositionIds.length, isConnected, address]);

  // Auto-refetch positions periodically and on mount
  useEffect(() => {
    if (isConnected && address) {
      // Refetch immediately
      refetchPositions();
      // Then refetch every 30 seconds (reduced to avoid rate limits)
      const interval = setInterval(() => {
        refetchPositions();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, address, refetchPositions]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            {(['positions', 'orders', 'history'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'text-sm font-medium pb-2 border-b-2 transition-colors capitalize',
                  activeTab === tab
                    ? 'border-white text-white'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <CardTitle className="text-base">
            {activeTab === 'positions' && `${openPositionIds.length} Open`}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'positions' && (
          <div>
            {loadingPositions && openPositionIds.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading positions...
              </div>
            ) : openPositionIds.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {!isConnected ? 'Connect wallet to view positions' : 'No open positions'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">Market</th>
                      <th className="text-left py-2 font-medium">Side</th>
                      <th className="text-right py-2 font-medium">Size</th>
                      <th className="text-right py-2 font-medium">Collateral</th>
                      <th className="text-right py-2 font-medium">Entry</th>
                      <th className="text-right py-2 font-medium">Current</th>
                      <th className="text-right py-2 font-medium">PnL</th>
                      <th className="text-right py-2 font-medium">Liq. Price</th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openPositionIds.map((positionId) => (
                      <PositionRow key={positionId.toString()} positionId={positionId} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="text-center py-12 text-muted-foreground">
            No open orders
          </div>
        )}

        {activeTab === 'history' && (
          <div className="text-center py-12 text-muted-foreground">
            No trading history
          </div>
        )}
      </CardContent>
    </Card>
  );
}
