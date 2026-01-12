'use client'

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useUserPositions } from '@/hooks/usePositions';
import { PositionRow } from './PositionRow';
import { Layers, Clock, History, Wallet } from 'lucide-react';

type TabType = 'positions' | 'orders' | 'history';

const tabs = [
  { key: 'positions' as TabType, label: 'Positions', icon: Layers },
  { key: 'orders' as TabType, label: 'Orders', icon: Clock },
  { key: 'history' as TabType, label: 'History', icon: History },
];

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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
                    activeTab === tab.key
                      ? 'bg-white text-black'
                      : 'text-gray-500 hover:text-white hover:bg-gray-900'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Position Count */}
          {activeTab === 'positions' && openPositionIds.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Open:</span>
              <span className="font-mono font-semibold bg-white/10 px-2 py-0.5 rounded">
                {openPositionIds.length}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'positions' && (
          <div>
            {loadingPositions && openPositionIds.length === 0 ? (
              <div className="text-center py-16">
                <div className="h-8 w-8 mx-auto mb-3 rounded-full border-2 border-gray-700 border-t-gray-400 animate-spin" />
                <div className="text-gray-500 text-sm">Loading positions...</div>
              </div>
            ) : openPositionIds.length === 0 ? (
              <div className="text-center py-16">
                <div className="h-16 w-16 mx-auto mb-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center">
                  {!isConnected ? (
                    <Wallet className="h-8 w-8 text-gray-600" />
                  ) : (
                    <Layers className="h-8 w-8 text-gray-600" />
                  )}
                </div>
                <div className="text-gray-400 font-medium mb-1">
                  {!isConnected ? 'Wallet Not Connected' : 'No Open Positions'}
                </div>
                <div className="text-gray-600 text-sm">
                  {!isConnected
                    ? 'Connect your wallet to view positions'
                    : 'Open a position to get started'}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-2 text-2xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                      <th className="text-left py-3 px-2 text-2xs font-medium text-gray-500 uppercase tracking-wider">Side</th>
                      <th className="text-right py-3 px-2 text-2xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="text-right py-3 px-2 text-2xs font-medium text-gray-500 uppercase tracking-wider">Collateral</th>
                      <th className="text-right py-3 px-2 text-2xs font-medium text-gray-500 uppercase tracking-wider">Entry</th>
                      <th className="text-right py-3 px-2 text-2xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                      <th className="text-right py-3 px-2 text-2xs font-medium text-gray-500 uppercase tracking-wider">PnL</th>
                      <th className="text-right py-3 px-2 text-2xs font-medium text-gray-500 uppercase tracking-wider">Liq. Price</th>
                      <th className="text-right py-3 px-2 text-2xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
          <div className="text-center py-16">
            <div className="h-16 w-16 mx-auto mb-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center">
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
            <div className="text-gray-400 font-medium mb-1">No Open Orders</div>
            <div className="text-gray-600 text-sm">Limit orders coming soon</div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="text-center py-16">
            <div className="h-16 w-16 mx-auto mb-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center">
              <History className="h-8 w-8 text-gray-600" />
            </div>
            <div className="text-gray-400 font-medium mb-1">No Trading History</div>
            <div className="text-gray-600 text-sm">Your closed positions will appear here</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
