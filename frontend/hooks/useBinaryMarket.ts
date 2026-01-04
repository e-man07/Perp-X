'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BinaryMarketABI } from '@/lib/abis/BinaryMarket';

export function useBinaryMarketData(marketAddress: string) {
  const { address } = useAccount();
  const isValidAddress = Boolean(marketAddress && marketAddress !== "0x0000000000000000000000000000000000000000");

  const { data: question } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: BinaryMarketABI,
    functionName: 'getQuestion',
    query: { enabled: isValidAddress },
  });

  const { data: yesPrice, refetch: refetchYesPrice } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: BinaryMarketABI,
    functionName: 'getYesPrice',
    query: { enabled: isValidAddress, refetchInterval: 5000 },
  });

  const { data: noPrice, refetch: refetchNoPrice } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: BinaryMarketABI,
    functionName: 'getNoPrice',
    query: { enabled: isValidAddress, refetchInterval: 5000 },
  });

  const { data: settled } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: BinaryMarketABI,
    functionName: 'settled',
    query: { enabled: isValidAddress },
  });

  const { data: isExpired } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: BinaryMarketABI,
    functionName: 'isExpired',
    query: { enabled: isValidAddress },
  });

  const { data: outcome } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: BinaryMarketABI,
    functionName: 'outcome',
    query: { enabled: isValidAddress && !!settled },
  });

  const { data: yesShares } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: BinaryMarketABI,
    functionName: 'getYesShares',
    args: address ? [address] : undefined,
    query: { enabled: isValidAddress && !!address },
  });

  const { data: noShares } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: BinaryMarketABI,
    functionName: 'getNoShares',
    args: address ? [address] : undefined,
    query: { enabled: isValidAddress && !!address },
  });

  return {
    question: question as string | undefined,
    yesPrice: yesPrice ? Number(yesPrice) / 1e18 : 0.5,
    noPrice: noPrice ? Number(noPrice) / 1e18 : 0.5,
    settled: settled as boolean | undefined,
    isExpired: isExpired as boolean | undefined,
    outcome: outcome as number | undefined, // 0 = NO, 1 = YES, 2 = INVALID
    yesShares: yesShares ? Number(yesShares) / 1e18 : 0,
    noShares: noShares ? Number(noShares) / 1e18 : 0,
    refetchPrices: () => {
      refetchYesPrice();
      refetchNoPrice();
    },
  };
}

export function useBuyYesShares(marketAddress: string) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const buyYes = (amount: bigint) => {
    writeContract({
      address: marketAddress as `0x${string}`,
      abi: BinaryMarketABI,
      functionName: 'buyYes',
      args: [amount],
    });
  };

  return { buyYes, isPending: isPending || isConfirming, isSuccess, hash, error };
}

export function useBuyNoShares(marketAddress: string) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const buyNo = (amount: bigint) => {
    writeContract({
      address: marketAddress as `0x${string}`,
      abi: BinaryMarketABI,
      functionName: 'buyNo',
      args: [amount],
    });
  };

  return { buyNo, isPending: isPending || isConfirming, isSuccess, hash, error };
}

export function useSellYesShares(marketAddress: string) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const sellYes = (shares: bigint) => {
    writeContract({
      address: marketAddress as `0x${string}`,
      abi: BinaryMarketABI,
      functionName: 'sellYes',
      args: [shares],
    });
  };

  return { sellYes, isPending: isPending || isConfirming, isSuccess, hash, error };
}

export function useSellNoShares(marketAddress: string) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const sellNo = (shares: bigint) => {
    writeContract({
      address: marketAddress as `0x${string}`,
      abi: BinaryMarketABI,
      functionName: 'sellNo',
      args: [shares],
    });
  };

  return { sellNo, isPending: isPending || isConfirming, isSuccess, hash, error };
}

export function useRedeemShares(marketAddress: string) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const redeemShares = () => {
    writeContract({
      address: marketAddress as `0x${string}`,
      abi: BinaryMarketABI,
      functionName: 'redeemShares',
      args: [],
    });
  };

  return { redeemShares, isPending: isPending || isConfirming, isSuccess, hash, error };
}
