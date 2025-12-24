'use client'

import { wagmiConfig, queryClient } from '@/lib/web3'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider } from '@tanstack/react-query'
import { NetworkGuard } from './NetworkGuard'

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <NetworkGuard>
          {children}
        </NetworkGuard>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
