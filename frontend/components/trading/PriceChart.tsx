'use client'

import { useEffect, useRef, useMemo } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useMarketPrice, useMarketData } from '@/hooks/useMarketData';
import { useCoinGeckoCandles, useCoinGeckoPrice } from '@/hooks/useCoinGecko';
import { config } from '@/lib/config';
import { formatNumber, formatTimeRemaining } from '@/lib/utils';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

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
  const isPositive = change24h >= 0;

  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      // Create chart with proper typing
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#737373',
          fontFamily: 'JetBrains Mono, monospace',
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 350,
        timeScale: {
          borderColor: '#262626',
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: '#262626',
        },
        crosshair: {
          vertLine: {
            color: 'rgba(255, 255, 255, 0.2)',
            width: 1,
            style: 2,
          },
          horzLine: {
            color: 'rgba(255, 255, 255, 0.2)',
            width: 1,
            style: 2,
          },
        },
      });

      chartRef.current = chart;

      // Add candlestick series with proper typing (v5 API)
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderUpColor: '#22c55e',
        borderDownColor: '#ef4444',
        wickUpColor: '#22c55e',
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
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Market Info */}
          <div className="flex items-center gap-4">
            <div>
              <CardTitle className="text-xl font-bold">{market}</CardTitle>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <Clock className="h-3 w-3" />
                <span>{expiry > 0 ? `Expires in ${formatTimeRemaining(expiry)}` : 'No expiry set'}</span>
              </div>
            </div>
          </div>

          {/* Price Stats */}
          <div className="flex items-center gap-6">
            {/* Current Price */}
            <div className="text-right">
              <div className="text-2xs text-gray-500 uppercase tracking-wider mb-1">Current Price</div>
              <div className="font-mono text-xl font-bold">
                {priceLoading ? (
                  <span className="text-gray-500">Loading...</span>
                ) : currentPrice ? (
                  `$${formatNumber(currentPrice, 2)}`
                ) : (
                  '--'
                )}
              </div>
            </div>

            {/* 24h Change */}
            <div className="text-right">
              <div className="text-2xs text-gray-500 uppercase tracking-wider mb-1">24h Change</div>
              <div className={`flex items-center gap-1 font-mono text-lg font-semibold ${isPositive ? 'text-success' : 'text-error'}`}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{isPositive ? '+' : ''}{formatNumber(change24h, 2)}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div ref={chartContainerRef} className="rounded-lg overflow-hidden" />
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
