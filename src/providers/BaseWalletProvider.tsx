import React, { ReactNode } from 'react';

interface BaseWalletProviderProps {
  children: ReactNode;
}

// Simplified provider for testing
export function BaseWalletProvider({ children }: BaseWalletProviderProps) {
  return (
    <div data-base-wallet-provider="true">
      {children}
    </div>
  );
}