import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { CryptoPriceCard } from "@/components/crypto-price-card";
import { CryptoChartModal } from "@/components/crypto-chart-modal";
import { NewsSummaryModal } from "@/components/news-summary-modal";
import { NewsArticle } from "@/components/news-article";
import { RedditPost } from "@/components/reddit-post";
import { StatusBar } from "@/components/status-bar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Cryptocurrency, NewsArticle as NewsArticleType, RedditPost as RedditPostType } from "@shared/schema";

export default function Dashboard() {
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const { data: cryptocurrencies, isLoading: cryptoLoading, refetch: refetchCrypto } = useQuery<Cryptocurrency[]>({
    queryKey: ["/api/cryptocurrencies"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: newsArticles, isLoading: newsLoading, refetch: refetchNews } = useQuery<NewsArticleType[]>({
    queryKey: ["/api/news"],
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

  return (
    <div className="min-h-screen bg-based-background text-foreground">
      <Header lastUpdated={apiStatus?.lastUpdate} />
      
      <main className="container mx-auto px-4 py-6">
        {/* Price Grid Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Top 10 Cryptocurrencies</h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Updates every 30s</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {cryptoLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <Card key={i} className="bg-based-surface border-border p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </Card>
              ))
            ) : cryptocurrencies?.length ? (
              cryptocurrencies.slice(0, 10).map((crypto) => (
                <CryptoPriceCard 
                  key={crypto.id} 
                  cryptocurrency={crypto} 
                  onClick={() => handleCryptoClick(crypto)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">Failed to load cryptocurrency data</p>
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* News Aggregator */}
          <div className="lg:col-span-2">
            <Card className="bg-based-surface border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Latest Crypto News</h2>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    CoinTelegraph
                  </Badge>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    CryptoPanic
                  </Badge>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {newsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border-b border-border pb-4">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="w-20 h-15 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : newsArticles?.length ? (
                  newsArticles.map((article) => (
                    <NewsArticle 
                      key={article.id} 
                      article={article} 
                      onClick={() => handleArticleClick(article)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No news articles available</p>
                  </div>
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
                    <div key={i} className="border-b border-border pb-4">
                      <Skeleton className="h-4 w-full mb-2" />
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-8" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                    </div>
                  ))
                ) : redditPosts?.length ? (
                  redditPosts.slice(0, 5).map((post) => (
                    <RedditPost key={post.id} post={post} />
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No Reddit posts available</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Twitter/X Feed */}
            <Card className="bg-based-surface border-border p-6">
              <div className="flex items-center space-x-3 mb-6">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <h3 className="text-lg font-bold text-foreground">Crypto Twitter</h3>
              </div>

              <div className="space-y-4">
                {twitterLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border-b border-border pb-4">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-3 w-3/4 mb-2" />
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                    </div>
                  ))
                ) : tweets?.length ? (
                  tweets.slice(0, 5).map((tweet) => (
                    <div key={tweet.id} className="border-b border-border pb-4 last:border-b-0">
                      <p className="text-sm text-foreground mb-2 leading-relaxed">
                        {tweet.text}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>@{tweet.author}</span>
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          <span>{tweet.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.51 1.99L16.6 2.9l1.05 1.05c.83.83.83 2.19 0 3.02l-.7.7L15.9 6.62l.7-.7c.39-.39.39-1.02 0-1.41l-1.05-1.05.91-.91c.75-.75 1.97-.75 2.72 0s.75 1.97 0 2.72l-5.66 5.66-1.41-1.41L17.51 4.7c1.17-1.17 1.17-3.07 0-4.24-1.17-1.17-3.07-1.17-4.24 0L7.61 6.12 6.2 4.71l5.66-5.66c1.95-1.95 5.12-1.95 7.07 0s1.95 5.12 0 7.07z"/>
                          </svg>
                          <span>{tweet.retweets}</span>
                        </div>
                        <span>{new Date(tweet.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No tweets available</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <StatusBar />

      {/* Chart Modal */}
      {selectedCrypto && (
        <CryptoChartModal 
          isOpen={isChartModalOpen}
          onClose={handleCloseChartModal}
          cryptocurrency={selectedCrypto}
        />
      )}

      {/* News Summary Modal */}
      <NewsSummaryModal
        article={selectedArticle}
        isOpen={isSummaryModalOpen}
        onClose={handleCloseSummaryModal}
      />
    </div>
  );
}
