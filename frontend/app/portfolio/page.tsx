'use client'

import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatUSD, formatNumber } from "@/lib/utils";
import { Wallet, TrendingUp, TrendingDown, Shield, DollarSign, ArrowDownToLine, ArrowUpFromLine, ExternalLink, AlertTriangle, CheckCircle, Coins } from "lucide-react";
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
      vaultAddress: config.contracts.vault,
      usdcAddress: config.contracts.usdc,
    });
  }, [allowance, depositAmountNum, hasEnoughAllowance, approveSuccess]);

  const handleApprove = async () => {
    if (depositAmountNum <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (walletBalance < depositAmountNum) {
      alert(`Insufficient balance. You have ${walletBalance.toFixed(6)} USDC but need ${depositAmountNum.toFixed(6)} USDC`);
      return;
    }

    try {
      const approvalMultiplier = depositAmountNum >= 10 ? 1.1 : 1.0;
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

  // Refetch allowance after successful approve and auto-deposit
  useEffect(() => {
    if (approveSuccess && approveHash) {
      console.log('Approval successful! Refetching token balance and allowance...');
      console.log('  Approval tx:', approveHash);
      refetchTokenBalance();
      setTimeout(async () => {
        refetchTokenBalance();
        console.log('Token balance and allowance refetched');
        const amount = parseFloat(depositAmount || '0');
        if (amount > 0 && amount <= walletBalance) {
          console.log('Auto-depositing after approval...', { amount, walletBalance });
          try {
            const amountBigInt = BigInt(Math.floor(amount * 1e6));
            await deposit(config.contracts.usdc, amountBigInt);
          } catch (err: any) {
            console.error('Auto-deposit failed:', err);
          }
        }
      }, 2000);
    }
  }, [approveSuccess, approveHash, refetchTokenBalance, depositAmount, walletBalance, deposit]);

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
      const amountBigInt = BigInt(Math.floor(amount * 1e6));
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
    const amountBigInt = BigInt(Math.floor(amount * 1e6));
    withdraw(config.contracts.usdc, amountBigInt);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-slide-down">
          <h1 className="text-4xl font-bold mb-2">Portfolio</h1>
          <p className="text-gray-500">
            Manage your collateral and track your performance
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card variant="gradient" className="animate-fade-in">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm text-gray-400">Wallet Balance</span>
              </div>
              <div className="text-2xl font-bold font-mono">
                {isConnected ? formatUSD(walletBalance) : '--'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Available in wallet</div>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in delay-100">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm text-gray-400">Vault Balance</span>
              </div>
              <div className="text-2xl font-bold font-mono">
                {isConnected ? formatUSD(totalCollateral) : '--'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Total deposited</div>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in delay-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm text-gray-400">Available</span>
              </div>
              <div className="text-2xl font-bold font-mono">
                {formatUSD(availableCollateral)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Free collateral</div>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in delay-300">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isPnLPositive ? 'bg-success/20' : 'bg-error/20'}`}>
                  {isPnLPositive ? (
                    <TrendingUp className="h-5 w-5 text-success" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-error" />
                  )}
                </div>
                <span className="text-sm text-gray-400">Total PnL</span>
              </div>
              <div className={`text-2xl font-bold font-mono ${isPnLPositive ? 'text-success' : 'text-error'}`}>
                {isPnLPositive ? '+' : ''}{formatUSD(totalPnL)}
              </div>
              <div className={`text-xs mt-1 ${isPnLPositive ? 'text-success' : 'text-error'}`}>
                {isPnLPositive ? '+' : ''}{formatNumber(totalPnLPercent, 2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deposit */}
          <Card className="animate-fade-in delay-100">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <ArrowDownToLine className="h-5 w-5 text-success" />
                </div>
                <div>
                  <CardTitle>Deposit Collateral</CardTitle>
                  <CardDescription>Add funds to start trading</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Token Support Warning */}
              {!isTokenSupported && (
                <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-warning mb-1">USDC Not Supported</p>
                      <p className="text-xs text-warning/80">
                        USDC has not been added as a supported collateral token in the vault.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Amount (USDC)</label>
                <Input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={!isTokenSupported}
                  className="font-mono"
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Wallet: <span className="font-mono text-white">{formatUSD(walletBalance)}</span></span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => refetchTokenBalance()}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Refresh"
                    >
                      Refresh
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

              {/* Transaction Status */}
              {(approveHash || depositHash) && (
                <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                  {approveHash && (
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center gap-2">
                        {isApproving ? (
                          <div className="h-4 w-4 rounded-full border-2 border-gray-600 border-t-white animate-spin" />
                        ) : approveSuccess ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : null}
                        <span className="text-gray-400">Approval</span>
                      </div>
                      <a
                        href={`https://sepolia.arbiscan.io/tx/${approveHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-white hover:underline flex items-center gap-1"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {depositHash && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {isDepositing ? (
                          <div className="h-4 w-4 rounded-full border-2 border-gray-600 border-t-white animate-spin" />
                        ) : isDepositSuccess ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : null}
                        <span className="text-gray-400">Deposit</span>
                      </div>
                      <a
                        href={`https://sepolia.arbiscan.io/tx/${depositHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-white hover:underline flex items-center gap-1"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {!hasEnoughAllowance && isTokenSupported && (
                  <Button
                    fullWidth
                    variant="outline"
                    size="lg"
                    onClick={handleApprove}
                    disabled={!isConnected || isApproving || depositAmountNum <= 0}
                    loading={isApproving}
                  >
                    {isApproving ? 'Approving...' : 'Approve USDC'}
                  </Button>
                )}

                <Button
                  fullWidth
                  variant={hasEnoughAllowance && isTokenSupported ? "success" : "secondary"}
                  size="lg"
                  onClick={handleDeposit}
                  disabled={!isConnected || isDepositing || !hasEnoughAllowance || !isTokenSupported}
                  loading={isDepositing}
                >
                  {isDepositing ? 'Depositing...' :
                    !isTokenSupported ? 'Token Not Supported' :
                      hasEnoughAllowance ? 'Deposit to Vault' : 'Enter amount & approve first'}
                </Button>
              </div>

              {!isConnected && (
                <div className="text-xs text-center text-gray-500 py-2">
                  Connect wallet to deposit collateral
                </div>
              )}
            </CardContent>
          </Card>

          {/* Withdraw */}
          <Card className="animate-fade-in delay-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-error/20 flex items-center justify-center">
                  <ArrowUpFromLine className="h-5 w-5 text-error" />
                </div>
                <div>
                  <CardTitle>Withdraw Collateral</CardTitle>
                  <CardDescription>Remove funds from vault</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Amount (USDC)</label>
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="font-mono"
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Available: <span className="font-mono text-white">{formatUSD(availableCollateral)}</span></span>
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
                variant="error"
                size="lg"
                onClick={handleWithdraw}
                disabled={!isConnected || isWithdrawing || parseFloat(withdrawAmount || '0') <= 0}
                loading={isWithdrawing}
              >
                {isWithdrawing ? 'Withdrawing...' : 'Withdraw from Vault'}
              </Button>

              <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Locked in Positions</span>
                  <span className="font-mono font-semibold">{formatUSD(lockedCollateral)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Close positions to unlock collateral
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supported Tokens */}
        <Card className="mt-6 animate-fade-in delay-300">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Supported Collateral</CardTitle>
                <CardDescription>Tokens accepted as collateral</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingSupportedTokens ? (
              <div className="flex items-center gap-3 py-8 justify-center">
                <div className="h-5 w-5 rounded-full border-2 border-gray-600 border-t-white animate-spin" />
                <span className="text-sm text-gray-500">Loading supported tokens...</span>
              </div>
            ) : supportedTokens.length === 0 ? (
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-warning mb-1">No tokens supported</p>
                    <p className="text-xs text-gray-500">
                      The vault owner needs to add supported tokens.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {supportedTokens.map((token) => (
                  <div
                    key={token.address}
                    className="p-4 bg-gray-900 rounded-lg border border-gray-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{token.symbol}</div>
                        <div className="text-xs text-gray-500">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-success text-xs font-medium">
                        <CheckCircle className="h-3 w-3" />
                        Supported
                      </div>
                      <div className="text-xs text-gray-600 font-mono mt-1">
                        {token.address.slice(0, 6)}...{token.address.slice(-4)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vault Diagnostics */}
        <VaultDiagnostics />

        {/* Get Test USDC */}
        <Card className="mt-6 animate-fade-in delay-400">
          <CardHeader>
            <CardTitle>Get Test USDC</CardTitle>
            <CardDescription>Obtain test tokens for trading</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400">
              To get test USDC on Arbitrum Sepolia, use Circle&apos;s official faucet:
            </p>
            <a
              href="https://faucet.circle.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Circle USDC Faucet
              <ExternalLink className="h-4 w-4" />
            </a>
            <p className="text-xs text-gray-500">
              Select &quot;Arbitrum Sepolia&quot; and enter your wallet address
            </p>
          </CardContent>
        </Card>

        {/* Error Display */}
        {(approveError || depositError) && (
          <Card className="mt-6 border-error/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
                <div>
                  {approveError && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-error mb-1">Approval Failed</p>
                      <p className="text-xs text-error/80">{approveError.message || 'Transaction failed'}</p>
                    </div>
                  )}
                  {depositError && (
                    <div>
                      <p className="text-sm font-semibold text-error mb-1">Deposit Failed</p>
                      <p className="text-xs text-error/80">{depositError.message || 'Transaction failed'}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
