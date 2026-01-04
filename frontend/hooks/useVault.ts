'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { config } from '@/lib/config';
import { CollateralVaultABI } from '@/lib/abis/CollateralVault';
import { ERC20ABI } from '@/lib/abis/ERC20';

export function useVaultBalance() {
  const { address } = useAccount();

  // Query raw USDC balance in vault (getCollateralBalance works, getCollateralValueUSD needs oracle)
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useReadContract({
    address: config.contracts.vault as `0x${string}`,
    abi: CollateralVaultABI,
    functionName: 'getCollateralBalance',
    args: address ? [address, config.contracts.usdc as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: lockedCollateralRaw, refetch: refetchLocked } = useReadContract({
    address: config.contracts.vault as `0x${string}`,
    abi: CollateralVaultABI,
    functionName: 'lockedCollateral',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // For USDC, 1 USDC = $1 (stablecoin), so raw balance / 1e6 = USD value
  const totalCollateral = usdcBalance ? Number(usdcBalance) / 1e6 : 0;
  const lockedCollateral = lockedCollateralRaw ? Number(lockedCollateralRaw) / 1e18 : 0;
  const availableCollateral = Math.max(0, totalCollateral - lockedCollateral);

  return {
    availableCollateral,
    totalCollateral,
    lockedCollateral,
    refetch: () => {
      refetchUsdcBalance();
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
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = (tokenAddress: string, amount: bigint) => {
    console.log('Approving token:', tokenAddress, 'amount:', amount.toString(), 'spender:', config.contracts.vault);
    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [config.contracts.vault as `0x${string}`, amount],
      // Add explicit gas to avoid estimation issues
      gas: BigInt(100000),
    });
  };

  // Log errors
  if (error) {
    console.error('Approve error:', error);
  }

  return {
    approve,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
    error,
  };
}

export function useFaucet() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimFaucet = () => {
    console.log('Claiming faucet from:', config.contracts.usdc);
    writeContract({
      address: config.contracts.usdc as `0x${string}`,
      abi: ERC20ABI,
      functionName: 'faucet',
      args: [],
    });
  };

  return {
    claimFaucet,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
    error,
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
      args: [tokenAddress as `0x${string}`, amount],
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
      args: [tokenAddress as `0x${string}`, amount],
    });
  };

  return {
    withdraw,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}
