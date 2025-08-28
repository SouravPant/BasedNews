import React from 'react';
import { 
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { color } from '@coinbase/onchainkit/theme';
import { useAccount, useDisconnect } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet as WalletIcon, 
  ExternalLink,
  Settings,
  LogOut,
  Activity
} from 'lucide-react';

export function BaseWalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();

  // If wallet is not connected, show connection UI
  if (!isConnected) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <WalletIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            🔗 Connect your wallet to view portfolio
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            Connect your Base wallet to track your portfolio, get personalized insights, and access advanced features.
          </p>
          
          {/* OnchainKit Wallet Component */}
          <div className="flex justify-center mb-4">
            <Wallet>
              <ConnectWallet className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                <WalletIcon className="w-4 h-4 mr-2" />
                Connect Wallet
              </ConnectWallet>
            </Wallet>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Base Mainnet
            </span>
            <span>•</span>
            <span>Secure & Decentralized</span>
          </div>
        </div>
      </Card>
    );
  }

  // If wallet is connected, show wallet info
  return (
    <div className="space-y-4">
      {/* Wallet Status Card */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                <WalletIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Wallet Connected
                  </span>
                  <Badge variant={chain?.id === 8453 ? "default" : "destructive"} className="text-xs">
                    <Activity className="w-3 h-3 mr-1" />
                    {chain?.id === 8453 ? 'Base' : chain?.name || 'Unknown'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
              </div>
            </div>
            
            {/* OnchainKit Wallet Dropdown */}
            <Wallet>
              <Identity 
                address={address}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Avatar className="w-8 h-8" />
                <Name />
                <EthBalance />
              </Identity>
              <WalletDropdown>
                <Identity 
                  address={address}
                  hasCopyAddressOnClick={true}
                  className="p-4 border-b border-gray-200 dark:border-gray-700"
                >
                  <Avatar className="w-10 h-10" />
                  <div className="ml-3">
                    <Name className="font-medium text-gray-900 dark:text-white" />
                    <EthBalance className="text-sm text-gray-600 dark:text-gray-400" />
                  </div>
                </Identity>
                
                <div className="p-2 space-y-1">
                  <WalletDropdownLink
                    icon="wallet"
                    href="https://wallet.coinbase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Wallet Dashboard
                    </div>
                  </WalletDropdownLink>
                  
                  <WalletDropdownLink
                    icon="settings"
                    href={`https://basescan.org/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      View on BaseScan
                    </div>
                  </WalletDropdownLink>
                  
                  <WalletDropdownDisconnect className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <div className="flex items-center">
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect
                    </div>
                  </WalletDropdownDisconnect>
                </div>
              </WalletDropdown>
            </Wallet>
          </div>
        </div>
      </Card>
    </div>
  );
}