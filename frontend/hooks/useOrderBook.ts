'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { config } from '@/lib/config';
import { OrderBookABI } from '@/lib/abis/OrderBook';

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export interface Order {
  id: bigint;
  user: string;
  orderType: number; // 0 = LIMIT, 1 = STOP_LOSS, 2 = TAKE_PROFIT
  direction: number; // 0 = LONG, 1 = SHORT
  price: bigint;
  size: bigint;
  collateral: bigint;
  leverage: bigint;
  status: number; // 0 = PENDING, 1 = FILLED, 2 = CANCELLED
  createdAt: bigint;
  expiresAt: bigint;
}

export function useUserOrders() {
  const { address } = useAccount();
  const orderBookEnabled = (config.contracts.orderBook as string) !== ZERO_ADDRESS;

  const { data: orderIds, refetch, isLoading } = useReadContract({
    address: config.contracts.orderBook as `0x${string}`,
    abi: OrderBookABI,
    functionName: 'getUserOrders',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && orderBookEnabled,
      refetchInterval: 30000
    },
  });

  return { orderIds: orderIds || [], refetch, isLoading };
}

export function useOrder(orderId: bigint | undefined) {
  const orderBookEnabled = (config.contracts.orderBook as string) !== ZERO_ADDRESS;

  const { data: order, isLoading } = useReadContract({
    address: config.contracts.orderBook as `0x${string}`,
    abi: OrderBookABI,
    functionName: 'getOrder',
    args: orderId ? [orderId] : undefined,
    query: {
      enabled: !!orderId && orderBookEnabled
    },
  });

  return { order: order as Order | undefined, isLoading };
}

export function usePlaceLimitOrder() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const placeLimitOrder = (
    direction: 0 | 1,
    price: bigint,
    size: bigint,
    collateral: bigint,
    leverage: bigint
  ) => {
    writeContract({
      address: config.contracts.orderBook as `0x${string}`,
      abi: OrderBookABI,
      functionName: 'placeLimitOrder',
      args: [direction, price, size, collateral, leverage],
    });
  };

  return { placeLimitOrder, isPending: isPending || isConfirming, isSuccess, hash, error };
}

export function usePlaceStopLoss() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const placeStopLoss = (positionId: bigint, stopPrice: bigint) => {
    writeContract({
      address: config.contracts.orderBook as `0x${string}`,
      abi: OrderBookABI,
      functionName: 'placeStopLoss',
      args: [positionId, stopPrice],
    });
  };

  return { placeStopLoss, isPending: isPending || isConfirming, isSuccess, hash, error };
}

export function usePlaceTakeProfit() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const placeTakeProfit = (positionId: bigint, targetPrice: bigint) => {
    writeContract({
      address: config.contracts.orderBook as `0x${string}`,
      abi: OrderBookABI,
      functionName: 'placeTakeProfit',
      args: [positionId, targetPrice],
    });
  };

  return { placeTakeProfit, isPending: isPending || isConfirming, isSuccess, hash, error };
}

export function useCancelOrder() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const cancelOrder = (orderId: bigint) => {
    writeContract({
      address: config.contracts.orderBook as `0x${string}`,
      abi: OrderBookABI,
      functionName: 'cancelOrder',
      args: [orderId],
    });
  };

  return { cancelOrder, isPending: isPending || isConfirming, isSuccess, hash, error };
}
