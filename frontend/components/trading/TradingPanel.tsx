'use client'

import { useState, useMemo, useEffect } from 'react';
import * as React from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn, formatTimeRemaining } from '@/lib/utils';
import { useOpenPosition } from '@/hooks/useTrading';
import { useVaultBalance, useTokenBalance, useApproveToken, useDepositCollateral } from '@/hooks/useVault';
import { useMarketPrice, useMarketData } from '@/hooks/useMarketData';
import { useUserPositions } from '@/hooks/usePositions';
import { useCoinGeckoPrice } from '@/hooks/useCoinGecko';
import { useUpdatePrice } from '@/hooks/useUpdatePrice';
import { config } from '@/lib/config';
import { Clock, TrendingUp, TrendingDown, AlertCircle, Wallet } from 'lucide-react';

interface TradingPanelProps {
  market: string; // Market address
}

export function TradingPanel({ market }: TradingPanelProps) {
  const { address, isConnected } = useAccount();
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [collateral, setCollateral] = useState('100');
  const [leverage, setLeverage] = useState(10);

  // Market address is passed directly
  const marketAddress = market;

  // Get real data from hooks
  const { availableCollateral, refetch: refetchVault } = useVaultBalance();
  const { balance: walletBalance, allowance, refetch: refetchToken } = useTokenBalance(config.contracts.usdc);
  
  // Get market name for CoinGecko
  const marketName = useMemo(() => {
    // Check against config market addresses
    const markets = config.contracts.markets;
    const addrLower = marketAddress.toLowerCase();
    if (addrLower === markets.btc.micro.toLowerCase() ||
        addrLower === markets.btc.daily.toLowerCase() ||
        addrLower === markets.btc.macro.toLowerCase()) return 'BTC/USD';
    if (addrLower === markets.eth.micro.toLowerCase() ||
        addrLower === markets.eth.daily.toLowerCase() ||
        addrLower === markets.eth.macro.toLowerCase()) return 'ETH/USD';
    if (addrLower === markets.arb.micro.toLowerCase() ||
        addrLower === markets.arb.daily.toLowerCase() ||
        addrLower === markets.arb.macro.toLowerCase()) return 'ARB/USD';
    return 'BTC/USD'; // Default
  }, [marketAddress]);
  
  // Use CoinGecko for real-time price
  const { 
    price: coinGeckoPrice, 
    change24hPercent, 
    isLoading: coinGeckoLoading, 
    error: coinGeckoError,
    refetch: refetchCoinGecko 
  } = useCoinGeckoPrice(marketName);
  
  // Fallback to contract price if CoinGecko fails
  const { price: contractPrice, isLoading: contractPriceLoading } = useMarketPrice(marketAddress);
  
  // Always prioritize CoinGecko price - it's more reliable and real-time
  // Only use contract price if CoinGecko completely fails
  const currentPrice = coinGeckoPrice > 0 ? coinGeckoPrice : (contractPrice > 0 ? contractPrice : 0);
  const priceLoading = coinGeckoLoading && contractPriceLoading; // Only show loading if both are loading
  const priceError = coinGeckoError;
  const hasValidPrice = currentPrice > 0;
  
  // Log for debugging
  useEffect(() => {
    if (coinGeckoPrice > 0) {
      console.log('Using CoinGecko price:', coinGeckoPrice, 'for market:', marketName);
    } else if (contractPrice > 0) {
      console.log('Falling back to contract price:', contractPrice);
    }
  }, [coinGeckoPrice, contractPrice, marketName]);
  
  const { expiryTimestamp, settled, totalLongOI, totalShortOI } = useMarketData(marketAddress);
  const { refetch: refetchPositions } = useUserPositions();
  
  // State to track auto-deposit flow (declare before using in isPending)
  const [pendingDepositAmount, setPendingDepositAmount] = useState<number | null>(null);
  const [pendingPosition, setPendingPosition] = useState<{amount: number, direction: 0 | 1, leverage: number} | null>(null);
  const [transactionStartTime, setTransactionStartTime] = useState<number | null>(null);
  const [isPositionCreated, setIsPositionCreated] = useState(false);

  // Transaction hooks - must be declared before using their values
  const { approve, isPending: isApproving, isSuccess: isApproved, hash: approveHash } = useApproveToken();
  const { deposit, isPending: isDepositing, isSuccess: isDepositSuccess, hash: depositHash } = useDepositCollateral();
  const { openPosition, isPending: isOpeningPosition, isSuccess: isPositionOpen, isError: isPositionError, error: positionError, errorMessage: positionErrorMessage, hash: positionHash } = useOpenPosition();
  const { updatePriceCache, isPending: isUpdatingPrice, isSuccess: isPriceUpdated, isError: isPriceUpdateError, error: priceUpdateError, hash: priceUpdateHash, reset: resetPriceUpdate } = useUpdatePrice();

  // State to track if we need to open position after price update
  const [pendingPriceUpdate, setPendingPriceUpdate] = useState(false);

  // Track transaction status
  const isPending = isApproving || isOpeningPosition || isUpdatingPrice || (transactionStartTime !== null && !isPositionOpen);
  const transactionHash = positionHash || approveHash || priceUpdateHash;

  // Refetch positions after successful position open
  useEffect(() => {
    if (isPositionOpen) {
      setIsPositionCreated(true);
      setTimeout(() => {
        refetchPositions();
        setIsPositionCreated(false);
        setTransactionStartTime(null);
        setPendingPosition(null);
        setPendingPriceUpdate(false);
        resetPriceUpdate();
      }, 3000);
    }
  }, [isPositionOpen, refetchPositions, resetPriceUpdate]);

  // After price update succeeds, proceed with approval/position opening
  useEffect(() => {
    if (isPriceUpdated && pendingPriceUpdate && pendingPosition && !isUpdatingPrice) {
      console.log('Price updated successfully! Proceeding with position opening...');
      setPendingPriceUpdate(false);

      // Get token address for approval
      const tokenAddress = config.contracts.usdc;
      const approveAmount = BigInt(Math.floor(pendingPosition.amount * 1e6)); // USDC has 6 decimals

      // Check if approval is needed
      const currentAllowance = allowance * 1e6; // Convert back to 6 decimals

      if (currentAllowance < Number(approveAmount)) {
        // Request approval first
        console.log('Requesting wallet approval for amount:', Number(approveAmount));
        approve(tokenAddress, approveAmount);
      } else {
        // Already approved, open position directly
        console.log('Already approved, opening position directly...');
        const collateralBigInt = BigInt(Math.floor(pendingPosition.amount * 1e18));
        const leverageBigInt = BigInt(pendingPosition.leverage);

        openPosition(
          marketAddress,
          pendingPosition.direction,
          collateralBigInt,
          leverageBigInt
        );
      }
    }
  }, [isPriceUpdated, pendingPriceUpdate, pendingPosition, isUpdatingPrice, allowance, approve, openPosition, marketAddress]);

  // Handle price update errors
  useEffect(() => {
    if (isPriceUpdateError && pendingPriceUpdate) {
      console.error('Price update failed:', priceUpdateError);
      setPendingPriceUpdate(false);
      setTransactionStartTime(null);
      alert('Failed to update price. Only the contract owner can update prices. Please contact the admin.');
    }
  }, [isPriceUpdateError, pendingPriceUpdate, priceUpdateError]);

  // Calculate expiry info
  const expiry = expiryTimestamp ? Number(expiryTimestamp) : 0;
  const timeRemaining = expiry > 0 ? formatTimeRemaining(expiry) : '--';
  const isExpired = expiry > 0 && Date.now() / 1000 >= expiry;
  
  // Calculate market sentiment (long vs short OI)
  const longOI = totalLongOI ? Number(totalLongOI) / 1e18 : 0;
  const shortOI = totalShortOI ? Number(totalShortOI) / 1e18 : 0;
  const totalOI = longOI + shortOI;
  const longPercentage = totalOI > 0 ? (longOI / totalOI) * 100 : 50;

  // Calculate position details before opening
  const collateralAmount = parseFloat(collateral || '0');
  const positionSize = collateralAmount * leverage;
  // Entry price will be the current market price when position opens
  // Always use CoinGecko price if available (real-time), otherwise contract price
  const entryPrice = currentPrice; // This is the price that will be used as entry price
  
  // Calculate liquidation price based on entry price and leverage
  // For LONG: liquidation happens when price drops by (1/leverage) from entry
  // For SHORT: liquidation happens when price rises by (1/leverage) from entry
  const liquidationPrice = entryPrice > 0 
    ? (side === 'long' 
        ? entryPrice * (1 - 1/leverage)
        : entryPrice * (1 + 1/leverage))
    : 0;
  
  // Calculate fee (0.5% of position size)
  const tradingFee = positionSize * 0.005;
  
  // Reset stuck transactions after 2 minutes
  useEffect(() => {
    if (isPending && transactionStartTime) {
      const elapsed = Date.now() - transactionStartTime;
      if (elapsed > 120000) { // 2 minutes
        console.warn('Transaction appears stuck, resetting state');
        setTransactionStartTime(null);
        setPendingDepositAmount(null);
        setPendingPosition(null);
        setPendingPriceUpdate(false);
        resetPriceUpdate();
      }
    }
  }, [isPending, transactionStartTime, resetPriceUpdate]);

  // After wallet approval succeeds, open real position on contract
  useEffect(() => {
    console.log('Approval useEffect triggered', {
      isApproved,
      pendingPosition,
      isApproving,
      approveHash,
      address
    });

    // Open position after user confirms approval in wallet
    if (isApproved && pendingPosition && !isApproving && !isOpeningPosition) {
      console.log('Wallet approval confirmed! Opening position on contract...');

      // Convert to contract format (18 decimals for collateral, leverage as-is 1-40)
      const collateralBigInt = BigInt(Math.floor(pendingPosition.amount * 1e18));
      const leverageBigInt = BigInt(pendingPosition.leverage); // Leverage 1-40 (contract expects simple number)

      openPosition(
        marketAddress,
        pendingPosition.direction,
        collateralBigInt,
        leverageBigInt
      );
    }
  }, [isApproved, pendingPosition, isApproving, isOpeningPosition, marketAddress, openPosition]);

  // Handle opening a new position
  const handleOpenPosition = () => {
    console.log('=== handleOpenPosition START ===');
    console.log('handleOpenPosition called', {
      isConnected,
      address,
      collateral,
      availableCollateral,
      walletBalance,
      isPending,
      isExpired,
      side,
      leverage,
      coinGeckoPrice
    });

    if (!isConnected || !address) {
      console.warn('Wallet not connected');
      alert('Please connect your wallet');
      return;
    }

    const collateralAmount = parseFloat(collateral || '0');
    if (collateralAmount <= 0) {
      alert('Please enter a valid collateral amount');
      return;
    }

    if (collateralAmount > availableCollateral) {
      alert(`Insufficient vault balance. Available: ${availableCollateral.toFixed(2)} USDC. Please deposit more collateral in Portfolio.`);
      return;
    }

    if (coinGeckoPrice <= 0) {
      alert('Unable to fetch current price from CoinGecko. Please try again.');
      return;
    }

    // Track transaction start time (for UI feedback)
    setTransactionStartTime(Date.now());

    // Store pending position info
    setPendingPosition({
      amount: collateralAmount,
      direction: side === 'long' ? 0 : 1,
      leverage: leverage
    });

    // First, update the price cache with CoinGecko's real-time price
    console.log('Updating price cache with CoinGecko price:', coinGeckoPrice);
    setPendingPriceUpdate(true);

    try {
      updatePriceCache(marketName, coinGeckoPrice);
      console.log('Price update transaction initiated - waiting for confirmation...');
    } catch (error) {
      console.error('Error initiating price update:', error);
      alert('Failed to update price. Please try again.');
      setTransactionStartTime(null);
      setPendingPosition(null);
      setPendingPriceUpdate(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Predict Outcome</CardTitle>
          {expiry > 0 && (
            <div className={cn(
              "flex items-center gap-2 text-xs px-2 py-1 rounded",
              isExpired 
                ? "bg-error/20 text-error" 
                : "bg-warning/20 text-warning"
            )}>
              <Clock className="h-3 w-3" />
              <span>{isExpired ? 'Expired' : timeRemaining}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Expiry Warning */}
        {isExpired && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-md flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-error mt-0.5 flex-shrink-0" />
            <div className="text-xs text-error">
              <div className="font-medium mb-1">Market Expired</div>
              <div>This market has expired. Positions will be settled automatically.</div>
            </div>
          </div>
        )}

        {/* Prediction Direction */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Your Prediction</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSide('long')}
            className={cn(
                'py-3 px-4 rounded-md font-medium transition-colors flex flex-col items-center gap-1',
              side === 'long'
                  ? 'bg-success text-white border-2 border-success'
                  : 'bg-secondary text-muted-foreground hover:bg-muted border-2 border-transparent'
            )}
          >
              <TrendingUp className="h-5 w-5" />
              <span>Price Goes UP</span>
              <span className="text-xs opacity-80">Above current price</span>
          </button>
          <button
            onClick={() => setSide('short')}
            className={cn(
                'py-3 px-4 rounded-md font-medium transition-colors flex flex-col items-center gap-1',
              side === 'short'
                  ? 'bg-error text-white border-2 border-error'
                  : 'bg-secondary text-muted-foreground hover:bg-muted border-2 border-transparent'
            )}
          >
              <TrendingDown className="h-5 w-5" />
              <span>Price Goes DOWN</span>
              <span className="text-xs opacity-80">Below current price</span>
          </button>
          </div>
        </div>

        {/* Market Sentiment */}
        {totalOI > 0 && (
          <div className="p-3 bg-secondary rounded-md space-y-2">
            <div className="text-xs text-muted-foreground">Market Sentiment</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-error rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success transition-all" 
                  style={{ width: `${longPercentage}%` }}
                />
              </div>
              <div className="text-xs font-medium min-w-[60px] text-right">
                {longPercentage.toFixed(1)}% Up
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Long: ${(longOI / 1000).toFixed(0)}K</span>
              <span>Short: ${(shortOI / 1000).toFixed(0)}K</span>
            </div>
          </div>
        )}

        {/* Collateral Input */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Collateral (USD)</label>
          <Input
            type="number"
            value={collateral}
            onChange={(e) => setCollateral(e.target.value)}
            placeholder="0.00"
          />
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Wallet className="h-3 w-3" />
                <span>Wallet:</span>
              </div>
              <span className="font-medium">
                {walletBalance.toFixed(2)} USDC
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Vault Available:</span>
              <span className="font-medium">{availableCollateral.toFixed(2)} USDC</span>
            </div>
            {walletBalance > 0 && availableCollateral === 0 && (
              <div className="text-xs text-warning mt-1">
                Deposit USDC to vault in Portfolio to start trading
              </div>
            )}
            <div className="flex justify-end mt-1">
              <button 
                onClick={() => setCollateral(availableCollateral > 0 ? availableCollateral.toFixed(2) : '0')}
                className="text-xs text-white hover:underline"
              >
                Use Max ({availableCollateral.toFixed(2)})
              </button>
            </div>
          </div>
        </div>

        {/* Leverage Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">Leverage</label>
            <span className="text-sm font-medium">{leverage}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="40"
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-white"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1x</span>
            <span>20x</span>
            <span>40x</span>
          </div>
        </div>

        {/* Position Summary */}
        <div className="space-y-2 p-3 bg-secondary rounded-md text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Position Size</span>
            <span className="font-mono font-medium">${positionSize.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Entry Price</span>
            {priceLoading ? (
              <span className="text-xs text-muted-foreground">Loading price...</span>
            ) : priceError ? (
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-error">Price fetch error</span>
                <button 
                  onClick={() => refetchCoinGecko()} 
                  className="text-xs text-primary hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : entryPrice > 0 ? (
              <span className="font-mono font-medium">
                ${entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-muted-foreground">
                  Price not available
                </span>
                <button 
                  onClick={() => refetchCoinGecko()} 
                  className="text-xs text-primary hover:underline"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Liq. Price</span>
            {liquidationPrice > 0 ? (
              <span className="font-mono font-medium text-error">
                ${liquidationPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">--</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Fee (0.5%)</span>
            <span className="font-mono font-medium">${tradingFee.toFixed(2)}</span>
          </div>
          {expiry > 0 && !isExpired && (
            <div className="pt-2 mt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Settlement at Expiry</span>
                <span className="text-warning font-medium">{timeRemaining}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Position will be automatically settled at expiry based on final price
              </div>
            </div>
          )}
        </div>

        {/* Success Animation State */}
        {isPositionCreated && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            style={{
              animation: 'fadeIn 0.3s ease-in-out'
            }}
            onClick={() => setIsPositionCreated(false)}
          >
            <div 
              className="bg-card border border-border rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl"
              style={{
                animation: 'slideUp 0.4s ease-out, scaleIn 0.4s ease-out'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div 
                  className="w-16 h-16 mx-auto bg-success/20 rounded-full flex items-center justify-center"
                  style={{
                    animation: 'scaleIn 0.5s ease-out 0.2s both'
                  }}
                >
                  <svg 
                    className="w-8 h-8 text-success" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    style={{
                      animation: 'checkmark 0.6s ease-out 0.3s both'
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div
                  style={{
                    animation: 'fadeIn 0.4s ease-out 0.4s both'
                  }}
                >
                  <h3 className="text-lg font-semibold mb-2">Prediction Created!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your {side === 'long' ? 'LONG' : 'SHORT'} position has been opened successfully.
                  </p>
                </div>
                <Button 
                  onClick={() => setIsPositionCreated(false)}
                  variant="primary"
                  className="w-full"
                  style={{
                    animation: 'fadeIn 0.4s ease-out 0.5s both'
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { 
              transform: translateY(20px);
              opacity: 0;
            }
            to { 
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes scaleIn {
            from { 
              transform: scale(0.8);
              opacity: 0;
            }
            to { 
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes checkmark {
            0% {
              stroke-dasharray: 0, 100;
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              stroke-dasharray: 100, 0;
              opacity: 1;
            }
          }
        `}</style>

        {/* Action Button */}
        <Button 
          variant={side === 'long' ? 'success' : 'error'} 
          fullWidth 
          size="lg"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('=== BUTTON CLICKED ===');
            console.log('Button clicked!', { 
              isPending, 
              isConnected, 
              collateral, 
              isExpired,
              address,
              disabled: isPending || !isConnected || parseFloat(collateral || '0') <= 0 || isExpired
            });
            if (!isPending && isConnected && parseFloat(collateral || '0') > 0 && !isExpired) {
              handleOpenPosition();
            } else {
              console.warn('Button click ignored - button is disabled');
            }
          }}
          disabled={isPending || !isConnected || parseFloat(collateral || '0') <= 0 || isExpired}
        >
          {isPending
            ? (isUpdatingPrice
                ? 'Updating Price...'
                : isApproving
                ? 'Approving USDC...'
                : 'Placing Prediction...')
            : isExpired
            ? 'Market Expired'
            : side === 'long'
            ? 'Predict Price Goes UP'
            : 'Predict Price Goes DOWN'}
        </Button>

        {/* Transaction Status */}
        {transactionHash && (
          <div className="text-xs text-center space-y-1">
            <div className="text-muted-foreground">
              TX: {transactionHash.slice(0, 6)}...{transactionHash.slice(-4)}
            </div>
            {isPending && transactionStartTime && (
              <div className="text-warning">
                Waiting for confirmation... ({Math.floor((Date.now() - transactionStartTime) / 1000)}s)
              </div>
            )}
            {isPositionError && (
              <div className="text-error text-xs space-y-1">
                <div className="font-medium">Transaction failed:</div>
                <div>{positionErrorMessage || 'Unknown error'}</div>
                {positionError && (
                  <details className="text-xs opacity-75 mt-1">
                    <summary className="cursor-pointer hover:underline">Technical details</summary>
                    <pre className="mt-1 p-2 bg-error/10 rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(positionError, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
            {isPending && transactionStartTime && (Date.now() - transactionStartTime) > 60000 && (
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setTransactionStartTime(null);
                    setPendingDepositAmount(null);
                    setPendingPosition(null);
                    setPendingPriceUpdate(false);
                    resetPriceUpdate();
                    refetchPositions();
                    refetchVault();
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Reset (if stuck)
                </button>
                <div className="text-warning text-xs">
                  Note: RPC rate limits may delay status updates
                </div>
              </div>
            )}
            {transactionHash && (
              <a
                href={`${config.arbitrumSepolia.blockExplorers.default.url}/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                View on Explorer
              </a>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="p-3 bg-secondary/50 rounded-md text-xs text-muted-foreground space-y-1">
          <div className="font-medium text-foreground mb-1">How it works:</div>
          <div>• Predict if price will be above or below current price at expiry</div>
          <div>• Position automatically settles at expiry based on final price</div>
          <div>• Close early anytime to realize PnL immediately</div>
        </div>

        {/* Wallet Status */}
        {!isConnected && (
        <div className="text-xs text-center text-muted-foreground">
            Connect wallet to place predictions
        </div>
        )}
      </CardContent>
    </Card>
  );
}
