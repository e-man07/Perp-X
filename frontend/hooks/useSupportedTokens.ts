'use client'

import { useReadContract } from 'wagmi';
import { config } from '@/lib/config';
import { CollateralVaultABI } from '@/lib/abis/CollateralVault';

// Common token addresses on Arbitrum Sepolia to check
const KNOWN_TOKENS = [
  {
    address: config.contracts.usdc,
    symbol: 'USDC',
    name: 'USD Coin',
  },
  // Add more known tokens if needed
  // {
  //   address: '0x...',
  //   symbol: 'USDT',
  //   name: 'Tether USD',
  // },
];

export function useSupportedTokens() {
  // Check USDC (we'll expand this if needed for more tokens)
  const { data: usdcSupported, isLoading: usdcLoading, error: usdcError } = useReadContract({
    address: config.contracts.vault as `0x${string}`,
    abi: CollateralVaultABI,
    functionName: 'isSupportedCollateral',
    args: [config.contracts.usdc as `0x${string}`],
  });

  const checks = KNOWN_TOKENS.map((token, index) => {
    if (index === 0) {
      // First token is USDC, use the hook result
      return {
        ...token,
        isSupported: usdcSupported ?? false,
        isLoading: usdcLoading,
        error: usdcError,
      };
    }
    // For other tokens, we'd need separate hooks (can expand later)
    return {
      ...token,
      isSupported: false,
      isLoading: false,
      error: null,
    };
  });

  const supportedTokens = checks.filter((check) => check.isSupported);
  const isLoading = checks.some((check) => check.isLoading);
  const hasError = checks.some((check) => check.error);

  return {
    supportedTokens,
    allTokens: checks,
    isLoading,
    hasError,
  };
}

// Utility function to check if a specific token is supported
export function useIsTokenSupported(tokenAddress: string) {
  const { data: isSupported, isLoading, error } = useReadContract({
    address: config.contracts.vault as `0x${string}`,
    abi: CollateralVaultABI,
    functionName: 'isSupportedCollateral',
    args: tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000' 
      ? [tokenAddress as `0x${string}`] 
      : undefined,
    query: {
      enabled: !!tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000',
    },
  });

  return {
    isSupported: isSupported ?? false,
    isLoading,
    error,
  };
}

