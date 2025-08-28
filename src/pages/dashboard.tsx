import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { CryptoPriceCard } from "@/components/crypto-price-card";
import { DraggableCryptoGrid } from "@/components/draggable-crypto-grid";
import { GridLoadingState, NewsCardSkeleton, ErrorState, EmptyState } from "@/components/loading-states";
import { trackCryptoCardClick, trackNewsArticleClick, trackSearchQuery, trackNewsFilterUsage } from "@/lib/analytics";
import { CryptoChartModal } from "@/components/crypto-chart-modal";
import { NewsSummaryModal } from "@/components/news-summary-modal";
import { RedditSummaryModal } from "@/components/reddit-summary-modal";
import { TwitterSummaryModal } from "@/components/twitter-summary-modal";
import { NewsArticle } from "@/components/news-article";
import { RedditPost } from "@/components/reddit-post";
import { TwitterPost } from "@/components/twitter-post";
import { StatusBar } from "@/components/status-bar";
import { WalletPortfolio } from "@/components/wallet-portfolio";
import { BaseFeatures } from "@/components/base-features";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Plus, Eye, Wallet, Bell, Activity, TrendingUp, Users, Settings, BarChart3, AlertTriangle, MessageCircle, Twitter } from "lucide-react";
import { Cryptocurrency, NewsArticle as NewsArticleType, RedditPost as RedditPostType } from "@shared/schema";
import { SearchBar } from "@/components/search-bar";
import { NewsFilter } from "@/components/news-filter";
import { useMiniKit, useWallet, useBaseSocial, useBaseApp } from "@/hooks/useMiniKit";
import { useBaseWallet } from "@/hooks/useBaseWallet";

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const { user: miniKitUser, wallet: miniKitWallet } = useMiniKit();
  const { wallet, connectWallet, disconnectWallet, isConnected } = useWallet();
  const { wallet: baseWallet, connectWallet: connectBaseWallet, disconnectWallet: disconnectBaseWallet, switchToBase } = useBaseWallet();
  const { sharePortfolio, shareWatchlist, shareNewsArticle } = useBaseSocial();
  const { addToBaseApp, sendPriceAlert } = useBaseApp();
  const [, setLocation] = useLocation();
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedRedditPost, setSelectedRedditPost] = useState<any | null>(null);
  const [isRedditModalOpen, setIsRedditModalOpen] = useState(false);
  const [selectedTweet, setSelectedTweet] = useState<any | null>(null);
  const [isTwitterModalOpen, setIsTwitterModalOpen] = useState(false);
  const [newsFilter, setNewsFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddCoinsModalOpen, setIsAddCoinsModalOpen] = useState(false);
  const [availableCoins, setAvailableCoins] = useState<Cryptocurrency[]>([]);
  const [selectedCoinsToAdd, setSelectedCoinsToAdd] = useState<Set<string>>(new Set());
  const [userWatchlist, setUserWatchlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBaseOnly, setShowBaseOnly] = useState(false);

  // Load user watchlist from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('crypto-watchlist');
    if (savedWatchlist) {
      try {
        const watchlist = JSON.parse(savedWatchlist);
        setUserWatchlist(watchlist);
      } catch (error) {
        console.error('Error loading watchlist:', error);
        // Set default watchlist if none exists
        const defaultCoins = ['bitcoin', 'ethereum', 'solana', 'cardano', 'polygon'];
        setUserWatchlist(defaultCoins);
        localStorage.setItem('crypto-watchlist', JSON.stringify(defaultCoins));
      }
    } else {
      // Set default watchlist including some Base ecosystem coins
      const defaultCoins = ['bitcoin', 'ethereum', 'based-brett', 'degen-base', 'aerodrome-finance'];
      setUserWatchlist(defaultCoins);
      localStorage.setItem('crypto-watchlist', JSON.stringify(defaultCoins));
    }
  }, []);

  const { data: cryptocurrencies, isLoading: cryptoLoading, refetch: refetchCrypto } = useQuery<Cryptocurrency[]>({
    queryKey: ["/api/cryptocurrencies", userWatchlist.length],
    queryFn: async () => {
      if (userWatchlist.length === 0) return [];
      
      // Fetch specific coins from user's watchlist + some popular ones for fallback
      const coinsToFetch = userWatchlist.length > 0 ? userWatchlist : ['bitcoin', 'ethereum', 'solana'];
      const response = await fetch(`/api/cryptocurrencies?per_page=50&includeBaseCoins=true&ids=${coinsToFetch.join(',')}`);
      return response.json();
    },
    enabled: userWatchlist.length > 0,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: newsArticles, isLoading: newsLoading, refetch: refetchNews } = useQuery<NewsArticleType[]>({
    queryKey: ["/api/news", newsFilter],
    queryFn: () => fetch(`/api/news${newsFilter ? `?source=${newsFilter}` : ''}`).then(res => res.json()),
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const { data: redditPosts, isLoading: redditLoading, refetch: refetchReddit } = useQuery<RedditPostType[]>({
    queryKey: ["/api/reddit"],
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const { data: tweets, isLoading: twitterLoading, refetch: refetchTwitter } = useQuery<any[]>({
    queryKey: ["/api/twitter"],
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const { data: apiStatus } = useQuery<{lastUpdate: string}>({
    queryKey: ["/api/status"],
    refetchInterval: 60000, // Check status every minute
  });

  // User-specific data queries
  const { data: watchlist, isLoading: watchlistLoading } = useQuery<any[]>({
    queryKey: ["/api/user/watchlist"],
    enabled: isAuthenticated,
  });

  const { data: portfolio, isLoading: portfolioLoading } = useQuery<any[]>({
    queryKey: ["/api/user/portfolio"],
    enabled: isAuthenticated,
  });

  const { data: userAlerts, isLoading: alertsLoading } = useQuery<any[]>({
    queryKey: ["/api/user/alerts"],
    enabled: isAuthenticated,
  });

  // Manual refresh for development
  useEffect(() => {
    const interval = setInterval(() => {
      refetchCrypto();
      refetchNews();
      refetchReddit();
      refetchTwitter();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchCrypto, refetchNews, refetchReddit, refetchTwitter]);

  const handleCryptoClick = (crypto: Cryptocurrency) => {
    setSelectedCrypto(crypto);
    setIsChartModalOpen(true);
    
    // Track analytics
    trackCryptoCardClick(crypto.symbol || '', crypto.name || '');
  };

  const handleCloseChartModal = () => {
    setIsChartModalOpen(false);
    setSelectedCrypto(null);
  };

  const handleArticleClick = (article: any) => {
    setSelectedArticle(article);
    setIsSummaryModalOpen(true);
  };

  const handleCloseSummaryModal = () => {
    setIsSummaryModalOpen(false);
    setSelectedArticle(null);
  };

  const handleRedditClick = (post: any) => {
    setSelectedRedditPost(post);
    setIsRedditModalOpen(true);
  };

  const handleSearchResult = (result: any) => {
    if (result.type === 'crypto') {
      const crypto = cryptocurrencies?.find(c => c.id === result.id);
      if (crypto) {
        handleCryptoClick(crypto);
      }
    } else if (result.type === 'news') {
      const article = newsArticles?.find(a => a.id === result.id);
      if (article) {
        handleArticleClick(article);
      }
    }
  };

  const handleCryptoDetailClick = (crypto: Cryptocurrency) => {
    setLocation(`/crypto/${crypto.id}`);
  };

  const handleNewsFilterChange = (source: string | null) => {
    setNewsFilter(source);
  };

  const handleCloseRedditModal = () => {
    setIsRedditModalOpen(false);
    setSelectedRedditPost(null);
  };

  const handleTweetClick = (tweet: any) => {
    setSelectedTweet(tweet);
    setIsTwitterModalOpen(true);
  };

  const handleCloseTwitterModal = () => {
    setIsTwitterModalOpen(false);
    setSelectedTweet(null);
  };

  return (
    <div className="min-h-screen bg-based-background text-foreground">
      <Header lastUpdated={apiStatus?.lastUpdate} />
      
      <main className="container mx-auto px-4 py-6">
        {/* Search Section */}
        <section className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <SearchBar 
              cryptocurrencies={cryptocurrencies || []}
              newsArticles={newsArticles || []}
              onFiltersChange={(filters) => {
                // Handle filter changes - could be used to update global search state
                console.log('Search filters changed:', filters);
              }}
              onResultClick={handleSearchResult}
              placeholder="Search cryptocurrencies and news articles..."
            />
          </div>
        </section>

        {/* Cache Bust & Debug info */}
        <div className="mb-4 p-2 bg-red-100 text-xs space-y-1">
          <div>🔄 Build: {new Date().toISOString()} | Version: 1.1.0</div>
          <div>Debug: baseWallet.isConnected={JSON.stringify(baseWallet.isConnected)}, baseWallet.address={JSON.stringify(baseWallet.address)}, baseWallet.chainId={JSON.stringify(baseWallet.chainId)}, baseWallet.error={JSON.stringify(baseWallet.error)}</div>
        </div>

        {/* Wallet Connection Section - Always Show for Testing */}
        {true && (
          <section className="mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
              <div className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                    <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  🔗 Connect your wallet to view portfolio
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  Connect your Base wallet to track your portfolio, get personalized insights, and access advanced features.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={async () => {
                      console.log('Connect Base wallet clicked');
                      try {
                        await connectBaseWallet();
                        console.log('Base wallet connected successfully');
                      } catch (error) {
                        console.error('Base wallet connection failed:', error);
                        alert('Failed to connect wallet: ' + (error as Error).message);
                      }
                    }}
                    disabled={baseWallet.isConnecting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 disabled:opacity-50"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {baseWallet.isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={async () => {
                      console.log('Switch to Base clicked');
                      try {
                        await switchToBase();
                        console.log('Switched to Base network');
                        alert('Switched to Base network successfully!');
                      } catch (error) {
                        console.error('Switch to Base failed:', error);
                        alert('Failed to switch to Base: ' + (error as Error).message);
                      }
                    }}
                    className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Switch to Base
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={async () => {
                      console.log('Simple wallet test clicked');
                      try {
                        if (typeof window !== 'undefined' && window.ethereum) {
                          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                          alert('✅ Wallet Connected!\nAddress: ' + accounts[0]);
                          console.log('Simple wallet test success:', accounts);
                        } else {
                          alert('❌ No wallet found!\nPlease install MetaMask or Coinbase Wallet');
                          console.log('No window.ethereum found');
                        }
                      } catch (error) {
                        console.error('Simple wallet test failed:', error);
                        alert('❌ Wallet test failed: ' + (error as Error).message);
                      }
                    }}
                    className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Simple Test
                  </Button>
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
          </section>
        )}

        {/* Price Grid Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Your Watchlist</h2>
              <p className="text-sm text-muted-foreground">
                {userWatchlist.length} cryptocurrencies • Drag to reorder
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  try {
                    console.log('Fetching coins for modal...');
                    // Start with a smaller, more manageable request
                    const response = await fetch('/api/cryptocurrencies?per_page=100&includeBaseCoins=true');
                    
                    if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    console.log('Available coins for selection:', data.length);
                    
                    if (Array.isArray(data) && data.length > 0) {
                      setAvailableCoins(data);
                      setIsAddCoinsModalOpen(true);
                    } else {
                      console.error('Invalid data format:', data);
                      alert('Error loading coins. Please try again.');
                    }
                  } catch (err) {
                    console.error('Error fetching coins:', err);
                    alert('Error loading coins. Please try again.');
                  }
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Coins
              </Button>
            </div>
          </div>
          
          <DraggableCryptoGrid
            cryptocurrencies={cryptocurrencies || []}
            isLoading={cryptoLoading}
            onCryptoClick={handleCryptoClick}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* News Aggregator */}
          <div className="lg:col-span-2">
            <Card className="bg-based-surface border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Latest Crypto News</h2>
              </div>
              
              <NewsFilter 
                onFilterChange={handleNewsFilterChange}
                activeFilter={newsFilter}
              />

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {newsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <NewsCardSkeleton key={i} />
                  ))
                ) : newsArticles?.length ? (
                  newsArticles.map((article) => (
                    <NewsArticle 
                      key={article.id} 
                      article={article} 
                      onClick={() => {
                        handleArticleClick(article);
                        trackNewsArticleClick(article.id, article.source || '', article.sentiment || 'neutral');
                      }}
                    />
                  ))
                ) : (
                  <EmptyState
                    title="No news available"
                    message="We couldn't load any news articles at the moment."
                  />
                )}
              </div>
            </Card>
          </div>

          {/* Social Feed */}
          <div className="space-y-6">
            {/* Reddit Feed */}
            <Card className="bg-based-surface border-border p-6">
              <div className="flex items-center space-x-3 mb-6">
                <MessageCircle className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-bold text-foreground">r/cryptocurrency</h3>
              </div>

              <div className="space-y-4">
                {redditLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))
                ) : redditPosts?.length ? (
                  redditPosts.slice(0, 5).map((post) => (
                    <RedditPost 
                      key={post.id} 
                      post={post} 
                      onClick={() => handleRedditClick(post)}
                    />
                  ))
                ) : (
                  <EmptyState
                    title="No Reddit posts"
                    message="Unable to load Reddit posts at this time."
                  />
                )}
              </div>
            </Card>

            {/* Twitter Feed */}
            <Card className="bg-based-surface border-border p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Twitter className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-foreground">Twitter Feed</h3>
              </div>

              <div className="space-y-4">
                {twitterLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))
                ) : tweets?.length ? (
                  tweets.slice(0, 5).map((tweet) => (
                    <TwitterPost 
                      key={tweet.id} 
                      tweet={tweet} 
                      onClick={() => handleTweetClick(tweet)}
                    />
                  ))
                ) : (
                  <EmptyState
                    title="No tweets available"
                    message="Unable to load Twitter posts at this time."
                  />
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Modals */}
        <CryptoChartModal
          isOpen={isChartModalOpen}
          onClose={() => setIsChartModalOpen(false)}
          cryptocurrency={selectedCrypto}
        />

        <NewsSummaryModal
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
          article={selectedArticle}
        />

        <RedditSummaryModal
          isOpen={isRedditModalOpen}
          onClose={handleCloseRedditModal}
          post={selectedRedditPost}
        />

        <TwitterSummaryModal
          isOpen={isTwitterModalOpen}
          onClose={handleCloseTwitterModal}
          tweet={selectedTweet}
        />

        {/* Authenticated User Features */}
        {isAuthenticated && (
          <div className="mt-12 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Your Crypto Hub</h2>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>
                    {miniKitUser?.displayName || (user as any)?.firstName || (user as any)?.email || 'User'}
                  </span>
                </Badge>
                {(miniKitWallet || baseWallet.address) && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Wallet className="w-3 h-3" />
                    <span>
                      {(miniKitWallet?.address || baseWallet.address)?.slice(0, 6)}...
                      {(miniKitWallet?.address || baseWallet.address)?.slice(-4)}
                    </span>
                  </Badge>
                )}
                {baseWallet.chainId && (
                  <Badge variant={baseWallet.chainId === 8453 ? "default" : "destructive"} className="flex items-center space-x-1">
                    <Activity className="w-3 h-3" />
                    <span>
                      {baseWallet.chainId === 8453 ? 'Base' : `Chain ${baseWallet.chainId}`}
                    </span>
                  </Badge>
                )}
                {baseWallet.isConnected && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectBaseWallet}
                    className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Disconnect
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Live Wallet Portfolio - Only show when wallet is connected */}
              {baseWallet.isConnected && baseWallet.address && (
                <div className="lg:col-span-2">
                  <WalletPortfolio 
                    walletAddress={baseWallet.address} 
                    cryptocurrencies={cryptocurrencies || []}
                  />
                </div>
              )}
              
              {/* Personal Watchlist */}
              <Card className="bg-based-surface border-border">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <h3 className="text-lg font-semibold text-foreground">My Watchlist</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{(watchlist as any[])?.length || 0}</Badge>
                      {(watchlist as any[])?.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const cryptoNames = (watchlist as any[]).map((item: any) => {
                              const crypto = cryptocurrencies?.find(c => c.id === item.cryptocurrencyId);
                              return crypto?.symbol?.toUpperCase() || '';
                            }).filter(Boolean);
                            shareWatchlist(cryptoNames);
                          }}
                          className="p-1"
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {watchlistLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))
                    ) : (watchlist as any[])?.length ? (
                      (watchlist as any[]).slice(0, 5).map((item: any) => {
                        const crypto = cryptocurrencies?.find(c => c.id === item.cryptocurrencyId);
                        if (!crypto) return null;
                        return (
                          <div 
                            key={item.id} 
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => handleCryptoDetailClick(crypto)}
                            data-testid={`watchlist-item-${crypto.symbol}`}
                          >
                            <div className="flex items-center space-x-3">
                              {crypto.image && (
                                <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                              )}
                              <div>
                                <p className="font-medium text-foreground">{crypto.symbol?.toUpperCase()}</p>
                                <p className="text-sm text-muted-foreground">{crypto.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">
                                ${parseFloat(crypto.currentPrice || "0").toFixed(2)}
                              </p>
                              <p className={`text-sm ${parseFloat(crypto.priceChangePercentage24h || "0") >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {parseFloat(crypto.priceChangePercentage24h || "0") >= 0 ? '+' : ''}
                                {parseFloat(crypto.priceChangePercentage24h || "0").toFixed(2)}%
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-muted-foreground mb-3">No items in your watchlist yet</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setLocation("/cryptocurrencies")}
                          data-testid="button-add-to-watchlist"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Cryptocurrencies
                        </Button>
                      </div>
                    )}
                    
                    {(watchlist as any[])?.length > 5 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setLocation("/watchlist")}
                        data-testid="button-view-all-watchlist"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View All ({(watchlist as any[]).length})
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Portfolio Overview */}
              <Card className="bg-based-surface border-border">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Wallet className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-foreground">Portfolio</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{(portfolio as any[])?.length || 0}</Badge>
                      {baseWallet.isConnected && (portfolio as any[])?.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const totalValue = (portfolio as any[]).reduce((total: number, holding: any) => {
                              const crypto = cryptocurrencies?.find(c => c.id === holding.cryptocurrencyId);
                              const currentPrice = parseFloat(crypto?.currentPrice || "0");
                              return total + (currentPrice * holding.amount);
                            }, 0);
                            sharePortfolio(`$${totalValue.toFixed(2)}`);
                          }}
                          className="p-1"
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {portfolioLoading ? (
                      <Skeleton className="h-16 w-full" />
                    ) : (portfolio as any[])?.length ? (
                      <>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
                          <p className="text-2xl font-bold text-foreground" data-testid="portfolio-total-value">
                            ${(portfolio as any[]).reduce((total: number, holding: any) => {
                              const crypto = cryptocurrencies?.find(c => c.id === holding.cryptocurrencyId);
                              const currentPrice = parseFloat(crypto?.currentPrice || "0");
                              return total + (currentPrice * holding.amount);
                            }, 0).toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          {(portfolio as any[]).slice(0, 3).map((holding: any) => {
                            const crypto = cryptocurrencies?.find(c => c.id === holding.cryptocurrencyId);
                            if (!crypto) return null;
                            const currentValue = parseFloat(crypto.currentPrice || "0") * holding.amount;
                            return (
                              <div key={holding.id} className="flex items-center justify-between" data-testid={`portfolio-holding-${crypto.symbol}`}>
                                <div className="flex items-center space-x-2">
                                  {crypto.image && (
                                    <img src={crypto.image} alt={crypto.name} className="w-6 h-6 rounded-full" />
                                  )}
                                  <span className="font-medium text-foreground">{crypto.symbol?.toUpperCase()}</span>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-foreground">${currentValue.toFixed(2)}</p>
                                  <p className="text-xs text-muted-foreground">{holding.amount} coins</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Wallet className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-muted-foreground mb-3">No portfolio holdings yet</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setLocation("/portfolio")}
                          data-testid="button-add-holdings"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Holdings
                        </Button>
                      </div>
                    )}
                    
                    {portfolio?.length > 3 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setLocation("/portfolio")}
                        data-testid="button-view-full-portfolio"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Full Portfolio
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Price Alerts */}
              <Card className="bg-based-surface border-border">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-5 h-5 text-orange-500" />
                      <h3 className="text-lg font-semibold text-foreground">Price Alerts</h3>
                    </div>
                    <Badge variant="secondary">{(userAlerts as any[])?.length || 0}</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {alertsLoading ? (
                      Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))
                    ) : userAlerts?.length ? (
                      userAlerts.slice(0, 4).map((alert: any) => {
                        const crypto = cryptocurrencies?.find(c => c.id === alert.cryptocurrencyId);
                        if (!crypto) return null;
                        const currentPrice = parseFloat(crypto.currentPrice || "0");
                        const targetPrice = alert.targetPrice;
                        const isTriggered = (alert.type === 'above' && currentPrice >= targetPrice) || 
                                          (alert.type === 'below' && currentPrice <= targetPrice);
                        
                        return (
                          <div 
                            key={alert.id} 
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              isTriggered 
                                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' 
                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            }`}
                            data-testid={`alert-${crypto.symbol}-${alert.type}`}
                          >
                            <div className="flex items-center space-x-3">
                              {crypto.image && (
                                <img src={crypto.image} alt={crypto.name} className="w-6 h-6 rounded-full" />
                              )}
                              <div>
                                <p className="font-medium text-foreground">{crypto.symbol?.toUpperCase()}</p>
                                <p className="text-xs text-muted-foreground">
                                  Alert {alert.type} ${targetPrice}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {isTriggered && (
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                              )}
                              <span className={`text-sm font-semibold ${isTriggered ? 'text-orange-600' : 'text-foreground'}`}>
                                ${currentPrice.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-muted-foreground mb-3">No price alerts set</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setLocation("/alerts")}
                          data-testid="button-create-alert"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Alert
                        </Button>
                      </div>
                    )}
                    
                    {userAlerts?.length > 4 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setLocation("/alerts")}
                        data-testid="button-view-all-alerts"
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        View All Alerts ({userAlerts.length})
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Base Features Section */}
            <div className="mt-8">
              <BaseFeatures 
                userStats={{
                  watchlistCount: (watchlist as any[])?.length || 0,
                  portfolioCount: (portfolio as any[])?.length || 0,
                  alertsCount: userAlerts?.length || 0
                }}
              />
            </div>
          </div>
        )}
      </main>

      {/* Add Coins Modal */}
      {isAddCoinsModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsAddCoinsModalOpen(false)}
        >
          <div 
            className="bg-based-surface border border-border rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Add Cryptocurrencies</h3>
                <p className="text-sm text-muted-foreground">
                  Select from Base ecosystem coins and top 200 cryptocurrencies
                </p>
              </div>
              <button
                onClick={() => setIsAddCoinsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>

            {/* Search and Filter */}
            <div className="p-6 border-b border-border">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search cryptocurrencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground"
                />
                <Button 
                  variant={showBaseOnly ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setShowBaseOnly(!showBaseOnly)}
                >
                  Base Coins Only
                </Button>
              </div>
            </div>

            {/* Coin List */}
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableCoins
                  .filter(coin => {
                    // Search filter
                    const matchesSearch = searchQuery === "" || 
                      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
                    
                    // Base ecosystem filter
                    const matchesBaseFilter = !showBaseOnly || (coin as any).isBaseEcosystem;
                    
                    return matchesSearch && matchesBaseFilter;
                  })
                  .map((coin) => {
                  const isSelected = selectedCoinsToAdd.has(coin.id);
                  const isAlreadyAdded = (cryptocurrencies || []).some(c => c.id === coin.id);
                  
                  return (
                    <div
                      key={coin.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isAlreadyAdded 
                          ? 'border-muted bg-muted/50 cursor-not-allowed' 
                          : isSelected 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        if (isAlreadyAdded) return;
                        
                        const newSelected = new Set(selectedCoinsToAdd);
                        if (isSelected) {
                          newSelected.delete(coin.id);
                        } else {
                          newSelected.add(coin.id);
                        }
                        setSelectedCoinsToAdd(newSelected);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground truncate">
                              {coin.name}
                            </span>
                            {(coin as any).isBaseEcosystem && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Base
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {coin.symbol} • ${parseFloat(coin.currentPrice || '0').toFixed(2)}
                          </div>
                        </div>
                        {isAlreadyAdded ? (
                          <span className="text-xs text-muted-foreground">Added</span>
                        ) : (
                          <div className={`w-4 h-4 border-2 rounded ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}>
                            {isSelected && <span className="text-white text-xs">✓</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-border">
              <span className="text-sm text-muted-foreground">
                {selectedCoinsToAdd.size} coin(s) selected
              </span>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddCoinsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    // Add selected coins to watchlist
                    const coinsToAdd = Array.from(selectedCoinsToAdd);
                    const newWatchlist = [...userWatchlist, ...coinsToAdd];
                    const uniqueWatchlist = [...new Set(newWatchlist)]; // Remove duplicates
                    
                    setUserWatchlist(uniqueWatchlist);
                    localStorage.setItem('crypto-watchlist', JSON.stringify(uniqueWatchlist));
                    
                    console.log('Added coins to watchlist:', coinsToAdd);
                    console.log('New watchlist:', uniqueWatchlist);
                    
                    setIsAddCoinsModalOpen(false);
                    setSelectedCoinsToAdd(new Set());
                    
                    // Refetch cryptocurrency data to show new coins
                    refetchCrypto();
                  }}
                  disabled={selectedCoinsToAdd.size === 0}
                >
                  Add {selectedCoinsToAdd.size} Coin(s)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
