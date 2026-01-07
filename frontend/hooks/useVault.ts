'use client'

import { useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useWalletClient } from 'wagmi';
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

  // Check if token is supported by vault
  const { data: isSupported, refetch: refetchIsSupported } = useReadContract({
    address: config.contracts.vault as `0x${string}`,
    abi: CollateralVaultABI,
    functionName: 'isSupportedCollateral',
    args: [tokenAddress as `0x${string}`],
    query: {
      enabled: !!tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000',
    },
  });

  return {
    balance: balance ? Number(balance) / 1e6 : 0, // Assuming 6 decimals for USDC
    allowance: allowance ? Number(allowance) / 1e6 : 0,
    isSupported: isSupported ?? false,
    refetch: () => {
      refetch();
      refetchAllowance();
      refetchIsSupported();
    },
  };
}

export function useApproveToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Log transaction status changes
  useEffect(() => {
    if (hash) {
      console.log('✓ Approval transaction hash received:', hash);
      console.log('  View on Arbiscan: https://sepolia.arbiscan.io/tx/' + hash);
    }
  }, [hash]);

  useEffect(() => {
    if (isPending && !hash) {
      console.log('⏳ Approval transaction pending - waiting for user to approve in wallet...');
    }
  }, [isPending, hash]);

  useEffect(() => {
    if (isConfirming) {
      console.log('⏳ Waiting for approval transaction confirmation on-chain...');
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isSuccess) {
      console.log('✅ Approval transaction confirmed successfully!');
      console.log('  Allowance should now be updated. You can proceed with deposit.');
    }
  }, [isSuccess]);

  const approve = async (tokenAddress: string, amount: bigint) => {
    try {
      console.log('Approving token:', {
        token: tokenAddress,
        amount: amount.toString(),
        spender: config.contracts.vault,
        amountFormatted: (Number(amount) / 1e6).toFixed(6) + ' USDC',
        network: 'Arbitrum Sepolia'
      });

      // Validate inputs
      if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('Invalid token address');
      }
      if (amount <= 0n) {
        throw new Error('Approval amount must be greater than 0');
      }

      // Try to verify contract exists by reading a simple function first
      // This will help catch "contract doesn't exist" errors early
      if (publicClient) {
        try {
          // Try to read decimals to verify contract exists
          const decimals = await publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20ABI,
            functionName: 'decimals',
          });
          console.log('✓ Contract verified - exists and is readable, decimals:', decimals);
          
          // Also try to estimate gas to see if approve will work (if we have an address)
          if (address) {
            try {
              const { encodeFunctionData } = await import('viem');
              const data = encodeFunctionData({
                abi: ERC20ABI,
                functionName: 'approve',
                args: [config.contracts.vault as `0x${string}`, amount],
              });
              const gasEstimate = await publicClient.estimateGas({
                account: address as `0x${string}`,
                to: tokenAddress as `0x${string}`,
                data: data as `0x${string}`,
              });
              console.log('✓ Gas estimate successful:', gasEstimate.toString());
            } catch (gasErr: any) {
              console.warn('⚠ Gas estimation warning (transaction might still work):', gasErr?.message);
              // Don't throw - might still work
            }
          }
        } catch (verifyErr: any) {
          console.error('✗ Contract verification failed:', {
            message: verifyErr?.message,
            code: verifyErr?.code,
            shortMessage: verifyErr?.shortMessage,
          });
          
          // If contract doesn't exist, throw a helpful error
          if (verifyErr?.code === 'CALL_EXCEPTION' || verifyErr?.message?.includes('contract')) {
            throw new Error(
              `Contract not found or not accessible at ${tokenAddress}. ` +
              `Please verify this is the correct USDC address for Arbitrum Sepolia. ` +
              `Check on Arbiscan: https://sepolia.arbiscan.io/address/${tokenAddress}`
            );
          }
          // For other errors, just warn and continue
          console.warn('⚠ Continuing despite verification warning...');
        }
      } else {
        console.warn('⚠ Public client not available - skipping contract verification');
      }

      console.log('Attempting to write approve transaction...');
      console.log('  This will open MetaMask - please approve the transaction there.');
      
      // Let wagmi handle gas estimation automatically
      // Note: writeContract doesn't return a promise - it triggers the write
      // and the hash will be available via the hook state after user approves in wallet
      try {
      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [config.contracts.vault as `0x${string}`, amount],
      });
        console.log('✓ writeContract called successfully');
        console.log('  → MetaMask should open now');
        console.log('  → After you approve, the transaction hash will appear');
        console.log('  → Then we wait for on-chain confirmation');
      } catch (writeErr: any) {
        console.error('✗ writeContract failed:', writeErr);
        throw writeErr;
      }
    } catch (err: any) {
      console.error('Approve function error:', {
        error: err,
        message: err?.message,
        code: err?.code,
        data: err?.data,
        shortMessage: err?.shortMessage,
        cause: err?.cause,
      });
      
      // Provide more specific error messages for RPC errors
      if (err?.message?.includes('Internal JSON-RPC error') || 
          err?.shortMessage?.includes('Internal JSON-RPC error') ||
          err?.code === -32603 ||
          (err?.cause as any)?.code === -32603) {
        const specificError = new Error(
          'MetaMask RPC Error (-32603): The RPC endpoint rejected the transaction.\n\n' +
          'This usually means:\n' +
          '• The contract may not exist at this address\n' +
          '• The RPC endpoint is experiencing issues\n' +
          '• Network connectivity problems\n\n' +
          `Verify the contract exists: https://sepolia.arbiscan.io/address/${tokenAddress}\n\n` +
          'Try these solutions:\n' +
          '1. Refresh the page and try again\n' +
          '2. Check you\'re connected to Arbitrum Sepolia (chain ID 421614)\n' +
          '3. Ensure you have ETH for gas fees\n' +
          '4. Wait a few moments and retry (network may be congested)\n' +
          '5. Try disconnecting and reconnecting your wallet'
        );
        throw specificError;
      }
      
      // Re-throw to let wagmi handle it
      throw err;
    }
  };

  // Log errors with more detail
  useEffect(() => {
  if (error) {
    const errorDetails: any = {
      message: error.message,
      name: error.name,
      cause: error.cause,
    };

    // Extract more details from viem errors
    if ((error as any).shortMessage) {
      errorDetails.shortMessage = (error as any).shortMessage;
    }
    if ((error as any).data) {
      errorDetails.data = (error as any).data;
    }
    if ((error as any).code) {
      errorDetails.code = (error as any).code;
    }
    if ((error as any).reason) {
      errorDetails.reason = (error as any).reason;
    }

      console.error('✗ Approve error details:', errorDetails);

    // Provide user-friendly error messages
    if (error.message?.includes('Internal JSON-RPC error')) {
      console.error('Possible causes:');
      console.error('1. Contract might not exist at this address');
      console.error('2. Contract might be paused or have restrictions');
      console.error('3. RPC endpoint might be having issues');
      console.error('4. Insufficient gas or network issues');
      console.error('5. Try switching RPC endpoints or checking contract on block explorer');
    }
  }
  }, [error]);

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
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const { isLoading: isConfirming, isSuccess, isError: isReceiptError, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  // Log transaction status changes
  useEffect(() => {
    if (hash) {
      console.log('✓ Deposit transaction hash received:', hash);
      console.log('  View on Arbiscan: https://sepolia.arbiscan.io/tx/' + hash);
    }
  }, [hash]);

  useEffect(() => {
    if (isPending && !hash) {
      console.log('⏳ Deposit transaction pending - waiting for user to approve in wallet...');
    }
  }, [isPending, hash]);

  useEffect(() => {
    if (isConfirming) {
      console.log('⏳ Waiting for deposit transaction confirmation on-chain...');
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isSuccess) {
      console.log('✅ Deposit transaction confirmed successfully!');
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isReceiptError && receiptError) {
      console.error('✗ Transaction receipt error:', {
        message: receiptError.message,
        name: receiptError.name,
        cause: receiptError.cause,
        shortMessage: (receiptError as any).shortMessage,
        code: (receiptError as any).code,
        data: (receiptError as any).data,
      });
    }
  }, [isReceiptError, receiptError]);

  // Log errors with full details
  useEffect(() => {
    if (error) {
      const errorDetails: any = {
        message: error.message,
        name: error.name,
        cause: error.cause,
        shortMessage: (error as any).shortMessage,
        code: (error as any).code,
        data: (error as any).data,
        reason: (error as any).reason,
        details: (error as any).details,
      };

      // Try to decode the error if it has data
      if (errorDetails.data) {
        try {
          const { decodeErrorResult } = require('viem');
          try {
            const decoded = decodeErrorResult({
              abi: CollateralVaultABI,
              data: errorDetails.data as `0x${string}`,
            });
            errorDetails.decodedError = decoded;
            console.log('✓ Decoded contract error:', decoded);
          } catch (decodeErr) {
            // Not a contract error, might be RPC error
            console.warn('Could not decode as contract error:', decodeErr);
          }
        } catch (importErr) {
          console.warn('Could not import decodeErrorResult');
        }
      }

      console.error('✗ Deposit error (full details):', errorDetails);
      
      // Check for specific error patterns
      if (errorDetails.shortMessage?.includes('revert')) {
        console.error('  → This is a contract revert. Check:');
        console.error('    1. Token is supported (✓ verified)');
        console.error('    2. User has sufficient balance (✓ verified)');
        console.error('    3. User has sufficient allowance (✓ verified)');
        console.error('    4. transferFrom call might be failing');
      }
      
      if (errorDetails.code === -32603 || errorDetails.message?.includes('Internal JSON-RPC error')) {
        console.error('  → This is an RPC error. Possible causes:');
        console.error('    1. RPC endpoint issue');
        console.error('    2. Transaction rejected by network');
        console.error('    3. Contract execution failed (check decoded error above)');
      }
    }
  }, [error]);

  const deposit = async (tokenAddress: string, amount: bigint) => {
    try {
      console.log('Attempting deposit:', {
        token: tokenAddress,
        amount: amount.toString(),
        amountFormatted: (Number(amount) / 1e6).toFixed(6) + ' USDC',
        vault: config.contracts.vault,
        network: 'Arbitrum Sepolia'
      });

      // Validate inputs
      if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('Invalid token address');
      }
      if (amount <= 0n) {
        throw new Error('Deposit amount must be greater than 0');
      }

      // Verify vault contract exists
      if (publicClient) {
        try {
          // Try to read a simple function to verify contract exists
          try {
            const isSupported = await publicClient.readContract({
              address: config.contracts.vault as `0x${string}`,
              abi: CollateralVaultABI,
              functionName: 'isSupportedCollateral',
              args: [tokenAddress as `0x${string}`],
            });
            console.log('✓ Vault contract verified, token supported:', isSupported);
            
            if (!isSupported) {
              throw new Error(
                `Token ${tokenAddress} (USDC) is not supported as collateral by the vault.\n\n` +
                `The vault owner needs to call addSupportedToken() to add USDC as a supported collateral token.\n\n` +
                `Vault address: ${config.contracts.vault}\n` +
                `Check on Arbiscan: https://sepolia.arbiscan.io/address/${config.contracts.vault}`
              );
            }
          } catch (readErr: any) {
            console.error('✗ Failed to check if token is supported:', readErr);
            // If we can't read, the contract might not exist or have issues
            if (readErr?.code === 'CALL_EXCEPTION') {
              throw new Error(
                `Cannot verify vault contract. It may not exist or may not be initialized.\n\n` +
                `Vault address: ${config.contracts.vault}\n` +
                `Check on Arbiscan: https://sepolia.arbiscan.io/address/${config.contracts.vault}`
              );
            }
            // Re-throw if it's our custom error
            if (readErr?.message?.includes('not supported')) {
              throw readErr;
            }
            // Otherwise, warn but continue
            console.warn('⚠ Could not verify token support, proceeding anyway...');
          }

          // Check user's token balance and allowance before deposit
          if (address) {
            try {
              // Check balance
              const balance = await publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20ABI,
                functionName: 'balanceOf',
                args: [address as `0x${string}`],
              });
              console.log('✓ User balance:', balance.toString(), '(', (Number(balance) / 1e6).toFixed(6), 'USDC)');
              
              if (balance < amount) {
                throw new Error(
                  `Insufficient balance. You have ${(Number(balance) / 1e6).toFixed(6)} USDC but trying to deposit ${(Number(amount) / 1e6).toFixed(6)} USDC.`
                );
              }

              // Check allowance
              const allowance = await publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20ABI,
                functionName: 'allowance',
                args: [address as `0x${string}`, config.contracts.vault as `0x${string}`],
              });
              console.log('✓ User allowance:', allowance.toString(), '(', (Number(allowance) / 1e6).toFixed(6), 'USDC)');
              
              if (allowance < amount) {
                throw new Error(
                  `Insufficient allowance. You have approved ${(Number(allowance) / 1e6).toFixed(6)} USDC but trying to deposit ${(Number(amount) / 1e6).toFixed(6)} USDC. Please approve more.`
                );
              }
            } catch (checkErr: any) {
              // If it's our custom error, throw it
              if (checkErr?.message?.includes('Insufficient')) {
                throw checkErr;
              }
              console.warn('⚠ Could not verify balance/allowance:', checkErr?.message);
              // Continue anyway - the transaction will fail if there's an issue
            }
          }

          // Estimate gas
          if (address) {
            try {
              const { encodeFunctionData } = await import('viem');
              const data = encodeFunctionData({
                abi: CollateralVaultABI,
                functionName: 'deposit',
                args: [tokenAddress as `0x${string}`, amount],
              });
              const gasEstimate = await publicClient.estimateGas({
                account: address as `0x${string}`,
                to: config.contracts.vault as `0x${string}`,
                data: data as `0x${string}`,
              });
              console.log('✓ Gas estimate successful:', gasEstimate.toString());
            } catch (gasErr: any) {
              console.error('✗ Gas estimation failed:', {
                message: gasErr?.message,
                shortMessage: gasErr?.shortMessage,
                code: gasErr?.code,
                data: gasErr?.data,
              });
              
              // Check if it's a revert reason
              if (gasErr?.shortMessage?.includes('revert') || gasErr?.message?.includes('revert')) {
                let revertReason = gasErr?.shortMessage || gasErr?.message || 'Unknown revert reason';
                
                // Try to extract more specific error messages
                if (revertReason.includes('InvalidToken')) {
                  revertReason = 'Token is not supported as collateral. The vault owner needs to add this token.';
                } else if (revertReason.includes('InvalidAmount')) {
                  revertReason = 'Invalid amount. Check that you have sufficient balance and allowance.';
                } else if (revertReason.includes('Internal JSON-RPC error')) {
                  revertReason = 'Contract reverted (likely token not supported or insufficient allowance). Check the vault contract state.';
                }
                
                throw new Error(
                  `Transaction would revert: ${revertReason}\n\n` +
                  `Common causes:\n` +
                  `• Token not added as supported collateral in vault\n` +
                  `• Insufficient allowance (check you approved enough)\n` +
                  `• Insufficient balance\n` +
                  `• Vault contract not initialized\n\n` +
                  `Vault: ${config.contracts.vault}\n` +
                  `Token: ${tokenAddress}`
                );
              }
              
              // For other gas estimation errors, still throw to prevent bad transactions
              throw new Error(
                `Gas estimation failed: ${gasErr?.shortMessage || gasErr?.message || 'Unknown error'}\n\n` +
                `This usually means the transaction would fail. Check:\n` +
                `• Token is supported by vault\n` +
                `• You have sufficient allowance\n` +
                `• You have sufficient balance\n` +
                `• Vault contract is properly initialized`
              );
            }
          }
        } catch (verifyErr: any) {
          console.error('✗ Vault verification failed:', {
            message: verifyErr?.message,
            code: verifyErr?.code,
            shortMessage: verifyErr?.shortMessage,
          });
          
          if (verifyErr?.code === 'CALL_EXCEPTION' || verifyErr?.message?.includes('contract')) {
            throw new Error(
              `Vault contract not found or not accessible at ${config.contracts.vault}. ` +
              `Check on Arbiscan: https://sepolia.arbiscan.io/address/${config.contracts.vault}`
            );
          }
          // Re-throw if it's our custom error
          if (verifyErr?.message?.includes('not supported') || verifyErr?.message?.includes('revert')) {
            throw verifyErr;
          }
          console.warn('⚠ Continuing despite verification warning...');
        }
      } else {
        console.warn('⚠ Public client not available - skipping contract verification');
      }

      console.log('Attempting to write deposit transaction...');
      console.log('  This will open MetaMask - please approve the transaction there.');
      
      // First, simulate the contract call to get the exact parameters
      let simulation: any = null;
      if (publicClient && address) {
        try {
          const { simulateContract } = await import('viem');
          simulation = await publicClient.simulateContract({
            account: address as `0x${string}`,
            address: config.contracts.vault as `0x${string}`,
            abi: CollateralVaultABI,
            functionName: 'deposit',
            args: [tokenAddress as `0x${string}`, amount],
          });
          console.log('✓ Pre-flight simulation successful');
          console.log('  Gas estimate:', simulation.request.gas?.toString());
          // Log request details without BigInt serialization issues
          console.log('  Request details:', {
            to: simulation.request.to,
            account: simulation.request.account,
            gas: simulation.request.gas?.toString(),
            value: simulation.request.value?.toString(),
            data: simulation.request.data,
          });
        } catch (simErr: any) {
          console.error('✗ Pre-flight simulation failed:', simErr);
          // If simulation fails, the transaction will definitely fail
          throw new Error(
            `Transaction simulation failed: ${simErr?.shortMessage || simErr?.message}\n\n` +
            `This means the transaction would revert. Check the error above for details.`
          );
        }
      }
      
      try {
        // Encode the function call to see what data will be sent
        if (publicClient) {
          try {
            const { encodeFunctionData } = await import('viem');
            const encodedData = encodeFunctionData({
              abi: CollateralVaultABI,
              functionName: 'deposit',
              args: [tokenAddress as `0x${string}`, amount],
            });
            console.log('  Encoded calldata:', encodedData);
            console.log('  This is what will be sent to the contract');
          } catch (encodeErr) {
            console.warn('Could not encode function data:', encodeErr);
          }
        }
        
        // Call writeContract - wagmi will handle gas estimation automatically
        console.log('Calling writeContract with parameters:');
        console.log('  address:', config.contracts.vault);
        console.log('  functionName: deposit');
        console.log('  args:', [tokenAddress, amount.toString()]);
        console.log('  amount (BigInt):', amount.toString());
        
        writeContract({
          address: config.contracts.vault as `0x${string}`,
          abi: CollateralVaultABI,
          functionName: 'deposit',
          args: [tokenAddress as `0x${string}`, amount],
        });
        
        console.log('✓ writeContract called successfully');
        console.log('  → MetaMask should open now');
        console.log('  → If MetaMask shows "Internal JSON-RPC error", this is likely:');
        console.log('    1. RPC endpoint issue (try refreshing or switching networks)');
        console.log('    2. MetaMask network configuration issue');
        console.log('    3. Transaction encoding issue');
        console.log('  → The simulation succeeded, so the contract call is valid');
        console.log('  → Check MetaMask console (F12 > Console) for more details');
      } catch (writeErr: any) {
        console.error('✗ writeContract failed:', writeErr);
        throw writeErr;
      }
    } catch (err: any) {
      console.error('Deposit function error:', {
        error: err,
        message: err?.message,
        code: err?.code,
        data: err?.data,
        shortMessage: err?.shortMessage,
        cause: err?.cause,
      });
      
      // Provide more specific error messages
      if (err?.message?.includes('Internal JSON-RPC error') || 
          err?.shortMessage?.includes('Internal JSON-RPC error') ||
          err?.code === -32603 ||
          (err?.cause as any)?.code === -32603) {
        const specificError = new Error(
          'MetaMask RPC Error (-32603): The RPC endpoint rejected the deposit transaction.\n\n' +
          'This usually means:\n' +
          '• The vault contract may not exist at this address\n' +
          '• The transaction would revert (check allowance, balance, or contract state)\n' +
          '• The RPC endpoint is experiencing issues\n' +
          '• Network connectivity problems\n\n' +
          `Verify the vault exists: https://sepolia.arbiscan.io/address/${config.contracts.vault}\n\n` +
          'Try these solutions:\n' +
          '1. Refresh the page and try again\n' +
          '2. Check you\'re connected to Arbitrum Sepolia (chain ID 421614)\n' +
          '3. Ensure you have ETH for gas fees\n' +
          '4. Verify your USDC allowance is sufficient\n' +
          '5. Wait a few moments and retry (network may be congested)\n' +
          '6. Try disconnecting and reconnecting your wallet'
        );
        throw specificError;
      }
      
      throw err;
    }
  };

  return {
    deposit,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
    error,
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
