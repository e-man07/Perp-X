'use client'

import { useState, useMemo, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatNumber, formatUSD, cn } from '@/lib/utils';
import { useUserPositions } from '@/hooks/usePositions';
import { useMockPositions } from '@/hooks/useMockPositions';
import { PositionRow } from './PositionRow';
import { MockPositionRow } from './MockPositionRow';

type TabType = 'positions' | 'orders' | 'history';

export function PositionsPanel() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>('positions');
  
  const { positionIds, isLoading: loadingPositions, refetch: refetchPositions } = useUserPositions();
  const { positions: mockPositions, updateMockPositionPrice, isLoading: loadingMockPositions, forceRefresh: refreshMockPositions } = useMockPositions();
  
  // Filter only OPEN positions (status = 0)
  // Note: We'll filter in PositionRow component since we need to fetch position first
  const openPositionIds = positionIds || [];
  
  // Debug logging
  useEffect(() => {
    console.log('=== PositionsPanel Debug ===');
    console.log('mockPositions count:', mockPositions.length);
    console.log('mockPositions data:', mockPositions);
    console.log('openPositionIds count:', openPositionIds.length);
    console.log('isConnected:', isConnected);
    console.log('address:', address);
    console.log('loadingMockPositions:', loadingMockPositions);
    
    // Also check localStorage directly
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('perp-x-mock-positions');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log('localStorage positions:', parsed.length, parsed);
        } catch (e) {
          console.error('Failed to parse localStorage:', e);
        }
      } else {
        console.log('No positions in localStorage');
      }
    }
  }, [mockPositions, openPositionIds.length, isConnected, address, loadingMockPositions]);
  
  // Listen for new mock positions being created - force reload
  useEffect(() => {
    const handleMockPositionCreated = (e: any) => {
      console.log('Mock position created event received in PositionsPanel', e.detail);
      // Force refresh the mock positions hook
      if (refreshMockPositions) {
        refreshMockPositions();
      }
      // Also check localStorage directly
      setTimeout(() => {
        console.log('Checking positions after event...');
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('perp-x-mock-positions');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              console.log('PositionsPanel - Reloaded from localStorage:', parsed.length, parsed);
            } catch (e) {
              console.error('Failed to reload positions:', e);
            }
          }
        }
      }, 100);
    };

    const handleMockPositionsUpdated = (e: any) => {
      console.log('Mock positions updated event received:', e.detail);
      // Force refresh
      if (refreshMockPositions) {
        refreshMockPositions();
      }
    };

    window.addEventListener('mockPositionCreated', handleMockPositionCreated);
    window.addEventListener('mockPositionsUpdated', handleMockPositionsUpdated);
    
    return () => {
      window.removeEventListener('mockPositionCreated', handleMockPositionCreated);
      window.removeEventListener('mockPositionsUpdated', handleMockPositionsUpdated);
    };
  }, [refreshMockPositions]);

  // Update mock position prices periodically
  useEffect(() => {
    if (mockPositions.length > 0) {
      // This would ideally fetch current prices for each market
      // For now, we'll just update them when component mounts
      const interval = setInterval(() => {
        mockPositions.forEach(pos => {
          // In a real implementation, fetch current price for pos.market
          // For now, we'll simulate price changes
          const priceChange = (Math.random() - 0.5) * 0.02; // ±1% random change
          const newPrice = pos.entryPrice * (1 + priceChange);
          updateMockPositionPrice(pos.id, newPrice);
        });
      }, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [mockPositions, updateMockPositionPrice]);
  
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
            {activeTab === 'positions' && `${openPositionIds.length + mockPositions.length} Open`}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'positions' && (
          <div>
            {loadingPositions && openPositionIds.length === 0 && mockPositions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading positions...
              </div>
            ) : openPositionIds.length === 0 && mockPositions.length === 0 ? (
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
                    {/* Display real positions */}
                    {openPositionIds.map((positionId) => (
                      <PositionRow key={positionId.toString()} positionId={positionId} />
                    ))}
                    {/* Display mock positions */}
                    {mockPositions.length > 0 ? (
                      mockPositions.map((position) => (
                        <MockPositionRow key={position.id} position={position} />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-muted-foreground text-sm">
                          {address ? 'No mock positions found for your address' : 'Connect wallet to view positions'}
                          {process.env.NODE_ENV === 'development' && (
                            <div className="mt-2 text-xs">
                              Debug: Check console for position data
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
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
