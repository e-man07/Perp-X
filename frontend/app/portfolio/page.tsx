'use client'

import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatUSD, formatNumber } from "@/lib/utils";
import { Wallet, TrendingUp, Shield, DollarSign } from "lucide-react";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useVaultBalance, useTokenBalance, useApproveToken, useDepositCollateral, useWithdrawCollateral } from "@/hooks/useVault";
import { config } from "@/lib/config";
import { useUserPositions } from "@/hooks/usePositions";
import { usePosition, usePositionPnL } from "@/hooks/usePositions";
import { useMarketPrice } from "@/hooks/useMarketData";
import { useMemo } from "react";

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Get real vault data
  const { availableCollateral, totalCollateral, lockedCollateral } = useVaultBalance();
  const { balance: walletBalance } = useTokenBalance(config.contracts.mockUSDC);
  const { approve, isPending: isApproving, isSuccess: isApproved } = useApproveToken();
  const { deposit, isPending: isDepositing, isSuccess: isDepositSuccess } = useDepositCollateral();
  const { withdraw, isPending: isWithdrawing } = useWithdrawCollateral();

  // Calculate total PnL from all positions
  const { positionIds } = useUserPositions();
  
  // Calculate total PnL (simplified - would need to fetch all position details)
  const totalPnL = 0; // TODO: Calculate from all positions
  const totalPnLPercent = 0;

  const handleApprove = () => {
    const amount = parseFloat(depositAmount || '0');
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    // Approve max amount (or specific amount)
    const amountBigInt = BigInt(Math.floor(amount * 1e6)); // USDC has 6 decimals
    approve(config.contracts.mockUSDC, amountBigInt);
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount || '0');
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (amount > walletBalance) {
      alert(`Insufficient balance. Wallet: ${walletBalance.toFixed(2)} USDC`);
      return;
    }
    const amountBigInt = BigInt(Math.floor(amount * 1e6)); // USDC has 6 decimals
    deposit(config.contracts.mockUSDC, amountBigInt);
    
    // Clear input on success
    if (isDepositSuccess) {
      setDepositAmount("");
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
    withdraw(config.contracts.mockUSDC, amountBigInt);
    
    // Clear input
    setWithdrawAmount("");
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
                <TrendingUp className="h-5 w-5 text-success" />
                <span className="text-sm text-muted-foreground">Total PnL</span>
              </div>
              <div className="text-2xl font-bold font-mono text-success">
                +{formatUSD(totalPnL)}
              </div>
              <div className="text-xs text-success">
                +{formatNumber(totalPnLPercent, 2)}%
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
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Amount (USDC)</label>
                <Input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Wallet: {formatUSD(walletBalance)}</span>
                  <button 
                    onClick={() => setDepositAmount(walletBalance.toString())}
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
                onClick={handleApprove}
                disabled={!isConnected || isApproving || parseFloat(depositAmount || '0') <= 0}
              >
                {isApproving ? 'Approving...' : isApproved ? 'Approved ✓' : 'Approve USDC'}
              </Button>

              <Button 
                fullWidth 
                variant="secondary" 
                size="lg" 
                onClick={handleDeposit}
                disabled={!isConnected || isDepositing || !isApproved || parseFloat(depositAmount || '0') <= 0}
              >
                {isDepositing ? 'Depositing...' : 'Deposit to Vault'}
              </Button>

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

        {/* Faucet */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Testnet Faucet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Get test USDC for trading (10,000 USDC per call)
                </p>
              </div>
              <Button>
                Claim Test USDC
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
