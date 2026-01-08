'use client'

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { PythPriceAdapterABI } from '@/lib/abis/PythPriceAdapter';
import { config } from '@/lib/config';

/**
 * Hook to update the cached price in PythPriceAdapter with CoinGecko price
 * This allows using real-time prices when opening positions
 */
export function useUpdatePrice() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isReceiptError, error: receiptError } = useWaitForTransactionReceipt({
    hash,
    query: {
      retry: 3,
      retryDelay: 2000,
    },
  });

  /**
   * Update the cached price for an asset
   * @param asset - The asset name (e.g., "BTC/USD")
   * @param priceUsd - The price in USD (e.g., 91000 for $91,000)
   */
  const updatePriceCache = async (asset: string, priceUsd: number) => {
    // Convert to 18 decimals (contract expects price in 18 decimal format)
    const price18Dec = BigInt(Math.floor(priceUsd * 1e18));

    console.log('Updating price cache:', {
      asset,
      priceUsd,
      price18Dec: price18Dec.toString(),
      priceAdapter: config.contracts.priceAdapter
    });

    writeContract({
      address: config.contracts.priceAdapter as `0x${string}`,
      abi: PythPriceAdapterABI,
      functionName: 'update_price_cache',
      args: [asset, price18Dec],
      gas: BigInt(300000), // Manual gas limit for Stylus contracts
    });
  };

  return {
    updatePriceCache,
    isPending: isPending || isConfirming,
    isSuccess,
    isError: !!error || isReceiptError,
    error: error || receiptError,
    hash,
    reset,
  };
}

/**
 * Hook to read the current cached price from PythPriceAdapter
 */
export function useCachedPrice(asset: string) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: config.contracts.priceAdapter as `0x${string}`,
    abi: PythPriceAdapterABI,
    functionName: 'get_cached_price',
    args: [asset],
    query: {
      enabled: !!asset,
    },
  });

  const price = data ? Number(data[0]) / 1e18 : 0;
  const timestamp = data ? Number(data[1]) : 0;

  return {
    price,
    timestamp,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get the owner of the price adapter (for checking permissions)
 */
export function usePriceAdapterOwner() {
  const { data, isLoading, error } = useReadContract({
    address: config.contracts.priceAdapter as `0x${string}`,
    abi: PythPriceAdapterABI,
    functionName: 'get_owner',
    args: [],
  });

  return {
    owner: data as string | undefined,
    isLoading,
    error,
  };
}
