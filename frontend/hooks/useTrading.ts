'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { OutcomeMarketABI } from '@/lib/abis/OutcomeMarket';

// Helper to extract error message
function getErrorMessage(error: any): string {
  if (!error) return 'Unknown error';
  
  // Log full error for debugging
  console.error('Transaction error:', error);
  
  // Check for user rejection
  if (error.message?.includes('User rejected') || error.message?.includes('user rejected') || error.code === 4001) {
    return 'Transaction rejected by user';
  }
  
  // Check for insufficient funds
  if (error.message?.includes('insufficient funds') || error.message?.includes('Insufficient funds')) {
    return 'Insufficient funds for transaction';
  }
  
  // Check for gas estimation errors
  if (error.message?.includes('gas') || error.message?.includes('Gas')) {
    return 'Gas estimation failed. Please try again.';
  }
  
  // Check for contract revert reasons
  if (error.data?.message) {
    return error.data.message;
  }
  
  if (error.reason) {
    return error.reason;
  }
  
  if (error.shortMessage) {
    return error.shortMessage;
  }
  
  if (error.message) {
    // Try to extract revert reason from error message
    const revertMatch = error.message.match(/revert\s+(.+)/i) || 
                       error.message.match(/execution reverted:\s*(.+)/i) ||
                       error.message.match(/reverted with reason string\s+(.+)/i);
    if (revertMatch) {
      return revertMatch[1].trim();
    }
    return error.message;
  }
  
  // Check error object structure
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Unknown error. Check console for details.';
}

export function useOpenPosition() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isReceiptError, error: receiptError } = useWaitForTransactionReceipt({
    hash,
    query: {
      retry: 3,
      retryDelay: 2000,
    },
  });

  const openPosition = (
    marketAddress: string,
    direction: 0 | 1, // 0 = LONG, 1 = SHORT
    collateralUSD: bigint,
    leverage: bigint
  ) => {
    console.log('=== OPEN POSITION DEBUG ===');
    console.log('Market:', marketAddress);
    console.log('Direction:', direction);
    console.log('Collateral (18 dec):', collateralUSD.toString());
    console.log('Leverage:', leverage.toString());
    console.log('===========================');

    writeContract({
      address: marketAddress as `0x${string}`,
      abi: OutcomeMarketABI,
      functionName: 'openPosition',
      args: [direction, collateralUSD, leverage],
      gas: BigInt(3000000), // Even higher gas for Stylus contracts
    });
  };

  const errorMessage = error ? getErrorMessage(error) : (receiptError ? getErrorMessage(receiptError) : null);

  return {
    openPosition,
    isPending: isPending || isConfirming,
    isSuccess,
    isError: error || isReceiptError,
    hash,
    error: error || receiptError,
    errorMessage,
  };
}

export function useClosePosition() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const closePosition = (marketAddress: string, positionId: bigint) => {
    writeContract({
      address: marketAddress as `0x${string}`,
      abi: OutcomeMarketABI,
      functionName: 'closePosition',
      args: [positionId],
    });
  };

  return {
    closePosition,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}
