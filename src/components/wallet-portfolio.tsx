import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Eye, 
  Users,
  BarChart3,
  Activity,
  DollarSign,
  Percent
} from 'lucide-react';
import { useBaseSocial } from '@/hooks/useMiniKit';

interface WalletPortfolioProps {
  walletAddress: string;
  cryptocurrencies: any[];
}

interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  logoURI?: string;
  usdValue?: number;
}

export function WalletPortfolio({ walletAddress, cryptocurrencies }: WalletPortfolioProps) {
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalChange24h, setTotalChange24h] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { sharePortfolio } = useBaseSocial();

  // Mock Base network token addresses for demo
  const baseTokens = {
    'ETH': '0x0000000000000000000000000000000000000000',
    'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    'DAI': '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    'WETH': '0x4200000000000000000000000000000000000006',
    'cbETH': '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
  };

  useEffect(() => {
    fetchWalletBalances();
  }, [walletAddress]);

  const fetchWalletBalances = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call Base RPC or indexing service
      // For demo purposes, we'll simulate some token balances
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockBalances: TokenBalance[] = [
        {
          address: baseTokens.ETH,
          symbol: 'ETH',
          name: 'Ethereum',
          balance: '2.45',
          decimals: 18,
          logoURI: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png',
          usdValue: 2.45 * 3800 // Mock ETH price
        },
        {
          address: baseTokens.USDC,
          symbol: 'USDC',
          name: 'USD Coin',
          balance: '1245.67',
          decimals: 6,
          logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
          usdValue: 1245.67
        },
        {
          address: baseTokens.cbETH,
          symbol: 'cbETH',
          name: 'Coinbase Wrapped Staked ETH',
          balance: '0.89',
          decimals: 18,
          logoURI: 'https://assets.coingecko.com/coins/images/27008/thumb/cbeth.png',
          usdValue: 0.89 * 3850 // Mock cbETH price
        }
      ];
      
      setTokenBalances(mockBalances);
      const total = mockBalances.reduce((sum, token) => sum + (token.usdValue || 0), 0);
      setTotalValue(total);
      setTotalChange24h(Math.random() * 10 - 5); // Mock 24h change
      
    } catch (err) {
      setError('Failed to fetch wallet balances');
      console.error('Error fetching wallet balances:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBalance = (balance: string, decimals: number) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.01) return '< 0.01';
    return num.toFixed(decimals > 6 ? 6 : 2);
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  if (error) {
    return (
      <Card className="bg-based-surface border-border">
        <div className="p-6 text-center">
          <Wallet className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Portfolio Error</h3>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <Button onClick={fetchWalletBalances} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-based-surface border-border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-foreground">Wallet Portfolio</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Activity className="w-3 h-3" />
              <span>Live</span>
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => sharePortfolio(formatUSD(totalValue))}
              className="p-1"
            >
              <Users className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchWalletBalances}
              className="p-1"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Portfolio Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatUSD(totalValue)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">24h Change</p>
                  <p className={`text-lg font-semibold flex items-center ${getChangeColor(totalChange24h)}`}>
                    {totalChange24h > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {totalChange24h > 0 ? '+' : ''}{totalChange24h.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Token Balances */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground">Token Balances</h4>
                <Badge variant="outline">{tokenBalances.length} tokens</Badge>
              </div>
              
              {tokenBalances.length > 0 ? (
                tokenBalances.map((token, index) => (
                  <div 
                    key={`${token.address}-${index}`}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {token.logoURI && (
                        <img 
                          src={token.logoURI} 
                          alt={token.symbol} 
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{token.symbol}</p>
                        <p className="text-sm text-muted-foreground">{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatBalance(token.balance, token.decimals)} {token.symbol}
                      </p>
                      {token.usdValue && (
                        <p className="text-sm text-muted-foreground">
                          {formatUSD(token.usdValue)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-muted-foreground">No tokens found</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              <Button variant="outline" size="sm" className="flex-1">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                History
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}