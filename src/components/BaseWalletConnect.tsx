import React from 'react';
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

// Simple wallet connector for testing
async function connectSimpleWallet() {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    try {
      const accounts = await (window as any).ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      return accounts[0];
    } catch (error) {
      throw error;
    }
  }
  throw new Error('No wallet found');
}

export function BaseWalletConnect() {
  const [isConnected, setIsConnected] = React.useState(false);
  const [address, setAddress] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

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
          
          {/* Simple Wallet Connection */}
          <div className="flex justify-center mb-4">
            <Button 
              onClick={async () => {
                setError(null);
                try {
                  const account = await connectSimpleWallet();
                  setAddress(account);
                  setIsConnected(true);
                  alert('✅ Wallet Connected!\nAddress: ' + account);
                } catch (err: any) {
                  setError(err.message);
                  alert('❌ Connection failed: ' + err.message);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              <WalletIcon className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm text-center mb-4">
              {error}
            </div>
          )}
          
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
                    ✅ Wallet Connected
                  </span>
                  <Badge variant="default" className="text-xs">
                    <Activity className="w-3 h-3 mr-1" />
                    Base Ready
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsConnected(false);
                setAddress(null);
                setError(null);
              }}
              className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}