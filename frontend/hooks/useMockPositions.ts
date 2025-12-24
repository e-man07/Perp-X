'use client'

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { config } from '@/lib/config';

export interface MockPosition {
  id: string;
  user: string;
  market: string;
  marketName: string;
  direction: 0 | 1; // 0 = LONG, 1 = SHORT
  collateralUSD: number;
  leverage: number;
  positionSize: number;
  entryPrice: number;
  currentPrice: number;
  openedAt: number;
  status: number; // 0 = OPEN
  pnl: number;
  pnlPercent: number;
  liquidationPrice: number;
}

const STORAGE_KEY = 'perp-x-mock-positions';

// Global state to share positions across all hook instances
let globalPositions: MockPosition[] = [];
let globalListeners: Set<() => void> = new Set();

// Function to notify all listeners
const notifyListeners = () => {
  globalListeners.forEach(listener => listener());
};

// Function to load from localStorage
const loadFromStorage = (): MockPosition[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse positions from localStorage:', e);
      return [];
    }
  }
  return [];
};

// Function to save to localStorage
const saveToStorage = (positions: MockPosition[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    globalPositions = positions;
    notifyListeners();
  }
};

export function useMockPositions() {
  const { address } = useAccount();
  const [positions, setPositions] = useState<MockPosition[]>(() => {
    // Initialize from global state or localStorage
    if (globalPositions.length > 0) {
      return globalPositions;
    }
    return loadFromStorage();
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh function
  const forceRefresh = useCallback(() => {
    const loaded = loadFromStorage();
    setPositions(loaded);
    globalPositions = loaded;
    setRefreshKey(prev => prev + 1);
    console.log('Force refreshed positions:', loaded.length);
  }, []);

  // Load positions from localStorage on mount and when address changes
  useEffect(() => {
    const loaded = loadFromStorage();
    setPositions(loaded);
    globalPositions = loaded;
    setIsLoading(false);
    console.log('Loaded mock positions from localStorage:', loaded.length, 'positions');
  }, [address, refreshKey]); // Reload when address changes or refresh is triggered

  // Register listener for global updates
  useEffect(() => {
    const listener = () => {
      const loaded = loadFromStorage();
      setPositions(loaded);
      globalPositions = loaded;
      console.log('Global update received, positions:', loaded.length);
    };
    
    globalListeners.add(listener);
    return () => {
      globalListeners.delete(listener);
    };
  }, []);

  // Save positions to localStorage whenever they change
  useEffect(() => {
    if (positions.length > 0 || globalPositions.length > 0) {
      saveToStorage(positions);
      console.log('Saved positions to localStorage:', positions.length);
    }
  }, [positions]);

  // Listen for storage changes and custom events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            console.log('Storage changed, reloading positions:', parsed.length);
            setPositions(parsed);
            globalPositions = parsed;
            notifyListeners();
          } catch (err) {
            console.error('Failed to parse storage change:', err);
          }
        }
      };

      const handleMockPositionCreated = () => {
        console.log('Mock position created event received, forcing refresh...');
        forceRefresh();
      };

      const handleMockPositionsUpdated = () => {
        console.log('Mock positions updated event received, forcing refresh...');
        forceRefresh();
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('mockPositionCreated', handleMockPositionCreated);
      window.addEventListener('mockPositionsUpdated', handleMockPositionsUpdated);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('mockPositionCreated', handleMockPositionCreated);
        window.removeEventListener('mockPositionsUpdated', handleMockPositionsUpdated);
      };
    }
  }, [address, forceRefresh]); // Re-setup listeners when address changes

  const addMockPosition = (position: Omit<MockPosition, 'id' | 'openedAt' | 'status' | 'pnl' | 'pnlPercent'>) => {
    const newPosition: MockPosition = {
      ...position,
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      openedAt: Date.now(),
      status: 0, // OPEN
      pnl: 0, // Will be calculated based on current price
      pnlPercent: 0,
    };
    console.log('Adding mock position:', newPosition);
    
    // Update both local and global state
    const currentPositions = loadFromStorage();
    const updated = [...currentPositions, newPosition];
    
    // Save to localStorage and update global state
    saveToStorage(updated);
    setPositions(updated);
    globalPositions = updated;
    
    console.log('Updated positions array:', updated.length, 'positions');
    
    // Dispatch events to notify all components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mockPositionCreated', { 
        detail: { positionId: newPosition.id, position: newPosition } 
      }));
      window.dispatchEvent(new CustomEvent('mockPositionsUpdated', {
        detail: { count: updated.length }
      }));
    }
    
    return newPosition.id;
  };

  const removeMockPosition = (id: string) => {
    setPositions(prev => prev.filter(p => p.id !== id));
  };

  const updateMockPositionPrice = (id: string, currentPrice: number) => {
    setPositions(prev => prev.map(p => {
      if (p.id === id) {
        const priceChange = currentPrice - p.entryPrice;
        const pnl = p.direction === 0 
          ? (priceChange / p.entryPrice) * p.positionSize // LONG: profit when price goes up
          : (-priceChange / p.entryPrice) * p.positionSize; // SHORT: profit when price goes down
        const pnlPercent = (pnl / p.collateralUSD) * 100;
        return { ...p, currentPrice, pnl, pnlPercent };
      }
      return p;
    }));
  };

  // Filter positions by user address
  const userPositions = positions.filter(p => {
    if (!address) return false;
    const matches = p.user.toLowerCase() === address.toLowerCase();
    if (!matches) {
      console.log('Position filtered out - address mismatch:', {
        positionUser: p.user,
        currentAddress: address,
        market: p.marketName
      });
    }
    return matches;
  });

  console.log('useMockPositions - all positions:', positions.length, 'user positions:', userPositions.length, 'address:', address);
  if (positions.length > 0 && userPositions.length === 0) {
    console.warn('⚠️ Positions exist but none match current address!', {
      allPositions: positions.map(p => ({ id: p.id, user: p.user, market: p.marketName })),
      currentAddress: address
    });
  }

  return {
    positions: userPositions,
    addMockPosition,
    removeMockPosition,
    updateMockPositionPrice,
    refetch: forceRefresh, // Force refresh from localStorage
    isLoading,
    forceRefresh, // Expose force refresh function
  };
}

