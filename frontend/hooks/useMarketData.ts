'use client'

import { useReadContract } from 'wagmi';
import { config } from '@/lib/config';
import { OutcomeMarketABI } from '@/lib/abis/OutcomeMarket';

export function useMarketData(marketAddress: string) {
  const { data: assetPair } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: OutcomeMarketABI,
    functionName: 'assetPair',
  });

  const { data: currentPrice } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: OutcomeMarketABI,
    functionName: 'getCachedPrice',
  });

  const { data: totalLongOI } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: OutcomeMarketABI,
    functionName: 'getTotalLongOI',
  });

  const { data: totalShortOI } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: OutcomeMarketABI,
    functionName: 'getTotalShortOI',
  });

  const { data: expiryTimestamp } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: OutcomeMarketABI,
    functionName: 'expiryTimestamp',
  });

  const { data: settled } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: OutcomeMarketABI,
    functionName: 'settled',
  });

  return {
    assetPair,
    currentPrice,
    totalLongOI,
    totalShortOI,
    expiryTimestamp,
    settled,
  };
}

export function useMarketPrice(marketAddress: string) {
  const { data: price, isLoading, error, refetch } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: OutcomeMarketABI,
    functionName: 'getCachedPrice',
    query: {
      enabled: !!marketAddress,
      refetchInterval: 15000, // Refetch every 15 seconds (reduced to avoid rate limits)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  });

  // If cached price is 0 or unavailable, try to get a fallback
  const priceValue = price ? Number(price) / 1e18 : 0;
  const hasValidPrice = priceValue > 0;

  return {
    price: priceValue,
    isLoading,
    error,
    refetch,
    hasValidPrice,
  };
}
