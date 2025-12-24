'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { config } from '@/lib/config';
import { CollateralVaultABI } from '@/lib/abis/CollateralVault';
import { ERC20ABI } from '@/lib/abis/ERC20';

export function useVaultBalance() {
  const { address } = useAccount();

  const { data: availableCollateral, refetch: refetchAvailable } = useReadContract({
    address: config.contracts.vault as `0x${string}`,
    abi: CollateralVaultABI,
    functionName: 'getAvailableCollateralUSD',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: totalCollateral, refetch: refetchTotal } = useReadContract({
    address: config.contracts.vault as `0x${string}`,
    abi: CollateralVaultABI,
    functionName: 'getCollateralValueUSD',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: lockedCollateral, refetch: refetchLocked } = useReadContract({
    address: config.contracts.vault as `0x${string}`,
    abi: CollateralVaultABI,
    functionName: 'lockedCollateral',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    availableCollateral: availableCollateral ? Number(availableCollateral) / 1e18 : 0,
    totalCollateral: totalCollateral ? Number(totalCollateral) / 1e18 : 0,
    lockedCollateral: lockedCollateral ? Number(lockedCollateral) / 1e18 : 0,
    refetch: () => {
      refetchAvailable();
      refetchTotal();
      refetchLocked();
    },
  };
}

export function useTokenBalance(tokenAddress: string) {
  const { address } = useAccount();

  const { data: balance, refetch } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: address ? [address, config.contracts.vault] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: balance ? Number(balance) / 1e6 : 0, // Assuming 6 decimals for USDC
    allowance: allowance ? Number(allowance) / 1e6 : 0,
    refetch: () => {
      refetch();
      refetchAllowance();
    },
  };
}

export function useApproveToken() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = (tokenAddress: string, amount: bigint) => {
    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [config.contracts.vault, amount],
    });
  };

  return {
    approve,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}

export function useDepositCollateral() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const deposit = (tokenAddress: string, amount: bigint) => {
    writeContract({
      address: config.contracts.vault as `0x${string}`,
      abi: CollateralVaultABI,
      functionName: 'deposit',
      args: [tokenAddress, amount],
    });
  };

  return {
    deposit,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}

export function useWithdrawCollateral() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const withdraw = (tokenAddress: string, amount: bigint) => {
    writeContract({
      address: config.contracts.vault as `0x${string}`,
      abi: CollateralVaultABI,
      functionName: 'withdraw',
      args: [tokenAddress, amount],
    });
  };

  return {
    withdraw,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}
