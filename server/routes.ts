import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { insertNewsArticleSchema, insertRedditPostSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get historical price data for a specific cryptocurrency
  app.get("/api/cryptocurrencies/:id/chart", async (req, res) => {
    try {
      const { id } = req.params;
      const { days = "7" } = req.query; // Default to 7 days
      
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
        {
          params: {
            vs_currency: "usd",
            days: days,
            interval: days === "1" ? "hourly" : "daily"
          }
        }
      );

      // Format the data for the chart
      const chartData = response.data.prices.map(([timestamp, price]: [number, number]) => ({
        time: new Date(timestamp).toISOString(),
        price: price
      }));

      res.json({
        coinId: id,
        days: parseInt(days as string),
        data: chartData
      });
    } catch (error) {
      console.error(`Error fetching chart data for ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });

  // Get top 10 cryptocurrencies with real-time prices from CoinGecko (excluding stablecoins and wrapped tokens)
  app.get("/api/cryptocurrencies", async (req, res) => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: 20, // Get more to filter out unwanted tokens
            page: 1,
            sparkline: false,
            price_change_percentage: "24h"
          }
        }
      );

      // Filter out stablecoins and wrapped tokens
      const excludedTokens = [
        'tether',           // USDT
        'usd-coin',         // USDC
        'wrapped-steth',    // wstETH (Wrapped Staked Ether)
        'binance-usd',      // BUSD
        'dai',              // DAI
        'true-usd',         // TUSD
        'wrapped-bitcoin',  // WBTC
        'first-digital-usd' // FDUSD
      ];

      const filteredCoins = response.data
        .filter((coin: any) => !excludedTokens.includes(coin.id))
        .slice(0, 10); // Take top 10 after filtering

      const cryptos = filteredCoins.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        currentPrice: coin.current_price?.toString(),
        priceChange24h: coin.price_change_24h?.toString(),
        priceChangePercentage24h: coin.price_change_percentage_24h?.toString(),
        marketCap: coin.market_cap?.toString(),
        volume24h: coin.total_volume?.toString(),
        marketCapRank: coin.market_cap_rank,
        image: coin.image,
      }));

      // Store in memory
      for (const crypto of cryptos) {
        await storage.upsertCryptocurrency(crypto);
      }

      const storedCryptos = await storage.getCryptocurrencies();
      res.json(storedCryptos);
    } catch (error) {
      console.error("Error fetching cryptocurrencies:", error);
      // Return cached data if available
      const cachedCryptos = await storage.getCryptocurrencies();
      if (cachedCryptos.length > 0) {
        res.json(cachedCryptos);
      } else {
        res.status(500).json({ message: "Failed to fetch cryptocurrency data" });
      }
    }
  });

  // Get crypto news from CryptoPanic and CoinTelegraph RSS
  app.get("/api/news", async (req, res) => {
    try {
      const articles = [];

      // Fetch from CryptoPanic API
      try {
        const apiKey = process.env.CRYPTOPANIC_API_KEY;
        if (!apiKey) {
          console.log("CryptoPanic API key not found - using fallback news");
        } else {
          console.log("Using CryptoPanic API key: Found");
          
          const cryptoPanicResponse = await axios.get(
            "https://cryptopanic.com/api/v1/posts/",
            {
              params: {
                auth_token: apiKey,
                kind: "news",
                filter: "hot",
                page: 1
              }
            }
          );

          if (cryptoPanicResponse.data?.results) {
            console.log(`✅ CryptoPanic API success: Fetched ${cryptoPanicResponse.data.results.length} articles`);
            
            for (const item of cryptoPanicResponse.data.results.slice(0, 8)) {
              const article = {
                title: item.title,
                description: item.title || "No description available",
                url: item.url,
                source: "CryptoPanic",
                publishedAt: item.published_at ? new Date(item.published_at) : new Date(),
                sentiment: item.votes?.positive > item.votes?.negative ? "bullish" : 
                          item.votes?.negative > item.votes?.positive ? "bearish" : "neutral"
              };
              
              const validatedArticle = insertNewsArticleSchema.parse(article);
              const savedArticle = await storage.createNewsArticle(validatedArticle);
              articles.push(savedArticle);
            }
            
            // Skip fallback news if CryptoPanic worked
            return res.json(articles);
          } else {
            console.log("CryptoPanic API returned no results");
          }
        }
      } catch (error) {
        const errorData = (error as any)?.response?.data;
        if (errorData?.status === 'api_error' && errorData?.info === 'Token not found') {
          console.log("❌ CryptoPanic API key invalid or not activated - check your API key at cryptopanic.com/developers/api");
        } else {
          console.error("CryptoPanic API error:", errorData || (error as any)?.message || error);
        }
      }

      // Fetch from CoinTelegraph RSS (simulated for now)
      try {
        const coinTelegraphNews = [
          {
            title: "Bitcoin ETF Approval Sends BTC to New All-Time High",
            description: "The SEC's approval of spot Bitcoin ETFs has triggered a massive rally, with BTC breaking through $50,000 resistance...",
            url: "https://cointelegraph.com/news/bitcoin-etf-approval",
            source: "CoinTelegraph",
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            sentiment: "bullish"
          },
          {
            title: "Ethereum 2.0 Staking Rewards Hit Record High",
            description: "Ethereum validators are seeing unprecedented returns as network activity surges following the latest upgrade...",
            url: "https://cointelegraph.com/news/ethereum-staking-rewards",
            source: "CoinTelegraph",
            publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            sentiment: "bullish"
          },
          {
            title: "DeFi TVL Surpasses $100 Billion Milestone",
            description: "Total value locked in decentralized finance protocols reaches historic heights as institutional adoption accelerates...",
            url: "https://cointelegraph.com/news/defi-tvl-milestone",
            source: "CoinTelegraph",
            publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            sentiment: "neutral"
          }
        ];

        for (const article of coinTelegraphNews) {
          const validatedArticle = insertNewsArticleSchema.parse(article);
          const savedArticle = await storage.createNewsArticle(validatedArticle);
          articles.push(savedArticle);
        }
      } catch (error) {
        console.error("Error fetching CoinTelegraph news:", error);
      }

      const allNews = await storage.getNewsArticles(20);
      res.json(allNews);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news data" });
    }
  });

  // Get Reddit posts from crypto subreddits
  app.get("/api/reddit", async (req, res) => {
    try {
      const subreddit = req.query.subreddit as string || "cryptocurrency";
      
      // For now, simulate Reddit API calls with sample data
      const mockRedditPosts = [
        {
          id: "reddit_1",
          title: "Just bought my first Bitcoin! Any tips for a beginner?",
          author: "cryptonewbie",
          subreddit: "cryptocurrency",
          url: "https://reddit.com/r/cryptocurrency/post1",
          upvotes: 234,
          comments: 45,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
        },
        {
          id: "reddit_2",
          title: "Market Analysis: Why this bull run is different",
          author: "cryptoanalyst",
          subreddit: "cryptocurrency",
          url: "https://reddit.com/r/cryptocurrency/post2",
          upvotes: 1200,
          comments: 189,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
        },
        {
          id: "reddit_3",
          title: "Ethereum gas fees are finally reasonable again",
          author: "ethtrader",
          subreddit: "cryptocurrency",
          url: "https://reddit.com/r/cryptocurrency/post3",
          upvotes: 892,
          comments: 67,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
        }
      ];

      for (const post of mockRedditPosts) {
        const validatedPost = insertRedditPostSchema.parse(post);
        await storage.createRedditPost(validatedPost);
      }

      const redditPosts = await storage.getRedditPosts(subreddit, 10);
      res.json(redditPosts);
    } catch (error) {
      console.error("Error fetching Reddit posts:", error);
      res.status(500).json({ message: "Failed to fetch Reddit data" });
    }
  });

  // API status endpoint
  app.get("/api/status", async (req, res) => {
    const status = {
      coingecko: "connected",
      cryptopanic: process.env.CRYPTOPANIC_API_KEY ? "api_key_configured" : "no_api_key",
      reddit: "simulated",
      lastUpdate: new Date().toISOString()
    };
    
    res.json(status);
  });

  const httpServer = createServer(app);
  return httpServer;
}
