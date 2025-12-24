'use client'

import { useEffect, useState } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { config } from '@/lib/config';

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const targetChainId = config.monadTestnet.id;
  const [hasAttemptedSwitch, setHasAttemptedSwitch] = useState(false);

  const isWrongNetwork = isConnected && chainId !== targetChainId;

  useEffect(() => {
    // Only attempt to switch once per connection
    if (isWrongNetwork && !hasAttemptedSwitch && !isSwitching) {
      setHasAttemptedSwitch(true);
      // Automatically switch to Monad Testnet if connected to wrong network
      try {
        switchChain({ chainId: targetChainId });
      } catch (error) {
        console.error('Failed to switch network:', error);
        // Reset attempt flag after a delay to allow retry
        setTimeout(() => setHasAttemptedSwitch(false), 3000);
      }
    }
    
    // Reset attempt flag when network is correct
    if (chainId === targetChainId) {
      setHasAttemptedSwitch(false);
    }
  }, [isWrongNetwork, hasAttemptedSwitch, isSwitching, chainId, targetChainId, switchChain]);

  return <>{children}</>;
}

