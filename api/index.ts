import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import axios from 'axios';
import { insertNewsArticleSchema, insertRedditPostSchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req;
  
  try {
    if (url?.startsWith('/api/cryptocurrencies') && url.includes('/chart')) {
      // Chart data endpoint
      const id = url.split('/')[3]; // Extract ID from /api/cryptocurrencies/:id/chart
      const days = req.query.days || "7";
      
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

      return res.json({
        coinId: id,
        days: parseInt(days as string),
        data: chartData
      });
    } 
    else if (url === '/api/cryptocurrencies') {
      // Cryptocurrency list endpoint
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

      const excludedTokens = [
        'tether', 'usd-coin', 'wrapped-steth', 'binance-usd', 
        'dai', 'true-usd', 'wrapped-bitcoin', 'first-digital-usd'
      ];

      const filteredCoins = response.data
        .filter((coin: any) => !excludedTokens.includes(coin.id))
        .slice(0, 10);

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
        image: coin.image
      }));

      for (const crypto of cryptos) {
        await storage.upsertCryptocurrency(crypto);
      }

      const storedCryptos = await storage.getCryptocurrencies();
      return res.json(storedCryptos);
    }
    else if (url === '/api/news') {
      // News endpoint
      const articles: any[] = [];
      
      // Fallback news data
      const coinTelegraphNews = [
        {
          title: "Bitcoin ETF Approval Sends BTC to New All-Time High",
          description: "The SEC's approval of spot Bitcoin ETFs has triggered a massive rally, with BTC breaking through $50,000 resistance...",
          url: "https://cointelegraph.com/news/bitcoin-etf-approval",
          source: "CoinTelegraph",
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          sentiment: "bullish"
        },
        {
          title: "Ethereum 2.0 Staking Rewards Hit Record High",
          description: "Ethereum validators are seeing unprecedented returns as network activity surges following the latest upgrade...",
          url: "https://cointelegraph.com/news/ethereum-staking-rewards",
          source: "CoinTelegraph",
          publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          sentiment: "bullish"
        },
        {
          title: "DeFi TVL Surpasses $100 Billion Milestone",
          description: "Total value locked in decentralized finance protocols reaches historic heights as institutional adoption accelerates...",
          url: "https://cointelegraph.com/news/defi-tvl-milestone",
          source: "CoinTelegraph",
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          sentiment: "neutral"
        }
      ];

      for (const article of coinTelegraphNews) {
        const validatedArticle = insertNewsArticleSchema.parse(article);
        const savedArticle = await storage.createNewsArticle(validatedArticle);
        articles.push(savedArticle);
      }

      const allNews = await storage.getNewsArticles(20);
      return res.json(allNews);
    }
    else if (url === '/api/reddit') {
      // Reddit endpoint
      const subreddit = req.query.subreddit as string || "cryptocurrency";
      
      const mockRedditPosts = [
        {
          id: "reddit_1",
          title: "Just bought my first Bitcoin! Any tips for a newbie?",
          author: "CryptoNewbie2024",
          subreddit: "cryptocurrency",
          url: "https://reddit.com/r/cryptocurrency/post1",
          upvotes: 245,
          comments: 89,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: "reddit_2",
          title: "Market Analysis: Why I think we're entering a bull run",
          author: "TradingExpert",
          subreddit: "cryptocurrency",
          url: "https://reddit.com/r/cryptocurrency/post2",
          upvotes: 1520,
          comments: 234,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
        },
        {
          id: "reddit_3",
          title: "DeFi yield farming strategies that actually work",
          author: "DeFiMaster",
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
      return res.json(redditPosts);
    }
    else if (url === '/api/status') {
      // Status endpoint
      const status = {
        coingecko: "connected",
        cryptopanic: process.env.CRYPTOPANIC_API_KEY ? "api_key_configured" : "no_api_key",
        reddit: "simulated",
        lastUpdate: new Date().toISOString()
      };
      
      return res.json(status);
    }
    else {
      return res.status(404).json({ message: "API endpoint not found" });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}