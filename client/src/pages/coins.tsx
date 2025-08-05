import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CryptoChartModal } from '@/components/crypto-chart-modal';
import { ThemeToggle } from '@/components/theme-toggle';
import { CoinbaseWallet } from '@/components/coinbase-wallet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Search, ArrowUpDown, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import type { Cryptocurrency } from '@shared/schema';
import { Link } from 'wouter';

export function Coins() {
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('market_cap_rank');
  const [currentPage, setCurrentPage] = useState(1);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const itemsPerPage = 100;

  // Fetch top 100 cryptocurrencies
  const { data: cryptocurrencies = [], isLoading, error } = useQuery<Cryptocurrency[]>({
    queryKey: ['/api/cryptocurrencies', { per_page: itemsPerPage, page: currentPage, includeStablecoins: true }],
    queryFn: async () => {
      const params = new URLSearchParams({
        per_page: itemsPerPage.toString(),
        page: currentPage.toString(),
        includeStablecoins: 'true'
      });
      const response = await fetch(`/api/cryptocurrencies?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cryptocurrencies');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Filter cryptocurrencies based on search
  const filteredCryptos = cryptocurrencies.filter((crypto) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      crypto.name.toLowerCase().includes(query) ||
      crypto.symbol.toLowerCase().includes(query)
    );
  });

  // Sort cryptocurrencies
  const sortedCryptos = [...filteredCryptos].sort((a, b) => {
    switch (sortBy) {
      case 'market_cap_rank':
        return (a.marketCapRank || 999999) - (b.marketCapRank || 999999);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return parseFloat(b.currentPrice || '0') - parseFloat(a.currentPrice || '0');
      case 'change':
        return parseFloat(b.priceChangePercentage24h || '0') - parseFloat(a.priceChangePercentage24h || '0');
      case 'volume':
        return parseFloat(b.volume24h || '0') - parseFloat(a.volume24h || '0');
      case 'market_cap':
        return parseFloat(b.marketCap || '0') - parseFloat(a.marketCap || '0');
      default:
        return 0;
    }
  });

  const handleCryptoClick = (crypto: Cryptocurrency) => {
    setSelectedCrypto(crypto);
    setIsChartModalOpen(true);
  };

  const handleAccountChange = (account: string | null) => {
    setConnectedAccount(account);
  };

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return '$0.00';
    const num = parseFloat(price);
    if (num >= 1) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 8
    }).format(num);
  };

  const formatVolume = (volume: string | null | undefined) => {
    if (!volume) return '$0';
    const num = parseFloat(volume);
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(1)}B`;
    }
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(1)}M`;
    }
    return `$${(num / 1e3).toFixed(1)}K`;
  };

  const formatMarketCap = (marketCap: string | null | undefined) => {
    if (!marketCap) return '$0';
    const num = parseFloat(marketCap);
    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(2)}T`;
    }
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(1)}B`;
    }
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(1)}M`;
    }
    return `$${(num / 1e3).toFixed(1)}K`;
  };

  const formatPercentage = (percentage: string | null | undefined) => {
    if (!percentage) return '0.00%';
    const num = parseFloat(percentage);
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Back to News
                </Button>
              </Link>
              <div className="bg-blue-600 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Top Cryptocurrencies
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time prices for top 100 cryptocurrencies
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <CoinbaseWallet onAccountChange={handleAccountChange} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Sort Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search cryptocurrencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market_cap_rank">Rank</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="change">24h Change</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
              <SelectItem value="market_cap">Market Cap</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cryptocurrency Table */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-8">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Failed to load cryptocurrency data. Please try again.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {/* Table Header for Desktop */}
            <div className="hidden lg:grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400">
              <div className="col-span-1">#</div>
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2">24h Change</div>
              <div className="col-span-2">Volume (24h)</div>
              <div className="col-span-2">Market Cap</div>
            </div>

            {/* Cryptocurrency Rows */}
            {sortedCryptos.map((crypto) => {
              const isPositive = parseFloat(crypto.priceChangePercentage24h || '0') >= 0;
              
              return (
                <Card 
                  key={crypto.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => handleCryptoClick(crypto)}
                >
                  {/* Desktop Layout */}
                  <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 text-gray-600 dark:text-gray-400 font-mono text-sm">
                      {crypto.marketCapRank}
                    </div>
                    <div className="col-span-3 flex items-center space-x-3">
                      {crypto.image ? (
                        <img 
                          src={crypto.image} 
                          alt={crypto.name}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {crypto.symbol?.slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {crypto.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {crypto.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 font-mono font-semibold text-gray-900 dark:text-white">
                      {formatPrice(crypto.currentPrice)}
                    </div>
                    <div className={`col-span-2 font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercentage(crypto.priceChangePercentage24h)}
                    </div>
                    <div className="col-span-2 text-gray-600 dark:text-gray-400">
                      {formatVolume(crypto.volume24h)}
                    </div>
                    <div className="col-span-2 text-gray-600 dark:text-gray-400">
                      {formatMarketCap(crypto.marketCap)}
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="lg:hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          #{crypto.marketCapRank}
                        </span>
                        {crypto.image ? (
                          <img 
                            src={crypto.image} 
                            alt={crypto.name}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : null}
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            {crypto.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {crypto.symbol}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold text-gray-900 dark:text-white text-sm">
                          {formatPrice(crypto.currentPrice)}
                        </div>
                        <div className={`text-xs font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                          {formatPercentage(crypto.priceChangePercentage24h)}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Vol: {formatVolume(crypto.volume24h)}</span>
                      <span>MCap: {formatMarketCap(crypto.marketCap)}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination (if needed for future expansion) */}
        {sortedCryptos.length === 0 && searchQuery && (
          <Card className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No cryptocurrencies found matching "{searchQuery}"
            </p>
          </Card>
        )}
      </main>

      {/* Chart Modal */}
      <CryptoChartModal 
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        cryptocurrency={selectedCrypto}
      />
    </div>
  );
}