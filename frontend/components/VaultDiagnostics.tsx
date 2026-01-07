'use client'

import { useAccount, usePublicClient, useReadContract } from 'wagmi';
import { config } from '@/lib/config';
import { CollateralVaultABI } from '@/lib/abis/CollateralVault';
import { ERC20ABI } from '@/lib/abis/ERC20';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useState } from 'react';

export function VaultDiagnostics() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Check if USDC is supported
  const { data: usdcSupported, isLoading: loadingSupported } = useReadContract({
    address: config.contracts.vault as `0x${string}`,
    abi: CollateralVaultABI,
    functionName: 'isSupportedCollateral',
    args: [config.contracts.usdc as `0x${string}`],
  });

  const runFullDiagnostics = async () => {
    if (!publicClient || !address) {
      alert('Please connect your wallet');
      return;
    }

    setIsChecking(true);
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      vault: config.contracts.vault,
      usdc: config.contracts.usdc,
      user: address,
    };

    try {
      // 1. Check if vault contract exists (try to read a view function)
      try {
        const isSupported = await publicClient.readContract({
          address: config.contracts.vault as `0x${string}`,
          abi: CollateralVaultABI,
          functionName: 'isSupportedCollateral',
          args: [config.contracts.usdc as `0x${string}`],
        });
        diagnostics.vaultExists = true;
        diagnostics.usdcSupported = isSupported;
        console.log('✓ Vault contract exists, USDC supported:', isSupported);
      } catch (err: any) {
        diagnostics.vaultExists = false;
        diagnostics.vaultError = {
          message: err?.message,
          code: err?.code,
          shortMessage: err?.shortMessage,
        };
        console.error('✗ Vault contract check failed:', err);
      }

      // 2. Check if USDC contract exists
      try {
        const decimals = await publicClient.readContract({
          address: config.contracts.usdc as `0x${string}`,
          abi: ERC20ABI,
          functionName: 'decimals',
        });
        diagnostics.usdcExists = true;
        diagnostics.usdcDecimals = Number(decimals);
        console.log('✓ USDC contract exists, decimals:', decimals);
      } catch (err: any) {
        diagnostics.usdcExists = false;
        diagnostics.usdcError = {
          message: err?.message,
          code: err?.code,
          shortMessage: err?.shortMessage,
        };
        console.error('✗ USDC contract check failed:', err);
      }

      // 3. Check user's USDC balance
      if (diagnostics.usdcExists) {
        try {
          const balance = await publicClient.readContract({
            address: config.contracts.usdc as `0x${string}`,
            abi: ERC20ABI,
            functionName: 'balanceOf',
            args: [address as `0x${string}`],
          });
          diagnostics.userBalance = balance.toString();
          diagnostics.userBalanceFormatted = (Number(balance) / 1e6).toFixed(6) + ' USDC';
          console.log('✓ User balance:', diagnostics.userBalanceFormatted);
        } catch (err: any) {
          diagnostics.balanceError = {
            message: err?.message,
            code: err?.code,
          };
          console.error('✗ Balance check failed:', err);
        }
      }

      // 4. Check user's allowance
      if (diagnostics.usdcExists) {
        try {
          const allowance = await publicClient.readContract({
            address: config.contracts.usdc as `0x${string}`,
            abi: ERC20ABI,
            functionName: 'allowance',
            args: [address as `0x${string}`, config.contracts.vault as `0x${string}`],
          });
          diagnostics.userAllowance = allowance.toString();
          diagnostics.userAllowanceFormatted = (Number(allowance) / 1e6).toFixed(6) + ' USDC';
          console.log('✓ User allowance:', diagnostics.userAllowanceFormatted);
        } catch (err: any) {
          diagnostics.allowanceError = {
            message: err?.message,
            code: err?.code,
          };
          console.error('✗ Allowance check failed:', err);
        }
      }

      // 5. Check user's collateral in vault
      if (diagnostics.vaultExists) {
        try {
          const collateral = await publicClient.readContract({
            address: config.contracts.vault as `0x${string}`,
            abi: CollateralVaultABI,
            functionName: 'getCollateralBalance',
            args: [address as `0x${string}`, config.contracts.usdc as `0x${string}`],
          });
          diagnostics.userCollateral = collateral.toString();
          diagnostics.userCollateralFormatted = (Number(collateral) / 1e6).toFixed(6) + ' USDC';
          console.log('✓ User collateral in vault:', diagnostics.userCollateralFormatted);
        } catch (err: any) {
          diagnostics.collateralError = {
            message: err?.message,
            code: err?.code,
            shortMessage: err?.shortMessage,
          };
          console.error('✗ Collateral check failed:', err);
        }
      }

      // 6. Try to simulate a deposit call (gas estimation)
      if (diagnostics.vaultExists && diagnostics.usdcExists && address) {
        try {
          const testAmount = BigInt(1000000); // 1 USDC
          const { encodeFunctionData } = await import('viem');
          const data = encodeFunctionData({
            abi: CollateralVaultABI,
            functionName: 'deposit',
            args: [config.contracts.usdc as `0x${string}`, testAmount],
          });
          
          const gasEstimate = await publicClient.estimateGas({
            account: address as `0x${string}`,
            to: config.contracts.vault as `0x${string}`,
            data: data as `0x${string}`,
          });
          diagnostics.gasEstimateSuccess = true;
          diagnostics.gasEstimate = gasEstimate.toString();
          console.log('✓ Gas estimate successful:', gasEstimate.toString());
        } catch (err: any) {
          diagnostics.gasEstimateSuccess = false;
          diagnostics.gasEstimateError = {
            message: err?.message,
            shortMessage: err?.shortMessage,
            code: err?.code,
            data: err?.data,
          };
          console.error('✗ Gas estimate failed:', err);
        }

        // 7. Try to simulate the deposit call to see actual revert reason
        try {
          const testAmount = BigInt(1000000); // 1 USDC
          const { simulateContract, encodeFunctionData } = await import('viem');
          const result = await publicClient.simulateContract({
            account: address as `0x${string}`,
            address: config.contracts.vault as `0x${string}`,
            abi: CollateralVaultABI,
            functionName: 'deposit',
            args: [config.contracts.usdc as `0x${string}`, testAmount],
          });
          diagnostics.simulationSuccess = true;
          diagnostics.simulationResult = 'Call would succeed';
          diagnostics.simulationGas = result.request.gas?.toString();
          
          // Encode the transaction data to see what would be sent
          const encodedData = encodeFunctionData({
            abi: CollateralVaultABI,
            functionName: 'deposit',
            args: [config.contracts.usdc as `0x${string}`, testAmount],
          });
          diagnostics.encodedTransactionData = encodedData;
          
          console.log('✓ Simulation successful, gas:', result.request.gas?.toString());
          console.log('✓ Encoded transaction data:', encodedData);
        } catch (simErr: any) {
          diagnostics.simulationSuccess = false;
          diagnostics.simulationError = {
            message: simErr?.message,
            shortMessage: simErr?.shortMessage,
            code: simErr?.code,
            data: simErr?.data,
            cause: simErr?.cause,
          };
          console.error('✗ Simulation failed:', simErr);
          
          // Try to decode the error
          if (simErr?.data) {
            try {
              const { decodeErrorResult } = await import('viem');
              const decoded = decodeErrorResult({
                abi: CollateralVaultABI,
                data: simErr.data as `0x${string}`,
              });
              diagnostics.simulationDecodedError = decoded;
              console.log('✓ Decoded error:', decoded);
            } catch (decodeErr) {
              console.warn('Could not decode error:', decodeErr);
            }
          }
          
          // Also try to decode from shortMessage if it contains error data
          if (simErr?.shortMessage?.includes('0x')) {
            const errorDataMatch = simErr.shortMessage.match(/0x[a-fA-F0-9]+/);
            if (errorDataMatch) {
              try {
                const { decodeErrorResult } = await import('viem');
                const decoded = decodeErrorResult({
                  abi: CollateralVaultABI,
                  data: errorDataMatch[0] as `0x${string}`,
                });
                diagnostics.simulationDecodedErrorFromMessage = decoded;
                console.log('✓ Decoded error from message:', decoded);
              } catch (decodeErr) {
                console.warn('Could not decode error from message:', decodeErr);
              }
            }
          }
        }
      }

    } catch (err: any) {
      diagnostics.generalError = {
        message: err?.message,
        code: err?.code,
      };
      console.error('✗ Diagnostics failed:', err);
    }

    setResults(diagnostics);
    setIsChecking(false);
    console.log('=== FULL DIAGNOSTICS RESULTS ===');
    console.log(JSON.stringify(diagnostics, null, 2));
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Vault Diagnostics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">USDC Supported (live check):</span>
            {loadingSupported ? (
              <span className="text-sm">Loading...</span>
            ) : (
              <span className={`text-sm font-semibold ${usdcSupported ? 'text-success' : 'text-error'}`}>
                {usdcSupported ? '✓ Yes' : '✗ No'}
              </span>
            )}
          </div>
          
          <button
            onClick={runFullDiagnostics}
            disabled={isChecking || !address}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
          </button>
        </div>

        {results && (
          <div className="mt-4 p-4 bg-secondary rounded-md space-y-3">
            <h3 className="font-semibold text-sm">Diagnostics Results:</h3>
            <pre className="text-xs overflow-auto max-h-96 bg-black/20 p-2 rounded">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

