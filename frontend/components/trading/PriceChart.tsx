'use client'

import { useEffect, useRef, useMemo } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useMarketPrice, useMarketData } from '@/hooks/useMarketData';
import { useCoinGeckoCandles, useCoinGeckoPrice } from '@/hooks/useCoinGecko';
import { config } from '@/lib/config';
import { formatNumber, formatTimeRemaining } from '@/lib/utils';

interface PriceChartProps {
  market: string;
}

export function PriceChart({ market }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // Get market address from market name (default to micro/24h)
  const marketAddress = useMemo(() => {
    const marketLower = market.toLowerCase();
    if (marketLower.includes('btc')) return config.contracts.markets.btc.micro;
    if (marketLower.includes('eth')) return config.contracts.markets.eth.micro;
    if (marketLower.includes('arb')) return config.contracts.markets.arb.micro;
    return config.contracts.markets.btc.micro; // Default
  }, [market]);

  // Use CoinGecko for real-time price and candles
  const { price: coinGeckoPrice, change24hPercent, isLoading: coinGeckoLoading } = useCoinGeckoPrice(market);
  const { candles: coinGeckoCandles, isLoading: candlesLoading } = useCoinGeckoCandles(market, 1); // 1 day = 24h
  
  // Fallback to contract data
  const { price: contractPrice, isLoading: contractPriceLoading } = useMarketPrice(marketAddress);
  const { expiryTimestamp, totalLongOI, totalShortOI } = useMarketData(marketAddress);
  
  // Use CoinGecko price if available, otherwise fallback to contract
  const currentPrice = coinGeckoPrice > 0 ? coinGeckoPrice : contractPrice;
  const priceLoading = coinGeckoLoading || contractPriceLoading;
  
  // Calculate expiry info
  const expiry = expiryTimestamp ? Number(expiryTimestamp) : 0;
  
  // Use CoinGecko 24h change
  const change24h = change24hPercent || 0;

  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      // Create chart with proper typing
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#0a0a0a' },
          textColor: '#a3a3a3',
        },
        grid: {
          vertLines: { color: '#262626' },
          horzLines: { color: '#262626' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
        timeScale: {
          borderColor: '#262626',
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: '#262626',
        },
      });

      chartRef.current = chart;

      // Add candlestick series with proper typing (v5 API)
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });

      seriesRef.current = candlestickSeries;

      // Initial data will be set when candles are available
      // Use mock data initially
      const basePrice = currentPrice || 88000;
      const initialData = generateCandleData(basePrice);
      candlestickSeries.setData(initialData as any);

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
        }
      };
    } catch (error) {
      console.error('Failed to initialize chart:', error);
    }
  }, [market, currentPrice]);

  // Update chart when CoinGecko candles arrive
  useEffect(() => {
    if (seriesRef.current && coinGeckoCandles && coinGeckoCandles.length > 0) {
      // Convert CoinGecko candles to lightweight-charts format
      // CoinGecko returns timestamps in seconds, lightweight-charts expects Unix timestamp
      const data: Array<{
        time: any;
        open: number;
        high: number;
        low: number;
        close: number;
      }> = coinGeckoCandles.map(candle => ({
        time: candle.time as any, // Time is already in Unix seconds format
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));
      
      seriesRef.current.setData(data);
    }
  }, [coinGeckoCandles]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{market}</CardTitle>
            <div className="text-xs text-muted-foreground mt-1">
              Outcome Market • {expiry > 0 ? `Expires in ${formatTimeRemaining(expiry)}` : 'No expiry set'}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">24h Change:</span>
              {priceLoading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : (
                <span className={change24h >= 0 ? 'text-success font-medium' : 'text-error font-medium'}>
                  {change24h >= 0 ? '+' : ''}{formatNumber(change24h, 2)}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Current Price:</span>
              <span className="font-mono font-medium">
                {priceLoading ? 'Loading...' : currentPrice ? `$${formatNumber(currentPrice, 2)}` : '--'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartContainerRef} />
      </CardContent>
    </Card>
  );
}

// Generate candlestick OHLC data based on current price
function generateCandleData(basePrice: number) {
  const data = [];
  let currentPrice = basePrice;
  const now = Math.floor(Date.now() / 1000);

  for (let i = 100; i >= 0; i--) {
    const time = now - i * 3600; // 1 hour intervals

    // Generate realistic OHLC data around base price
    const volatility = (Math.random() - 0.5) * (basePrice * 0.01); // 1% volatility
    const open = currentPrice;
    const high = open + Math.abs(volatility);
    const low = open - Math.abs(volatility);
    const close = low + Math.random() * (high - low);

    currentPrice = close; // Update for next candle

    data.push({
      time: time,
      open: open,
      high: high,
      low: low,
      close: close,
    });
  }

  return data;
}
