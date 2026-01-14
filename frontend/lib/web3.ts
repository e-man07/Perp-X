'use client'

import { QueryClient } from '@tanstack/react-query'
import { config } from './config'

// Setup queryClient with rate limit handling
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on 429 (rate limit) errors - wait longer
        if (error?.status === 429 || error?.code === 429) {
          return false;
        }
        // Retry other errors up to 3 times
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s
        return Math.min(1000 * 2 ** attemptIndex, 10000);
      },
    },
  },
})

// These will be initialized on the client side only
let wagmiAdapter: any = null;
let wagmiConfig: any = null;
let appKitInitialized = false;

// Initialize web3 on client side only
export async function initializeWeb3() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (appKitInitialized && wagmiConfig) {
    return wagmiConfig;
  }

  try {
    const { createAppKit } = await import('@reown/appkit/react');
    const { WagmiAdapter } = await import('@reown/appkit-adapter-wagmi');

    // Create Wagmi Adapter for Arbitrum Sepolia
    wagmiAdapter = new WagmiAdapter({
      networks: [config.arbitrumSepolia],
      projectId: config.projectId,
    });

    // Create modal
    createAppKit({
      adapters: [wagmiAdapter],
      networks: [config.arbitrumSepolia],
      projectId: config.projectId,
      metadata: {
        name: 'Perp-X',
        description: 'Leveraged Prediction Markets on Arbitrum',
        url: 'https://perp-x.xyz',
        icons: ['https://avatars.githubusercontent.com/u/37784886']
      },
      features: {
        analytics: true,
      }
    });

    wagmiConfig = wagmiAdapter.wagmiConfig;
    appKitInitialized = true;

    return wagmiConfig;
  } catch (error) {
    console.error('Failed to initialize web3:', error);
    return null;
  }
}

// Export getter for wagmiConfig (for components that need it synchronously after init)
export function getWagmiConfig() {
  return wagmiConfig;
}

export { wagmiAdapter, wagmiConfig };
