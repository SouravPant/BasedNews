import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Star, StarOff, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { InteractiveChart } from "./interactive-chart";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface CryptocurrencyDetailProps {
  id: string;
}

export function CryptocurrencyDetail({ id }: CryptocurrencyDetailProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const { data: cryptocurrency, isLoading: cryptoLoading } = useQuery({
    queryKey: [`/api/cryptocurrencies/${id}`],
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: [`/api/cryptocurrencies/${id}/chart`, { days: 7 }],
  });

  const { data: watchlist } = useQuery({
    queryKey: ["/api/user/watchlist"],
    enabled: isAuthenticated,
  });

  // Check if cryptocurrency is in watchlist
  useEffect(() => {
    if (watchlist && cryptocurrency) {
      setIsInWatchlist(watchlist.some((item: any) => item.cryptocurrencyId === cryptocurrency.id));
    }
  }, [watchlist, cryptocurrency]);

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to manage your watchlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isInWatchlist) {
        await apiRequest(`/api/user/watchlist/${id}`, {
          method: "DELETE",
        });
        setIsInWatchlist(false);
        toast({
          title: "Removed from Watchlist",
          description: `${cryptocurrency.name} has been removed from your watchlist.`,
        });
      } else {
        await apiRequest("/api/user/watchlist", {
          method: "POST",
          body: { cryptocurrencyId: id },
        });
        setIsInWatchlist(true);
        toast({
          title: "Added to Watchlist",
          description: `${cryptocurrency.name} has been added to your watchlist.`,
        });
      }
    } catch (error: any) {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update watchlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (cryptoLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cryptocurrency) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Cryptocurrency Not Found
          </h1>
          <Button onClick={() => setLocation("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const priceChange = parseFloat(cryptocurrency.priceChangePercentage24h || "0");
  const isPositive = priceChange >= 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            onClick={() => setLocation("/")} 
            variant="outline" 
            size="sm"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          {isAuthenticated && (
            <Button
              onClick={handleWatchlistToggle}
              variant={isInWatchlist ? "default" : "outline"}
              size="sm"
              data-testid="button-toggle-watchlist"
            >
              {isInWatchlist ? (
                <>
                  <StarOff className="w-4 h-4 mr-2" />
                  Remove from Watchlist
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" />
                  Add to Watchlist
                </>
              )}
            </Button>
          )}
        </div>

        {/* Cryptocurrency Header */}
        <div className="flex items-center space-x-4">
          {cryptocurrency.image && (
            <img 
              src={cryptocurrency.image} 
              alt={cryptocurrency.name} 
              className="w-16 h-16 rounded-full"
              data-testid="img-crypto-logo"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {cryptocurrency.name}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {cryptocurrency.symbol?.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Price Information */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Current Price
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(parseFloat(cryptocurrency.currentPrice || "0"))}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  24h Change
                </h3>
                <div className="flex items-center space-x-2">
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Market Cap
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatLargeNumber(parseFloat(cryptocurrency.marketCap || "0"))}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  24h Volume
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatLargeNumber(parseFloat(cryptocurrency.volume24h || "0"))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Price Chart</CardTitle>
                <CardDescription>
                  Historical price data for {cryptocurrency.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartLoading ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : chartData ? (
                  <InteractiveChart data={chartData.data} coinName={cryptocurrency.name} />
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-500">
                    Chart data unavailable
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side Information */}
          <div className="space-y-6">
            {/* Market Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Market Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Market Cap Rank</span>
                  <Badge variant="secondary">#{cryptocurrency.marketCapRank || 'N/A'}</Badge>
                </div>
                
                {cryptocurrency.circulatingSupply && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Circulating Supply</span>
                    <span className="font-semibold">
                      {parseInt(cryptocurrency.circulatingSupply).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {cryptocurrency.totalSupply && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Total Supply</span>
                    <span className="font-semibold">
                      {parseInt(cryptocurrency.totalSupply).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {cryptocurrency.maxSupply && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Max Supply</span>
                    <span className="font-semibold">
                      {parseInt(cryptocurrency.maxSupply).toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All-Time High/Low */}
            {(cryptocurrency.ath || cryptocurrency.atl) && (
              <Card>
                <CardHeader>
                  <CardTitle>All-Time Records</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cryptocurrency.ath && (
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">All-Time High</span>
                        <span className="font-semibold text-green-600">
                          {formatPrice(parseFloat(cryptocurrency.ath))}
                        </span>
                      </div>
                      {cryptocurrency.athDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(cryptocurrency.athDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {cryptocurrency.atl && (
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">All-Time Low</span>
                        <span className="font-semibold text-red-600">
                          {formatPrice(parseFloat(cryptocurrency.atl))}
                        </span>
                      </div>
                      {cryptocurrency.atlDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(cryptocurrency.atlDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Links */}
            {(cryptocurrency.website || cryptocurrency.whitepaper) && (
              <Card>
                <CardHeader>
                  <CardTitle>Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cryptocurrency.website && (
                    <a
                      href={cryptocurrency.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Official Website</span>
                    </a>
                  )}
                  
                  {cryptocurrency.whitepaper && (
                    <a
                      href={cryptocurrency.whitepaper}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Whitepaper</span>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Description */}
        {cryptocurrency.description && (
          <Card>
            <CardHeader>
              <CardTitle>About {cryptocurrency.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {cryptocurrency.description}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}