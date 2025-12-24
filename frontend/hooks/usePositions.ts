'use client'

import { useAccount, useReadContract } from 'wagmi';
import { config } from '@/lib/config';
import { PositionManagerABI } from '@/lib/abis/PositionManager';
import { OutcomeMarketABI } from '@/lib/abis/OutcomeMarket';
import { useMemo } from 'react';

export interface Position {
  id: bigint;
  user: string;
  market: string;
  direction: 0 | 1; // 0 = LONG, 1 = SHORT
  collateralUSD: bigint;
  leverage: bigint;
  positionSize: bigint;
  entryPrice: bigint;
  openedAt: bigint;
  status: number; // 0 = OPEN, 1 = CLOSED, 2 = LIQUIDATED, 3 = SETTLED, 4 = CLAIMED
  accumulatedFunding: bigint;
  lastFundingTimestamp: bigint;
}

export interface PositionWithDetails extends Position {
  currentPrice: bigint;
  pnl: bigint;
  pnlPercent: number;
  liquidationPrice: bigint;
  marketName: string;
}

export function useUserPositions() {
  const { address } = useAccount();

  const { data: positionIds, refetch } = useReadContract({
    address: config.contracts.positionManager as `0x${string}`,
    abi: PositionManagerABI,
    functionName: 'getUserPositions',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 30000, // Refetch every 30 seconds (reduced to avoid rate limits)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  });

  return {
    positionIds: positionIds || [],
    refetch,
    isLoading: !address,
  };
}

export function usePosition(positionId: bigint | undefined) {
  const { data: position, refetch } = useReadContract({
    address: config.contracts.positionManager as `0x${string}`,
    abi: PositionManagerABI,
    functionName: 'getPosition',
    args: positionId ? [positionId] : undefined,
    query: {
      enabled: !!positionId,
    },
  });

  return {
    position: position as Position | undefined,
    refetch,
  };
}

export function usePositionPnL(positionId: bigint | undefined, currentPrice: bigint | undefined) {
  const { data: pnl } = useReadContract({
    address: config.contracts.positionManager as `0x${string}`,
    abi: PositionManagerABI,
    functionName: 'calculateUnrealizedPnL',
    args: positionId && currentPrice ? [positionId, currentPrice] : undefined,
    query: {
      enabled: !!positionId && !!currentPrice,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  return {
    pnl: pnl as bigint | undefined,
  };
}

export function useLiquidationPrice(positionId: bigint | undefined) {
  const { data: liquidationPrice } = useReadContract({
    address: config.contracts.positionManager as `0x${string}`,
    abi: PositionManagerABI,
    functionName: 'getLiquidationPrice',
    args: positionId ? [positionId] : undefined,
    query: {
      enabled: !!positionId,
    },
  });

  return {
    liquidationPrice: liquidationPrice as bigint | undefined,
  };
}

export function useUserPositionsInMarket(marketAddress: string) {
  const { address } = useAccount();

  const { data: positionIds, refetch } = useReadContract({
    address: config.contracts.positionManager as `0x${string}`,
    abi: PositionManagerABI,
    functionName: 'getUserPositionsInMarket',
    args: address && marketAddress ? [address, marketAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!marketAddress,
      refetchInterval: 10000,
    },
  });

  return {
    positionIds: positionIds || [],
    refetch,
  };
}

// Helper to get market name from address
function getMarketName(address: string): string {
  const markets = config.contracts.markets;
  // Check all expiry options for each asset
  const addrLower = address.toLowerCase();
  if (addrLower === markets.btc.micro.toLowerCase() || 
      addrLower === markets.btc.daily.toLowerCase() || 
      addrLower === markets.btc.macro.toLowerCase()) return 'BTC/USD';
  if (addrLower === markets.eth.micro.toLowerCase() || 
      addrLower === markets.eth.daily.toLowerCase() || 
      addrLower === markets.eth.macro.toLowerCase()) return 'ETH/USD';
  if (addrLower === markets.mon.micro.toLowerCase() || 
      addrLower === markets.mon.daily.toLowerCase() || 
      addrLower === markets.mon.macro.toLowerCase()) return 'MON/USD';
  return address.slice(0, 6) + '...';
}

// Hook to get all user positions with full details
export function useUserPositionsWithDetails() {
  const { positionIds, isLoading: loadingIds } = useUserPositions();
  
  // Fetch all positions
  const positions = useMemo(() => {
    if (!positionIds || positionIds.length === 0) return [];
    
    return positionIds.map((id) => ({
      id,
      positionId: id,
    }));
  }, [positionIds]);

  return {
    positions,
    isLoading: loadingIds,
  };
}

// Hook to get position details with PnL and liquidation price
export function usePositionDetails(positionId: bigint | undefined, marketAddress: string) {
  const { position } = usePosition(positionId);
  
  // Get current price from market
  const { data: currentPrice } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: OutcomeMarketABI,
    functionName: 'getCachedPrice',
    query: {
      enabled: !!marketAddress,
      refetchInterval: 5000,
    },
  });

  const { pnl } = usePositionPnL(positionId, currentPrice as bigint | undefined);
  const { liquidationPrice } = useLiquidationPrice(positionId);

  const positionWithDetails = useMemo((): PositionWithDetails | undefined => {
    if (!position || !currentPrice) return undefined;

    const entryPriceNum = Number(position.entryPrice) / 1e18;
    const currentPriceNum = Number(currentPrice) / 1e18;
    const collateralNum = Number(position.collateralUSD) / 1e18;
    const positionSizeNum = Number(position.positionSize) / 1e18;
    
    // Calculate PnL percentage
    let pnlPercent = 0;
    if (pnl) {
      const pnlNum = Number(pnl) / 1e18;
      pnlPercent = (pnlNum / collateralNum) * 100;
    }

    return {
      ...position,
      currentPrice: currentPrice as bigint,
      pnl: pnl || BigInt(0),
      pnlPercent,
      liquidationPrice: liquidationPrice || BigInt(0),
      marketName: getMarketName(position.market),
    };
  }, [position, currentPrice, pnl, liquidationPrice]);

  return {
    position: positionWithDetails,
    isLoading: !position || !currentPrice,
  };
}

