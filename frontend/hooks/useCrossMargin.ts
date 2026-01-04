'use client'

import { useAccount, useReadContract } from 'wagmi';
import { config } from '@/lib/config';
import { CrossMarginABI } from '@/lib/abis/CrossMargin';

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function useAccountEquity() {
  const { address } = useAccount();
  const crossMarginEnabled = (config.contracts.crossMargin as string) !== ZERO_ADDRESS;

  const { data: equity, refetch, isLoading } = useReadContract({
    address: config.contracts.crossMargin as `0x${string}`,
    abi: CrossMarginABI,
    functionName: 'getAccountEquity',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && crossMarginEnabled,
      refetchInterval: 10000
    },
  });

  return {
    equity: equity ? Number(equity) / 1e18 : 0,
    equityRaw: equity,
    refetch,
    isLoading,
  };
}

export function useMarginUsed() {
  const { address } = useAccount();
  const crossMarginEnabled = (config.contracts.crossMargin as string) !== ZERO_ADDRESS;

  const { data: marginUsed, refetch, isLoading } = useReadContract({
    address: config.contracts.crossMargin as `0x${string}`,
    abi: CrossMarginABI,
    functionName: 'getMarginUsed',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && crossMarginEnabled
    },
  });

  return {
    marginUsed: marginUsed ? Number(marginUsed) / 1e18 : 0,
    marginUsedRaw: marginUsed,
    refetch,
    isLoading,
  };
}

export function useAvailableMargin() {
  const { address } = useAccount();
  const crossMarginEnabled = (config.contracts.crossMargin as string) !== ZERO_ADDRESS;

  const { data: availableMargin, refetch, isLoading } = useReadContract({
    address: config.contracts.crossMargin as `0x${string}`,
    abi: CrossMarginABI,
    functionName: 'getAvailableMargin',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && crossMarginEnabled,
      refetchInterval: 10000
    },
  });

  return {
    availableMargin: availableMargin ? Number(availableMargin) / 1e18 : 0,
    availableMarginRaw: availableMargin,
    refetch,
    isLoading,
  };
}

export function useAccountHealth(minMarginRatioBps: bigint = BigInt(1000)) {
  const { address } = useAccount();
  const crossMarginEnabled = (config.contracts.crossMargin as string) !== ZERO_ADDRESS;

  const { data: isHealthy, isLoading } = useReadContract({
    address: config.contracts.crossMargin as `0x${string}`,
    abi: CrossMarginABI,
    functionName: 'isAccountHealthy',
    args: address ? [address, minMarginRatioBps] : undefined,
    query: {
      enabled: !!address && crossMarginEnabled,
      refetchInterval: 5000
    },
  });

  return { isHealthy: isHealthy ?? true, isLoading };
}

// Combined hook for all cross-margin data
export function useCrossMarginAccount() {
  const { equity, equityRaw, isLoading: equityLoading } = useAccountEquity();
  const { marginUsed, marginUsedRaw, isLoading: marginLoading } = useMarginUsed();
  const { availableMargin, availableMarginRaw, isLoading: availableLoading } = useAvailableMargin();
  const { isHealthy, isLoading: healthLoading } = useAccountHealth();

  const marginRatio = marginUsed > 0 ? (equity / marginUsed) * 100 : 100;

  return {
    equity,
    equityRaw,
    marginUsed,
    marginUsedRaw,
    availableMargin,
    availableMarginRaw,
    marginRatio,
    isHealthy,
    isLoading: equityLoading || marginLoading || availableLoading || healthLoading,
  };
}
