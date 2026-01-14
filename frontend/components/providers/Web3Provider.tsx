'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { WagmiProvider, type Config } from 'wagmi'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient, initializeWeb3 } from '@/lib/web3'
import { NetworkGuard } from './NetworkGuard'

export function Web3Provider({ children }: { children: ReactNode }) {
  const [wagmiConfig, setWagmiConfig] = useState<Config | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const config = await initializeWeb3()
        setWagmiConfig(config)
      } catch (error) {
        console.error('Failed to initialize Web3Provider:', error)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  // Show loading state while initializing
  if (isLoading || !wagmiConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-gray-700 border-t-white animate-spin" />
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    )
  }

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
