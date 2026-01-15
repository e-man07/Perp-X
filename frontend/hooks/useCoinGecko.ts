'use client'

import { useState, useEffect } from 'react';

// Use Next.js API routes to proxy CoinGecko requests (avoids CORS issues)
const COINGECKO_PRICE_API = '/api/coingecko/price';
const COINGECKO_CANDLES_API = '/api/coingecko/candles';

// Map market names to CoinGecko IDs
const MARKET_TO_COINGECKO: Record<string, string> = {
  'BTC/USD': 'bitcoin',
  'ETH/USD': 'ethereum',
  'ARB/USD': 'arbitrum',
  'btc': 'bitcoin',
  'eth': 'ethereum',
  'arb': 'arbitrum',
};

export interface CoinGeckoPrice {
  price: number;
  change24h: number;
  change24hPercent: number;
  lastUpdated: number;
}

export function useCoinGeckoPrice(marketName: string) {
  const [price, setPrice] = useState<number>(0);
  const [change24h, setChange24h] = useState<number>(0);
  const [change24hPercent, setChange24hPercent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!marketName) {
      setIsLoading(false);
      return;
    }

    // Skip if marketName looks like a contract address (starts with 0x)
    if (marketName.startsWith('0x')) {
      console.warn('useCoinGeckoPrice received contract address instead of market name:', marketName);
      setIsLoading(false);
      return;
    }

    // Get CoinGecko ID from market name
    const marketKey = marketName.toLowerCase();
    const coinId = MARKET_TO_COINGECKO[marketKey] ||
                   MARKET_TO_COINGECKO[marketName];

    if (!coinId) {
      console.warn('Unknown market name for CoinGecko:', marketName);
      setError('Market not supported');
      setIsLoading(false);
      return;
    }

    const fetchPrice = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch simple price with 24h change via Next.js API route (proxies to CoinGecko)
        const response = await fetch(
          `${COINGECKO_PRICE_API}?coinId=${coinId}`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`CoinGecko API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data[coinId]) {
          const coinData = data[coinId];
          const newPrice = coinData.usd || 0;
          const newChange = coinData.usd_24h_change || 0;
          
          if (newPrice > 0) {
            setPrice(newPrice);
            setChange24h(newChange);
            setChange24hPercent(newChange);
            console.log(`CoinGecko price updated for ${coinId}: $${newPrice}`);
          } else {
            throw new Error('Price is 0');
          }
        } else {
          throw new Error(`Price data not found for ${coinId}`);
        }
      } catch (err: any) {
        console.error('CoinGecko price fetch error:', err);
        setError(err.message || 'Failed to fetch price');
        // Don't reset price to 0 on error, keep last known price
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch immediately
    fetchPrice();

    // Set up polling every 10 seconds
    const interval = setInterval(fetchPrice, 10000);

    return () => clearInterval(interval);
  }, [marketName]);

  return {
    price,
    change24h,
    change24hPercent,
    isLoading,
    error,
    refetch: () => {
      // Trigger refetch by updating a dependency
      setPrice(prev => prev); // This will cause useEffect to re-run
    },
  };
}

// Hook for candlestick data
export function useCoinGeckoCandles(marketName: string, days: number = 1) {
  const [candles, setCandles] = useState<Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!marketName) {
      setIsLoading(false);
      return;
    }

    const marketKey = marketName.toLowerCase();
    const coinId = MARKET_TO_COINGECKO[marketKey] || 
                   MARKET_TO_COINGECKO[marketName] ||
                   marketKey.split('/')[0].toLowerCase();

    if (!coinId) {
      setError('Market not supported');
      setIsLoading(false);
      return;
    }

    const fetchCandles = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch market chart data via Next.js API route (proxies to CoinGecko)
        // days: 1 = 24h, 7 = 7d, 30 = 30d
        const response = await fetch(
          `${COINGECKO_CANDLES_API}?coinId=${coinId}&days=${days}`
        );

        if (!response.ok) {
          throw new Error(`CoinGecko API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Handle new API format: { prices: [...] } with OHLC data
        if (data.prices && Array.isArray(data.prices) && data.prices.length > 0) {
          // Check if it's OHLC format: [{ time, open, high, low, close }, ...]
          if (typeof data.prices[0] === 'object' && 'time' in data.prices[0]) {
            // Already in the correct format from API route
            setCandles(data.prices);
          } else {
            // Legacy format: [timestamp, price] arrays - convert to OHLC
            const prices = data.prices as Array<[number, number]>;
            
            // Group by hour and create candles
            const candleMap = new Map<number, {
              time: number;
              open: number;
              high: number;
              low: number;
              close: number;
              prices: number[];
            }>();

            prices.forEach(([timestamp, price]) => {
              // Round to nearest hour
              const hour = Math.floor(timestamp / 1000 / 3600) * 3600;
              
              if (!candleMap.has(hour)) {
                candleMap.set(hour, {
                  time: hour,
                  open: price,
                  high: price,
                  low: price,
                  close: price,
                  prices: [price],
                });
              } else {
                const candle = candleMap.get(hour)!;
                candle.high = Math.max(candle.high, price);
                candle.low = Math.min(candle.low, price);
                candle.close = price;
                candle.prices.push(price);
              }
            });

            // Convert to array
            const candlesArray = Array.from(candleMap.values())
              .sort((a, b) => a.time - b.time)
              .map(candle => ({
                time: candle.time,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
              }));

            setCandles(candlesArray);
          }
        } else if (data.error) {
          // API returned an error but with 200 status (graceful fallback)
          console.warn('CoinGecko candles API error:', data.error);
          setError(data.error);
          // Don't throw, just set error state
        } else {
          throw new Error('Invalid candle data format');
        }
      } catch (err: any) {
        console.error('CoinGecko candles fetch error:', err);
        setError(err.message || 'Failed to fetch candles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandles();

    // Refresh every 5 minutes
    const interval = setInterval(fetchCandles, 300000);

    return () => clearInterval(interval);
  }, [marketName, days]);

  return {
    candles,
    isLoading,
    error,
  };
}

