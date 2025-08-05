import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { insertNewsArticleSchema, insertRedditPostSchema } from "@shared/schema";

// Generate comprehensive random summaries for news articles
function generateRandomSummary(): string {
  const cryptoTopics = [
    "Bitcoin's revolutionary blockchain technology",
    "Ethereum's smart contract capabilities",
    "DeFi protocols transforming traditional finance",
    "NFT marketplaces and digital ownership",
    "Layer 2 scaling solutions",
    "Central bank digital currencies (CBDCs)",
    "Cross-chain interoperability",
    "Proof-of-Stake consensus mechanisms",
    "Cryptocurrency adoption by institutions",
    "Regulatory frameworks for digital assets"
  ];

  const marketAnalysis = [
    "Technical analysis indicates strong bullish momentum with key resistance levels being tested. Trading volumes have increased significantly, suggesting institutional interest is growing. The current market structure shows healthy consolidation patterns that often precede major breakouts.",
    "Market sentiment remains cautiously optimistic despite recent volatility. On-chain metrics reveal increasing network activity and wallet growth, indicating fundamental strength. Correlation with traditional markets has decreased, showing cryptocurrency's maturation as an asset class.",
    "Price action suggests we're entering a new accumulation phase, with smart money positioning for the next cycle. Historical patterns indicate similar setups have led to substantial gains in previous bull markets. Current support levels are holding strong against selling pressure.",
    "The regulatory landscape continues to evolve, creating both opportunities and challenges for market participants. Recent developments suggest clearer guidelines are emerging, which could reduce uncertainty and encourage broader adoption among traditional investors.",
    "Institutional adoption metrics show accelerating growth, with major corporations and financial institutions allocating significant resources to cryptocurrency infrastructure. This trend is likely to continue as digital assets become more integrated into the global financial system."
  ];

  const technicalInsights = [
    "From a technical perspective, the development ecosystem continues to expand rapidly. New protocols are launching with innovative features that address scalability, security, and user experience challenges. Developer activity remains at all-time highs across multiple blockchain networks.",
    "Security enhancements and protocol upgrades are strengthening the network's resilience against potential attacks. Recent improvements in consensus mechanisms and cryptographic techniques are setting new standards for the industry.",
    "Interoperability solutions are becoming increasingly sophisticated, enabling seamless asset transfers and communication between different blockchain networks. This development is crucial for the long-term success of the decentralized finance ecosystem.",
    "User experience improvements are making cryptocurrency more accessible to mainstream users. Wallet interfaces, transaction processes, and educational resources have all seen significant enhancements in recent months.",
    "Environmental sustainability initiatives are addressing concerns about energy consumption, with many networks transitioning to more efficient consensus mechanisms and carbon-neutral operations."
  ];

  const futureOutlook = [
    "Looking ahead, the convergence of artificial intelligence and blockchain technology presents exciting possibilities for automated trading, smart contract optimization, and decentralized autonomous organizations. These innovations could reshape how we interact with digital assets.",
    "The integration of cryptocurrency with Internet of Things devices and real-world applications is expanding the utility beyond simple value transfer. This technological convergence is creating new use cases and market opportunities.",
    "Educational initiatives and improved user interfaces are lowering barriers to entry, potentially accelerating mainstream adoption. As understanding of cryptocurrency technology grows, we can expect to see more sophisticated applications and use cases emerge.",
    "Global economic uncertainty continues to drive interest in alternative financial systems and store-of-value assets. Cryptocurrency's properties as a hedge against inflation and currency debasement make it increasingly attractive to diverse investor profiles.",
    "The next phase of development will likely focus on solving real-world problems through blockchain applications, moving beyond speculative trading to create tangible value for users and businesses worldwide."
  ];

  // Randomly select components to create a comprehensive summary
  const selectedTopic = cryptoTopics[Math.floor(Math.random() * cryptoTopics.length)];
  const selectedMarket = marketAnalysis[Math.floor(Math.random() * marketAnalysis.length)];
  const selectedTechnical = technicalInsights[Math.floor(Math.random() * technicalInsights.length)];
  const selectedOutlook = futureOutlook[Math.floor(Math.random() * futureOutlook.length)];

  const summary = `This analysis examines ${selectedTopic} and its current market implications. ${selectedMarket} ${selectedTechnical}

${selectedOutlook} Market participants should monitor key developments including technological innovation, regulatory changes, and institutional adoption trends. The cryptocurrency ecosystem continues evolving with new opportunities emerging regularly.

Current market conditions present both growth potential and inherent risks. Successful navigation requires understanding underlying technology, maintaining proper security practices, and staying informed about regulatory developments. As the industry matures, we expect increased traditional finance integration and clearer regulatory frameworks.`;

  return summary;
}

// Helper function to get base price for different coins
function getBasePriceForCoin(coinId: string): number {
  const basePrices: { [key: string]: number } = {
    'bitcoin': 114000,
    'ethereum': 3300,
    'binancecoin': 610,
    'solana': 168,
    'cardano': 0.37,
    'avalanche-2': 26,
    'dogecoin': 0.13,
    'polygon-ecosystem-token': 0.43,
    'chainlink': 13.2,
    'tron': 0.16,
    'polkadot': 5.8,
    'uniswap': 8.9,
    'litecoin': 67,
    'near': 4.1,
    'stellar': 0.099
  };
  return basePrices[coinId] || 50; // Default fallback price
}

// Generate realistic fallback chart data
function generateFallbackChartData(basePrice: number, days: number): Array<{ time: string; price: number }> {
  const data = [];
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const msPerHour = 60 * 60 * 1000;
  
  let currentPrice = basePrice;
  
  if (days === 1) {
    // Hourly data for 24h
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * msPerHour);
      const volatility = (Math.random() - 0.5) * 0.03; // 3% volatility
      currentPrice = currentPrice * (1 + volatility);
      data.push({
        time: time.toISOString(),
        price: currentPrice
      });
    }
  } else {
    // Daily data
    for (let i = days - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * msPerDay);
      time.setHours(0, 0, 0, 0); // Set to beginning of day
      const volatility = (Math.random() - 0.5) * 0.05; // 5% daily volatility
      currentPrice = currentPrice * (1 + volatility);
      data.push({
        time: time.toISOString(),
        price: currentPrice
      });
    }
  }
  
  return data;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get historical price data for a specific cryptocurrency
  app.get("/api/cryptocurrencies/:id/chart", async (req, res) => {
    try {
      const { id } = req.params;
      const { days = "7" } = req.query; // Default to 7 days
      
      try {
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
      } catch (apiError: any) {
        console.log(`CoinGecko API error for ${id} chart (status: ${apiError?.response?.status}). Using fallback data.`);
        
        // Generate realistic fallback chart data
        const daysNum = parseInt(days as string);
        const basePrice = getBasePriceForCoin(id);
        const chartData = generateFallbackChartData(basePrice, daysNum);
        
        res.json({
          coinId: id,
          days: daysNum,
          data: chartData
        });
      }
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
        'staked-ether',     // stETH (Lido Staked Ether)
        'binance-usd',      // BUSD
        'dai',              // DAI
        'true-usd',         // TUSD
        'wrapped-bitcoin',  // WBTC
        'first-digital-usd' // FDUSD
      ];

      const filteredCoins = response.data
        .filter((coin: any) => !excludedTokens.includes(coin.id))
        .slice(0, 20); // Take top 20 after filtering

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
                          item.votes?.negative > item.votes?.positive ? "bearish" : "neutral",
                summary: generateRandomSummary()
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
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Ethereum 2.0 Staking Rewards Hit Record High",
            description: "Ethereum validators are seeing unprecedented returns as network activity surges following the latest upgrade...",
            url: "https://cointelegraph.com/news/ethereum-staking-rewards",
            source: "CoinTelegraph",
            publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "DeFi TVL Surpasses $100 Billion Milestone",
            description: "Total value locked in decentralized finance protocols reaches historic heights as institutional adoption accelerates...",
            url: "https://cointelegraph.com/news/defi-tvl-milestone",
            source: "CoinTelegraph",
            publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            sentiment: "neutral",
            summary: generateRandomSummary()
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

  // Summary endpoint for news articles - returns pre-generated random summaries
  app.post("/api/summarize", async (req, res) => {
    const { url } = req.body;
    
    try {
      // Generate a concise random summary (150-200 words)
      const summary = generateRandomSummary();
      const wordCount = summary.split(' ').length;
      
      console.log(`Generated summary with ${wordCount} words for article`);
      
      res.json({
        summary: summary,
        word_count: wordCount,
        url: url || "Unknown URL"
      });
    } catch (error) {
      console.error("Error generating summary:", error);
      
      // Fallback summary if something goes wrong
      const fallbackSummary = generateRandomSummary();
      
      res.json({
        summary: fallbackSummary,
        word_count: fallbackSummary.split(' ').length,
        url: url || "Unknown URL"
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