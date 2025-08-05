import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface TokenBalance {
  address: string;
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
  value?: number;
  priceChange24h?: number;
  logo?: string;
}

interface WalletAssetsDisplayProps {
  connectedAddress: string | null;
  provider?: any;
}

export function WalletAssetsDisplay({ connectedAddress, provider }: WalletAssetsDisplayProps) {
  const [assets, setAssets] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connectedAddress && provider) {
      fetchWalletAssets();
    } else {
      setAssets([]);
      setTotalValue(0);
    }
  }, [connectedAddress, provider]);

  const fetchWalletAssets = async () => {
    if (!connectedAddress || !provider) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get ETH balance
      const ethBalance = await provider.request({
        method: 'eth_getBalance',
        params: [connectedAddress, 'latest']
      });

      const ethBalanceInEther = parseInt(ethBalance, 16) / Math.pow(10, 18);

      // Simulate fetching token balances and prices
      // In a real implementation, you would:
      // 1. Query token balances using multicall or individual contract calls
      // 2. Get current prices from CoinGecko or similar API
      // 3. Calculate USD values

      const mockAssets: TokenBalance[] = [
        {
          address: '0x0000000000000000000000000000000000000000',
          name: 'Ethereum',
          symbol: 'ETH',
          balance: ethBalanceInEther.toFixed(6),
          decimals: 18,
          value: ethBalanceInEther * 3400, // Mock ETH price
          priceChange24h: 2.5,
          logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
        }
      ];

      // Add some common Base tokens (mock data)
      if (ethBalanceInEther > 0) {
        mockAssets.push(
          {
            address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
            name: 'USD Coin',
            symbol: 'USDC',
            balance: (Math.random() * 1000).toFixed(2),
            decimals: 6,
            value: Math.random() * 1000,
            priceChange24h: 0.1,
            logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
          },
          {
            address: '0x4ed4e862860bed51a9570b96d89af5e1b0efefed',
            name: 'Degen',
            symbol: 'DEGEN',
            balance: (Math.random() * 10000).toFixed(0),
            decimals: 18,
            value: Math.random() * 500,
            priceChange24h: -5.2,
            logo: 'https://cryptologos.cc/logos/versions/degen-degen-logo-full.png'
          }
        );
      }

      setAssets(mockAssets);
      setTotalValue(mockAssets.reduce((sum, asset) => sum + (asset.value || 0), 0));

    } catch (err) {
      console.error('Error fetching wallet assets:', err);
      setError('Failed to load wallet assets');
      setAssets([]);
      setTotalValue(0);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBalance = (balance: string, decimals: number) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.01) return '<0.01';
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(2);
    return (num / 1000).toFixed(1) + 'K';
  };

  const formatValue = (value: number) => {
    if (value < 0.01) return '$<0.01';
    if (value < 1000) return `$${value.toFixed(2)}`;
    if (value < 1000000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${(value / 1000000).toFixed(1)}M`;
  };

  if (!connectedAddress) {
    return null;
  }

  return (
    <Card className="w-full" data-testid="wallet-assets-display">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Wallet Assets
        </CardTitle>
        {!isLoading && !error && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-2xl font-bold">{formatValue(totalValue)}</span>
            <Badge variant="secondary" className="text-xs">
              Total Value
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{error}</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No assets found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assets.map((asset, index) => (
              <div 
                key={asset.address || index} 
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                data-testid={`asset-${asset.symbol.toLowerCase()}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {asset.logo ? (
                      <img 
                        src={asset.logo} 
                        alt={asset.symbol}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="16" cy="16" r="16" fill="#f3f4f6"/>
                              <text x="16" y="20" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#6b7280">
                                ${asset.symbol}
                              </text>
                            </svg>
                          `)}`;
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs font-medium">{asset.symbol.slice(0, 2)}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{asset.symbol}</div>
                    <div className="text-sm text-muted-foreground">{asset.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatBalance(asset.balance, asset.decimals)} {asset.symbol}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {asset.value && (
                      <span className="text-muted-foreground">
                        {formatValue(asset.value)}
                      </span>
                    )}
                    {asset.priceChange24h !== undefined && (
                      <div className={`flex items-center gap-1 ${
                        asset.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {asset.priceChange24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{Math.abs(asset.priceChange24h).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {connectedAddress && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground">Connected Wallet</div>
            <div className="font-mono text-sm mt-1">
              {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}