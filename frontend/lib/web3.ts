import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
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

// Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks: [config.monadTestnet],
  projectId: config.projectId,
})

// Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [config.monadTestnet],
  projectId: config.projectId,
  metadata: {
    name: 'Perp-X',
    description: 'Leveraged Prediction Markets on Monad',
    url: 'https://perp-x.xyz',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  },
  features: {
    analytics: true,
  }
})

export const wagmiConfig = wagmiAdapter.wagmiConfig
