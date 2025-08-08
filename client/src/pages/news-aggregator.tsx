import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NewsArticle } from '@/components/news-article';
import { NewsArticleModal } from '@/components/news-article-modal';
import { WalletAssetsDisplay } from '@/components/wallet-assets-display';
import { CoinbaseWallet } from '@/components/coinbase-wallet';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, Globe, Search, Coins } from 'lucide-react';
import type { NewsArticle as NewsArticleType } from '@shared/schema';
import { Link } from 'wouter';
import { useWallet } from '@/hooks/useMiniKit';

interface FilterState {
  dateRange: string;
  sentiment: string;
  category: string;
  sortBy: string;
}

export function NewsAggregator() {
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticleType | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'all',
    sentiment: 'all',
    category: 'all',
    sortBy: 'relevance'
  });

  const { wallet, isConnected } = useWallet();

  // Fetch news articles
  const { data: news = [], isLoading: newsLoading, error: newsError } = useQuery({
    queryKey: ['/api/news', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.sentiment !== 'all') params.append('sentiment', filters.sentiment);
      if (filters.category !== 'all') params.append('category', filters.category);
      params.append('limit', '30');
      
      const response = await fetch(`/api/news?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch cryptocurrencies for search suggestions
  const { data: cryptos = [] } = useQuery({
    queryKey: ['/api/cryptocurrencies'],
    refetchInterval: 30000,
  });

  // Filter news based on search query
  const filteredNews = (news as NewsArticleType[]).filter((article: NewsArticleType) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.description?.toLowerCase().includes(query) ||
      article.source.toLowerCase().includes(query)
    );
  });

  const handleAccountChange = (account: string | null) => {
    setConnectedAccount(account);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/coins">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Top 100 Coins
                </Button>
              </Link>
              <div className="bg-blue-600 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  BasedNews
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Based news aggregator
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
        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crypto news, coins, or topics..."
              className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          

        </div>

        {/* Welcome Message for Connected Users */}
        {connectedAccount && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  Welcome to BasedNews!
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Stay updated with the latest cryptocurrency news and market insights.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Assets Display */}
        {(connectedAccount || isConnected) && (
          <div className="mb-8">
            <WalletAssetsDisplay 
              connectedAddress={connectedAccount || wallet?.address || null}
              provider={wallet || undefined}
            />
          </div>
        )}

        {/* News Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Latest News
              {searchQuery && (
                <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                  - Results for "{searchQuery}"
                </span>
              )}
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredNews.length} articles
            </div>
          </div>

          {newsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                Loading latest news...
              </span>
            </div>
          ) : newsError ? (
            <div className="text-center py-12">
              <div className="text-red-600 dark:text-red-400 mb-2">
                Failed to load news articles
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Please check your connection and try again
              </p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-600 dark:text-gray-400 mb-2">
                {searchQuery ? 'No articles found for your search' : 'No news articles available'}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {searchQuery ? 'Try adjusting your search terms or filters' : 'Check back later for updates'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredNews.map((article: NewsArticleType) => (
                <NewsArticle
                  key={article.id}
                  article={article}
                  onClick={() => setSelectedArticle(article)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="mb-2">BasedNews Aggregator</p>
            <p className="text-sm">
              Based news aggregator
            </p>
          </div>
        </div>
      </footer>

      {/* News Article Modal with AI Summary */}
      {selectedArticle && (
        <NewsArticleModal
          article={selectedArticle}
          isOpen={!!selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}