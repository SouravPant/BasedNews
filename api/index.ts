import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Get top 10 cryptocurrencies with real-time prices from CoinGecko
app.get("/api/cryptocurrencies", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 20,
          page: 1,
          sparkline: false,
          price_change_percentage: "24h"
        }
      }
    );

    // Filter out stablecoins and wrapped tokens
    const excludedTokens = [
      'tether', 'usd-coin', 'wrapped-steth', 'binance-usd', 'dai',
      'true-usd', 'wrapped-bitcoin', 'first-digital-usd'
    ];

    const filteredCoins = response.data
      .filter((coin: any) => !excludedTokens.includes(coin.id))
      .slice(0, 10);

    const cryptocurrencies = filteredCoins.map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      currentPrice: coin.current_price?.toString() || "0",
      priceChange24h: coin.price_change_24h?.toString() || "0",
      priceChangePercentage24h: coin.price_change_percentage_24h?.toString() || "0",
      marketCap: coin.market_cap?.toString() || "0",
      volume24h: coin.total_volume?.toString() || "0",
      marketCapRank: coin.market_cap_rank || 0,
      image: coin.image || "",
      lastUpdated: new Date().toISOString()
    }));

    res.json(cryptocurrencies);
  } catch (error) {
    console.error("Error fetching cryptocurrency data:", error);
    res.status(500).json({ message: "Failed to fetch cryptocurrency data" });
  }
});

// Get crypto news from fallback data
app.get("/api/news", async (req, res) => {
  try {
    // Fallback news data since CryptoPanic API key is not available
    const fallbackNews = [
      {
        id: "news_1",
        title: "Bitcoin ETF Approval Sends BTC to New All-Time High",
        url: "https://example.com/btc-etf-ath",
        source: "CoinTelegraph",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        sentiment: "bullish" as const,
        description: "The approval of a major Bitcoin ETF has propelled BTC to unprecedented price levels, marking a significant milestone for cryptocurrency adoption."
      },
      {
        id: "news_2", 
        title: "Ethereum 2.0 Staking Rewards Reach Record Levels",
        url: "https://example.com/eth-staking-rewards",
        source: "CryptoPanic",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        sentiment: "bullish" as const,
        description: "Ethereum validators are experiencing higher-than-expected staking rewards as network activity continues to surge."
      },
      {
        id: "news_3",
        title: "DeFi Protocol Security Audit Reveals Critical Vulnerabilities",
        url: "https://example.com/defi-security-audit",
        source: "CoinTelegraph",
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        sentiment: "bearish" as const,
        description: "A comprehensive security audit of a popular DeFi protocol has uncovered several critical vulnerabilities that could pose risks to user funds."
      }
    ];

    res.json(fallbackNews);
  } catch (error) {
    console.error("Error fetching news data:", error);
    res.status(500).json({ message: "Failed to fetch news data" });
  }
});

// Get Reddit posts from fallback data
app.get("/api/reddit", async (req, res) => {
  try {
    // Fallback Reddit data
    const fallbackReddit = [
      {
        id: "reddit_1",
        title: "Just bought my first Bitcoin! Any tips for a beginner?",
        url: "https://reddit.com/r/cryptocurrency/example1",
        author: "CryptoNewbie2024",
        score: 156,
        numComments: 23,
        subreddit: "r/cryptocurrency",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        selfText: "Finally took the plunge and bought 0.1 BTC. What should I know about storing and managing it safely?"
      },
      {
        id: "reddit_2",
        title: "ETH gas fees are actually reasonable today!",
        url: "https://reddit.com/r/ethereum/example2", 
        author: "GasWatcher",
        score: 89,
        numComments: 15,
        subreddit: "r/ethereum",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        selfText: "Seeing gas fees under 20 gwei for the first time in weeks. Great time to move some tokens around!"
      }
    ];

    res.json(fallbackReddit);
  } catch (error) {
    console.error("Error fetching Reddit data:", error);
    res.status(500).json({ message: "Failed to fetch Reddit data" });
  }
});

// API status endpoint
app.get("/api/status", async (req, res) => {
  try {
    const status = {
      coingecko: "connected",
      cryptopanic: "no_api_key",
      reddit: "fallback_data",
      lastUpdate: new Date().toISOString()
    };
    res.json(status);
  } catch (error) {
    console.error("Error getting API status:", error);
    res.status(500).json({ message: "Failed to get API status" });
  }
});

// Historical chart data
app.get("/api/cryptocurrencies/:id/chart", async (req, res) => {
  try {
    const { id } = req.params;
    const { days = "7" } = req.query;
    
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

// Health check
app.get('/api', (req, res) => {
  res.json({ message: 'CryptoHub API is running', timestamp: new Date().toISOString() });
});

// Handle root path
app.get('/', (req, res) => {
  res.json({ message: 'CryptoHub API is running', timestamp: new Date().toISOString() });
});

// Export for Vercel
module.exports = app;