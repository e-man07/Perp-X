'use client'

import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatUSD, formatNumber } from "@/lib/utils";
import { Wallet, TrendingUp, TrendingDown, Shield, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useVaultBalance, useTokenBalance, useApproveToken, useDepositCollateral, useWithdrawCollateral } from "@/hooks/useVault";
import { config } from "@/lib/config";
import { useUserPositions } from "@/hooks/usePositions";
import { useCrossMarginAccount } from "@/hooks/useCrossMargin";
import { useSupportedTokens } from "@/hooks/useSupportedTokens";
import { VaultDiagnostics } from "@/components/VaultDiagnostics";

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Get real vault data
  const { availableCollateral, totalCollateral, lockedCollateral, refetch: refetchVault } = useVaultBalance();
  const { balance: walletBalance, allowance, isSupported: isTokenSupported, refetch: refetchTokenBalance } = useTokenBalance(config.contracts.usdc);
  const { approve, isPending: isApproving, isSuccess: approveSuccess, error: approveError, hash: approveHash } = useApproveToken();
  const { deposit, isPending: isDepositing, isSuccess: isDepositSuccess, error: depositError, hash: depositHash } = useDepositCollateral();
  const { withdraw, isPending: isWithdrawing, isSuccess: isWithdrawSuccess } = useWithdrawCollateral();

  // Get cross-margin account data (includes equity which accounts for unrealized PnL)
  const { equity, marginUsed, isLoading: crossMarginLoading } = useCrossMarginAccount();

  // Get supported tokens
  const { supportedTokens, allTokens, isLoading: isLoadingSupportedTokens } = useSupportedTokens();

  // Calculate total PnL from all positions
  const { positionIds } = useUserPositions();

  // Calculate total PnL as difference between equity and deposited collateral
  // Equity = deposits + unrealized PnL, so PnL = equity - deposits
  const totalPnL = equity - totalCollateral;
  const totalPnLPercent = totalCollateral > 0 ? (totalPnL / totalCollateral) * 100 : 0;
  const isPnLPositive = totalPnL >= 0;

  // Check if current deposit amount is already approved
  const depositAmountNum = parseFloat(depositAmount || '0');
  const hasEnoughAllowance = allowance >= depositAmountNum && depositAmountNum > 0;

  // Log allowance changes for debugging
  useEffect(() => {
    console.log('Allowance check:', {
      allowance,
      depositAmountNum,
      hasEnoughAllowance,
      approveSuccess,
    });
  }, [allowance, depositAmountNum, hasEnoughAllowance, approveSuccess]);

  const handleApprove = async () => {
    if (depositAmountNum <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Check if user has enough balance
    if (walletBalance < depositAmountNum) {
      alert(`Insufficient balance. You have ${walletBalance.toFixed(6)} USDC but need ${depositAmountNum.toFixed(6)} USDC`);
      return;
    }

    try {
      // For small amounts (like 1 USDC), approve exactly what's needed
      // For larger amounts, add a small buffer (10%) for convenience
      const approvalMultiplier = depositAmountNum >= 10 ? 1.1 : 1.0; // Only add buffer for amounts >= 10 USDC
      const approvalAmount = BigInt(Math.floor(depositAmountNum * approvalMultiplier * 1e6));
      
      console.log('Attempting approval:', {
        depositAmount: depositAmountNum,
        walletBalance: walletBalance,
        approvalAmount: approvalAmount.toString(),
        approvalAmountUSDC: (Number(approvalAmount) / 1e6).toFixed(6),
        multiplier: approvalMultiplier,
        token: config.contracts.usdc,
        vault: config.contracts.vault,
      });
      await approve(config.contracts.usdc, approvalAmount);
    } catch (err: any) {
      console.error('Approval failed:', err);
      alert(`Approval failed: ${err?.message || 'Unknown error. Please check console for details.'}`);
    }
  };

  // Refetch allowance after successful approve
  useEffect(() => {
    if (approveSuccess) {
      console.log('✅ Approval successful! Refetching token balance and allowance...');
      refetchTokenBalance();
      // Small delay to ensure the refetch completes before checking allowance
      setTimeout(() => {
        refetchTokenBalance();
        console.log('✓ Token balance and allowance refetched');
      }, 1000);
    }
  }, [approveSuccess, refetchTokenBalance]);

  // Refetch balances after successful deposit
  useEffect(() => {
    if (isDepositSuccess) {
      refetchVault();
      refetchTokenBalance();
      setDepositAmount("");
    }
  }, [isDepositSuccess, refetchVault, refetchTokenBalance]);

  // Refetch balances after successful withdraw
  useEffect(() => {
    if (isWithdrawSuccess) {
      refetchVault();
      refetchTokenBalance();
      setWithdrawAmount("");
    }
  }, [isWithdrawSuccess, refetchVault, refetchTokenBalance]);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount || '0');
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (amount > walletBalance) {
      alert(`Insufficient balance. Wallet: ${walletBalance.toFixed(2)} USDC`);
      return;
    }
    if (!hasEnoughAllowance) {
      alert('Insufficient allowance. Please approve first.');
      return;
    }
    try {
      const amountBigInt = BigInt(Math.floor(amount * 1e6)); // USDC has 6 decimals
      await deposit(config.contracts.usdc, amountBigInt);
    } catch (err: any) {
      console.error('Deposit failed:', err);
      alert(`Deposit failed: ${err?.message || 'Unknown error. Please check console for details.'}`);
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount || '0');
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (amount > availableCollateral) {
      alert(`Insufficient available collateral. Available: ${availableCollateral.toFixed(2)} USDC`);
      return;
    }
    const amountBigInt = BigInt(Math.floor(amount * 1e6)); // USDC has 6 decimals
    withdraw(config.contracts.usdc, amountBigInt);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Portfolio</h1>
          <p className="text-muted-foreground">
            Manage your collateral and track your performance
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Wallet Balance</span>
              </div>
              <div className="text-2xl font-bold font-mono">
                {isConnected ? formatUSD(walletBalance) : '--'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Vault Balance</span>
              </div>
              <div className="text-2xl font-bold font-mono">
                {isConnected ? formatUSD(totalCollateral) : '--'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Available</span>
              </div>
              <div className="text-2xl font-bold font-mono">
                {formatUSD(availableCollateral)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                {isPnLPositive ? (
                  <TrendingUp className="h-5 w-5 text-success" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-error" />
                )}
                <span className="text-sm text-muted-foreground">Total PnL</span>
              </div>
              <div className={`text-2xl font-bold font-mono ${isPnLPositive ? 'text-success' : 'text-error'}`}>
                {isPnLPositive ? '+' : ''}{formatUSD(totalPnL)}
              </div>
              <div className={`text-xs ${isPnLPositive ? 'text-success' : 'text-error'}`}>
                {isPnLPositive ? '+' : ''}{formatNumber(totalPnLPercent, 2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deposit */}
          <Card>
            <CardHeader>
              <CardTitle>Deposit Collateral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Token Support Warning */}
              {!isTokenSupported && (
                <div className="p-3 bg-warning/20 border border-warning rounded-md text-sm">
                  <p className="text-warning font-semibold mb-1">⚠️ USDC Not Supported</p>
                  <p className="text-xs text-warning/80 mb-2">
                    USDC has not been added as a supported collateral token in the vault.
                  </p>
                  <p className="text-xs text-warning/80">
                    The vault owner needs to call <code className="bg-warning/20 px-1 rounded">addSupportedToken()</code> to enable deposits.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Vault: <code className="text-xs">{config.contracts.vault}</code>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Amount (USDC)</label>
                <Input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={!isTokenSupported}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Wallet: {formatUSD(walletBalance)}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        console.log('Manual refresh triggered');
                        refetchTokenBalance();
                      }}
                      className="text-white hover:underline"
                      title="Refresh allowance and token support status"
                    >
                      🔄
                    </button>
                    <button 
                      onClick={() => setDepositAmount(walletBalance.toString())}
                      className="text-white hover:underline"
                      disabled={!isTokenSupported}
                    >
                      Max
                    </button>
                  </div>
                </div>
              </div>

              {/* Approval Transaction Status */}
              {approveHash && (
                <div className="p-3 bg-secondary rounded-md text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground">Approval Transaction</span>
                    <a
                      href={`https://sepolia.arbiscan.io/tx/${approveHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs"
                    >
                      View on Arbiscan →
                    </a>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isApproving ? '⏳ Waiting for confirmation...' : approveSuccess ? '✅ Approved!' : 'Pending...'}
                  </div>
                </div>
              )}

              {/* Deposit Transaction Status */}
              {depositHash && (
                <div className="p-3 bg-secondary rounded-md text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground">Deposit Transaction</span>
                    <a
                      href={`https://sepolia.arbiscan.io/tx/${depositHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs"
                    >
                      View on Arbiscan →
                    </a>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isDepositing ? '⏳ Waiting for confirmation...' : isDepositSuccess ? '✅ Deposited!' : 'Pending...'}
                  </div>
                </div>
              )}

              {!hasEnoughAllowance && isTokenSupported && (
                <Button
                  fullWidth
                  variant="primary"
                  size="lg"
                  onClick={handleApprove}
                  disabled={!isConnected || isApproving || depositAmountNum <= 0}
                >
                  {isApproving ? 'Approving...' : 'Approve USDC'}
                </Button>
              )}

              <Button
                fullWidth
                variant={hasEnoughAllowance && isTokenSupported ? "primary" : "secondary"}
                size="lg"
                onClick={handleDeposit}
                disabled={!isConnected || isDepositing || !hasEnoughAllowance || !isTokenSupported}
              >
                {isDepositing ? 'Depositing...' : 
                 !isTokenSupported ? 'Token Not Supported' :
                 hasEnoughAllowance ? 'Deposit to Vault' : 'Enter amount & approve first'}
              </Button>

              {/* Debug info in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Allowance: {allowance.toFixed(6)} USDC</div>
                  <div>Needed: {depositAmountNum.toFixed(6)} USDC</div>
                  <div>Has Enough: {hasEnoughAllowance ? 'Yes' : 'No'}</div>
                  <div>Approve Success: {approveSuccess ? 'Yes' : 'No'}</div>
                </div>
              )}

              {!isConnected && (
                <div className="text-xs text-center text-muted-foreground">
                  Connect wallet to deposit collateral
                </div>
              )}
            </CardContent>
          </Card>

          {/* Withdraw */}
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Collateral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Amount (USDC)</label>
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Available: {formatUSD(availableCollateral)}</span>
                  <button 
                    onClick={() => setWithdrawAmount(availableCollateral.toString())}
                    className="text-white hover:underline"
                  >
                    Max
                  </button>
                </div>
              </div>

              <Button 
                fullWidth 
                variant="primary" 
                size="lg"
                onClick={handleWithdraw}
                disabled={!isConnected || isWithdrawing || parseFloat(withdrawAmount || '0') <= 0}
              >
                {isWithdrawing ? 'Withdrawing...' : 'Withdraw from Vault'}
              </Button>

              <div className="p-3 bg-secondary rounded-md text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground">Locked in Positions</span>
                  <span className="font-mono font-medium">{formatUSD(lockedCollateral)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Close positions to unlock collateral
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supported Tokens */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Supported Collateral Tokens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingSupportedTokens ? (
              <p className="text-sm text-muted-foreground">Loading supported tokens...</p>
            ) : supportedTokens.length === 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-warning font-semibold">⚠️ No tokens are currently supported</p>
                <p className="text-xs text-muted-foreground">
                  The vault owner needs to call <code className="bg-secondary px-1 py-0.5 rounded">addSupportedToken()</code> to enable deposits.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Vault:</strong>{' '}
                  <code className="text-xs bg-secondary px-1 py-0.5 rounded">
                    {config.contracts.vault}
                  </code>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">
                  The following tokens are supported as collateral:
                </p>
                <div className="space-y-2">
                  {supportedTokens.map((token) => (
                    <div
                      key={token.address}
                      className="p-3 bg-secondary rounded-md flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold">{token.symbol}</div>
                        <div className="text-xs text-muted-foreground">{token.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-success font-semibold">✓ Supported</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {token.address.slice(0, 6)}...{token.address.slice(-4)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {allTokens.some((token) => !token.isSupported && !token.isLoading) && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Not supported:</p>
                    <div className="space-y-1">
                      {allTokens
                        .filter((token) => !token.isSupported && !token.isLoading)
                        .map((token) => (
                          <div key={token.address} className="text-xs text-muted-foreground">
                            {token.symbol}: <code className="text-xs">{token.address}</code>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vault Diagnostics */}
        <VaultDiagnostics />

        {/* Get Test USDC */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Get Test USDC</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To get test USDC on Arbitrum Sepolia, use Circle&apos;s official faucet:
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="https://faucet.circle.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Circle USDC Faucet →
              </a>
              <p className="text-xs text-muted-foreground">
                Select &quot;Arbitrum Sepolia&quot; and enter your wallet address to receive test USDC
              </p>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <strong>USDC Contract:</strong>{' '}
                <code className="text-xs bg-secondary px-1 py-0.5 rounded">
                  {config.contracts.usdc}
                </code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {(approveError || depositError) && (
          <Card className="mt-6 border-error">
            <CardContent className="p-4">
              {approveError && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-error mb-2">
                    Approval Failed
                  </p>
                  <p className="text-xs text-error/80 mb-2">
                    {approveError.message || 'Transaction failed'}
                  </p>
                </div>
              )}
              {depositError && (
                <div>
                  <p className="text-sm font-semibold text-error mb-2">
                    Deposit Failed
                  </p>
                  <p className="text-xs text-error/80 mb-2">
                    {depositError.message || 'Transaction failed'}
                  </p>
                </div>
              )}
              {(approveError?.message?.includes('Internal JSON-RPC error') || depositError?.message?.includes('Internal JSON-RPC error')) && (
                <div className="text-xs text-muted-foreground space-y-1 mt-3">
                  <p><strong>Possible causes:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>RPC endpoint may be experiencing issues</li>
                    <li>Contract might be paused or have restrictions</li>
                    <li>Insufficient gas or network congestion</li>
                    <li>Transaction would revert (check allowance, balance, or contract state)</li>
                    <li>Try refreshing the page or switching networks</li>
                  </ul>
                  <div className="mt-3 pt-2 border-t border-border/50">
                    <p><strong>USDC:</strong> {config.contracts.usdc}</p>
                    <p><strong>Vault:</strong> {config.contracts.vault}</p>
                    <p className="mt-2">
                      <a
                        href={`https://sepolia.arbiscan.io/address/${config.contracts.vault}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View Vault on Arbiscan →
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
