import React from 'react';
import { WalletConnectButton } from './wallet-connect-button';
import { useMiniKit } from "@/hooks/useMiniKit";

export function BaseAuthIntegration() {
  const { isInBaseApp } = useMiniKit();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <WalletConnectButton />
    </div>
  );
}