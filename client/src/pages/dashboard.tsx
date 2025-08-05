import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Cryptocurrency, NewsArticle as NewsArticleType, RedditPost as RedditPostType } from "@shared/schema";
import { SearchBar } from "@/components/search-bar";
import { NewsFilter } from "@/components/news-filter";

export default function Dashboard() {
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedRedditPost, setSelectedRedditPost] = useState<any | null>(null);
  const [isRedditModalOpen, setIsRedditModalOpen] = useState(false);
  const [selectedTweet, setSelectedTweet] = useState<any | null>(null);
  const [isTwitterModalOpen, setIsTwitterModalOpen] = useState(false);
  const [newsFilter, setNewsFilter] = useState<string | null>(null);

  const { data: cryptocurrencies, isLoading: cryptoLoading, refetch: refetchCrypto } = useQuery<Cryptocurrency[]>({
    queryKey: ["/api/cryptocurrencies"],
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

        {/* Price Grid Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Top Cryptocurrencies</h2>
            <p className="text-sm text-muted-foreground">Drag to reorder</p>
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
                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
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
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
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
      </main>
    </div>
  );
}
