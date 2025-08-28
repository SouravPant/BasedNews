import React, { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

// Base mainnet configuration
const baseMainnet = {
  ...base,
  id: 8453,
  name: 'Base',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.base.org'],
    },
    public: {
      http: ['https://mainnet.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://basescan.org',
    },
  },
};

// Wagmi configuration
const wagmiConfig = createConfig({
  chains: [baseMainnet, baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'BasedHub - Base Ecosystem Tracker',
      preference: 'smartWalletOnly', // Use smart wallet for better UX
    }),
  ],
  ssr: true,
  transports: {
    [baseMainnet.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http(),
  },
});

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

interface BaseWalletProviderProps {
  children: ReactNode;
}

export function BaseWalletProvider({ children }: BaseWalletProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || process.env.VITE_ONCHAINKIT_API_KEY}
          chain={baseMainnet}
          config={{
            appearance: {
              mode: 'auto', // 'light' | 'dark' | 'auto'
              theme: 'base', // 'default' | 'base' | 'cyberpunk'
            },
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}