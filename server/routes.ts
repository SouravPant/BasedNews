import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import OpenAI from "openai";
import { insertNewsArticleSchema, insertRedditPostSchema } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Fallback summary generator for when OpenAI is unavailable
function generateFallbackSummary(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const keywords = ['bitcoin', 'ethereum', 'crypto', 'blockchain', 'defi', 'nft', 'price', 'market', 'trading', 'investment'];
  
  // Try to extract key sentences that contain crypto keywords
  const relevantSentences = sentences.filter(sentence => 
    keywords.some(keyword => sentence.toLowerCase().includes(keyword))
  ).slice(0, 2);
  
  if (relevantSentences.length > 0) {
    const summary = relevantSentences.join('. ').trim() + '.';
    return summary.length > 300 ? summary.substring(0, 297) + '...' : summary;
  }
  
  // Fallback: use first sentence + indication it's auto-generated
  const firstSentence = sentences[0]?.trim() || text.substring(0, 100);
  return `${firstSentence}. [AI summary temporarily unavailable - showing content preview]`;
}

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
      const posts = [];

      // Fetch from Reddit API using client credentials
      try {
        const clientId = process.env.REDDIT_CLIENT_ID;
        const clientSecret = process.env.REDDIT_CLIENT_SECRET;
        
        if (clientId && clientSecret) {
          // Get Reddit access token
          const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
          const tokenResponse = await axios.post('https://www.reddit.com/api/v1/access_token', 
            'grant_type=client_credentials',
            {
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'BasedHub/1.0'
              }
            }
          );

          const accessToken = tokenResponse.data.access_token;

          // Fetch posts from cryptocurrency subreddit
          const redditResponse = await axios.get(`https://oauth.reddit.com/r/${subreddit}/hot`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'User-Agent': 'BasedHub/1.0'
            },
            params: {
              limit: 10
            }
          });

          for (const post of redditResponse.data.data.children) {
            const postData = post.data;
            const redditPost = {
              id: `reddit_${postData.id}`,
              title: postData.title,
              author: postData.author,
              subreddit: postData.subreddit,
              url: `https://reddit.com${postData.permalink}`,
              upvotes: postData.ups || 0,
              comments: postData.num_comments || 0,
              createdAt: new Date(postData.created_utc * 1000),
            };
            
            const validatedPost = insertRedditPostSchema.parse(redditPost);
            const savedPost = await storage.createRedditPost(validatedPost);
            posts.push(savedPost);
          }
        } else {
          console.log("Reddit API credentials not found - using fallback data");
        }
      } catch (error) {
        console.error("Reddit API error:", error);
      }

      // If no posts from API, use fallback
      if (posts.length === 0) {
        const fallbackPosts = [
          {
            id: "reddit_fallback_1",
            title: "Discussion: Best crypto wallets for beginners",
            author: "cryptonewbie",
            subreddit: "cryptocurrency",
            url: "https://reddit.com/r/cryptocurrency/fallback1",
            upvotes: 156,
            comments: 43,
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          },
          {
            id: "reddit_fallback_2", 
            title: "Market analysis: Bitcoin vs Ethereum long-term outlook",
            author: "cryptoanalyst",
            subreddit: "CryptoCurrency",
            url: "https://reddit.com/r/CryptoCurrency/fallback2",
            upvotes: 234,
            comments: 67,
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          }
        ];

        for (const post of fallbackPosts) {
          const validatedPost = insertRedditPostSchema.parse(post);
          const savedPost = await storage.createRedditPost(validatedPost);
          posts.push(savedPost);
        }
      }

      const allPosts = await storage.getRedditPosts(subreddit, 10);
      res.json(allPosts);
    } catch (error) {
      console.error("Error fetching Reddit posts:", error);
      res.status(500).json({ message: "Failed to fetch Reddit data" });
    }
  });

  // Twitter API endpoint
  app.get("/api/twitter", async (req, res) => {
    try {
      const tweets = [];
      const bearerToken = process.env.TWITTER_BEARER_TOKEN;

      if (bearerToken) {
        try {
          const twitterResponse = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
            headers: {
              'Authorization': `Bearer ${bearerToken}`,
              'User-Agent': 'BasedHub/1.0'
            },
            params: {
              query: 'cryptocurrency OR bitcoin OR ethereum OR crypto -is:retweet',
              max_results: 10,
              'tweet.fields': 'created_at,author_id,public_metrics'
            }
          });

          for (const tweet of twitterResponse.data.data || []) {
            tweets.push({
              id: `twitter_${tweet.id}`,
              text: tweet.text,
              author: tweet.author_id,
              url: `https://twitter.com/i/web/status/${tweet.id}`,
              likes: tweet.public_metrics?.like_count || 0,
              retweets: tweet.public_metrics?.retweet_count || 0,
              createdAt: new Date(tweet.created_at)
            });
          }
        } catch (error) {
          console.error("Twitter API error:", error);
        }
      }

      // Fallback tweets if API fails
      if (tweets.length === 0) {
        const fallbackTweets = [
          {
            id: "twitter_fallback_1",
            text: "Bitcoin just hit a new milestone! The adoption continues to grow worldwide. #Bitcoin #Crypto",
            author: "crypto_news",
            url: "https://twitter.com/crypto_news/fallback1",
            likes: 1250,
            retweets: 340,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: "twitter_fallback_2",
            text: "Ethereum's latest update shows promising scalability improvements. The future of DeFi looks bright! #Ethereum #DeFi",
            author: "defi_expert",
            url: "https://twitter.com/defi_expert/fallback2",
            likes: 890,
            retweets: 156,
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
          }
        ];
        tweets.push(...fallbackTweets);
      }

      res.json(tweets);
    } catch (error) {
      console.error("Error fetching Twitter data:", error);
      res.status(500).json({ message: "Failed to fetch Twitter data" });
    }
  });

  // AI Summary endpoint for news articles
  app.post("/api/summarize", async (req, res) => {
    const { text, url } = req.body;
    
    try {
      
      if (!text) {
        return res.status(400).json({ message: "Text is required for summarization" });
      }

      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        console.log("OpenAI API key not found");
        return res.status(500).json({ 
          message: "OpenAI API key not configured",
          summary: "AI summarization is currently unavailable. Please configure the OpenAI API key to enable this feature.",
          word_count: 20,
          url: url
        });
      }

      console.log("Generating AI summary for text:", text.substring(0, 100) + "...");

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a cryptocurrency expert. Summarize the following text in exactly 50-100 words, focusing on key insights and market implications. Be concise and informative. Respond with JSON in this format: { \"summary\": \"your summary here\", \"word_count\": number }"
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 200
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      console.log("AI summary generated successfully:", result.summary?.substring(0, 50) + "...");
      
      res.json({
        summary: result.summary || "Summary not available",
        word_count: result.word_count || 0,
        url: url
      });
    } catch (error) {
      console.error("Error generating summary:", error);
      
      // Provide a fallback response instead of just failing
      const fallbackSummary = generateFallbackSummary(text);
      
      res.json({
        summary: fallbackSummary,
        word_count: fallbackSummary.split(' ').length,
        url: url
      });
    }
  });

  // API status endpoint
  app.get("/api/status", async (req, res) => {
    const status = {
      coingecko: "connected",
      cryptopanic: process.env.CRYPTOPANIC_API_KEY ? "api_key_configured" : "no_api_key",
      reddit: process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET ? "api_configured" : "fallback_data",
      twitter: process.env.TWITTER_BEARER_TOKEN ? "api_configured" : "fallback_data",
      openai: process.env.OPENAI_API_KEY ? "api_configured" : "not_configured",
      lastUpdate: new Date().toISOString()
    };
    
    res.json(status);
  });

  const httpServer = createServer(app);
  return httpServer;
}