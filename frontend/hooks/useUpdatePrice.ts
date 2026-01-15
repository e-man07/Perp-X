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
   * Submit the price using bytes32 price ID (PUBLIC - anyone can call)
   * This bypasses the asset name lookup and uses the price ID directly
   * @param asset - The asset name (e.g., "BTC/USD") - used to look up price ID
   * @param priceUsd - The price in USD (e.g., 91000 for $91,000)
   */
  const updatePriceCache = async (asset: string, priceUsd: number) => {
    // Get the price ID for this asset from config
    const priceId = config.priceFeedIds[asset as keyof typeof config.priceFeedIds];
    if (!priceId) {
      console.error('No price ID configured for asset:', asset);
      return;
    }

    // Convert to 18 decimals using BigInt to avoid floating point precision issues
    // First convert price to integer (multiply by 100 for cents precision)
    const priceInCents = BigInt(Math.round(priceUsd * 100));
    // Then multiply by 10^16 to get 18 decimals (10^18 / 100 = 10^16)
    const price18Dec = priceInCents * BigInt(10 ** 16);

    // Sanity check: price must be between $100 and $1M (contract enforces this)
    const minPrice = BigInt(100) * BigInt(10 ** 18);
    const maxPrice = BigInt(1_000_000) * BigInt(10 ** 18);

    if (price18Dec < minPrice || price18Dec > maxPrice) {
      console.error('Price out of range:', priceUsd, 'Must be between $100 and $1,000,000');
      return;
    }

    console.log('=== PRICE UPDATE DEBUG ===');
    console.log('Asset:', asset);
    console.log('Price ID:', priceId);
    console.log('Price USD:', priceUsd);
    console.log('Price in cents:', priceInCents.toString());
    console.log('Price 18 decimals:', price18Dec.toString());
    console.log('Price Adapter:', config.contracts.priceAdapter);
    console.log('Function: submitPriceById (PUBLIC - uses bytes32 price ID directly)');
    console.log('==========================');

    // Use submitPriceById - uses the bytes32 price ID directly
    // This bypasses the asset name lookup which might not be registered
    writeContract({
      address: config.contracts.priceAdapter as `0x${string}`,
      abi: PythPriceAdapterABI,
      functionName: 'submitPriceById',
      args: [priceId as `0x${string}`, price18Dec],
      gas: BigInt(500000), // Higher gas for Stylus contracts
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
