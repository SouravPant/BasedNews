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
import { useMiniKit } from '@/hooks/useMiniKit';

export function BaseWalletConnect() {
  const { wallet, connectWallet, disconnectWallet } = useMiniKit();

  // If wallet is not connected, show connection UI
  if (!wallet?.isConnected) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <WalletIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Portfolio Overview
          </h3>
          
          {/* Wallet Connection Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <Button 
              onClick={async () => {
                try {
                  await connectWallet();
                  console.log('Coinbase Wallet connected');
                } catch (error) {
                  console.error('Coinbase connection failed:', error);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 h-auto flex flex-col items-center gap-2"
            >
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xs font-bold">CB</span>
              </div>
              <span>Coinbase Wallet</span>
            </Button>
            
            <Button 
              onClick={async () => {
                try {
                  if (window.ethereum && (window.ethereum as any).isMetaMask) {
                    await connectWallet();
                    console.log('MetaMask connected');
                  } else {
                    window.open('https://metamask.io/', '_blank');
                  }
                } catch (error) {
                  console.error('MetaMask connection failed:', error);
                }
              }}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50 p-4 h-auto flex flex-col items-center gap-2"
            >
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <span>MetaMask</span>
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Total Value: <span className="font-bold text-2xl text-gray-900 dark:text-white">$0.00</span>
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Base Mainnet
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // If wallet is connected, show portfolio value
  const [portfolioValue, setPortfolioValue] = React.useState<number>(0);
  const [tokens, setTokens] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch portfolio data when wallet is connected
  React.useEffect(() => {
    if (wallet?.address) {
      fetchPortfolioData();
    }
  }, [wallet?.address]);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Mock Base ecosystem tokens for demonstration
      // In real implementation, this would fetch from Base RPC
      const mockTokens = [
        { symbol: 'ETH', balance: '1.2345', price: 3800, value: 4691.1 },
        { symbol: 'USDC', balance: '500.00', price: 1, value: 500.0 },
        { symbol: 'DEGEN', balance: '1000.0', price: 0.045, value: 45.0 },
      ];
      
      const totalValue = mockTokens.reduce((sum, token) => sum + token.value, 0);
      
      setTokens(mockTokens);
      setPortfolioValue(totalValue);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Portfolio Overview */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
                <WalletIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Portfolio Overview
                </h3>
                <div className="flex items-center space-x-2">
                  <Badge variant={wallet?.chainId === 8453 ? "default" : "destructive"} className="text-xs">
                    <Activity className="w-3 h-3 mr-1" />
                    {wallet?.chainId === 8453 ? 'Base' : `Chain ${wallet?.chainId}`}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {wallet?.address?.slice(0, 6)}...{wallet?.address?.slice(-4)}
                  </span>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={disconnectWallet}
              className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>

          {/* Total Value */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Value</p>
            {loading ? (
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
            <p className="text-sm text-green-600">+2.5% 24h</p>
          </div>

          {/* Token List */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Holdings</h4>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))
            ) : (
              tokens.map((token, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">
                        {token.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{token.symbol}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{token.balance}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${token.value.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ${token.price.toFixed(token.price < 1 ? 3 : 2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on BaseScan
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={fetchPortfolioData}>
              <Activity className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}