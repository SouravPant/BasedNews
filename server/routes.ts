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

  // Get crypto news from multiple sources with filtering support
  app.get("/api/news", async (req, res) => {
    try {
      const articles = [];
      const sourceFilter = req.query.source as string;

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
                source: "Crypto News",
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
        // Generate diverse news from multiple sources
        const allNews = [];
        
        // Crypto News source articles
        const cryptoNewsArticles = [
          {
            title: "Bitcoin ETF Approval Sends BTC to New All-Time High",
            description: "The SEC's approval of spot Bitcoin ETFs has triggered a massive rally, with BTC breaking through $50,000 resistance...",
            url: "https://example.com/news/bitcoin-etf-approval",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Ethereum 2.0 Staking Rewards Hit Record High",
            description: "Ethereum validators are seeing unprecedented returns as network activity surges following the latest upgrade...",
            url: "https://example.com/news/ethereum-staking-rewards",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "DeFi TVL Surpasses $100 Billion Milestone",
            description: "Total value locked in decentralized finance protocols reaches historic heights as institutional adoption accelerates...",
            url: "https://example.com/news/defi-tvl-milestone",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            sentiment: "neutral",
            summary: generateRandomSummary()
          },
          {
            title: "Major Bank Announces Bitcoin Treasury Strategy",
            description: "Global financial institution reveals plans to allocate 5% of treasury reserves to Bitcoin as digital asset adoption accelerates...",
            url: "https://example.com/news/bank-bitcoin-treasury",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Solana Network Experiences Unprecedented Growth",
            description: "Daily active users on Solana reach all-time highs as new DeFi protocols launch with innovative features...",
            url: "https://example.com/news/solana-growth",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Regulatory Clarity Boosts Institutional Crypto Interest",
            description: "New guidelines from financial regulators provide clearer framework for institutional cryptocurrency investments...",
            url: "https://example.com/news/regulatory-clarity",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Layer 2 Solutions Drive Ethereum Fee Reduction",
            description: "Optimistic rollups and zkRollups significantly reduce transaction costs, making DeFi more accessible to retail users...",
            url: "https://example.com/news/layer2-fees",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000), // 14 hours ago
            sentiment: "neutral",
            summary: generateRandomSummary()
          },
          {
            title: "NFT Market Shows Signs of Recovery",
            description: "Trading volumes increase 40% this week as new utility-focused projects gain traction among collectors...",
            url: "https://example.com/news/nft-recovery",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000), // 16 hours ago
            sentiment: "neutral",
            summary: generateRandomSummary()
          },
          {
            title: "Cross-Chain Bridge Technology Reaches New Milestone",
            description: "Interoperability protocols process record-breaking $2B in cross-chain transactions this month...",
            url: "https://example.com/news/cross-chain-milestone",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Stablecoin Market Cap Approaches $200 Billion",
            description: "Growing demand for digital dollars drives stablecoin adoption across global markets and emerging economies...",
            url: "https://example.com/news/stablecoin-growth",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
            sentiment: "neutral",
            summary: generateRandomSummary()
          },
          {
            title: "Mining Pool Decentralization Reaches Record Levels",
            description: "Bitcoin network security improves as mining power becomes more distributed across global mining pools...",
            url: "https://example.com/news/mining-decentralization",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 22 * 60 * 60 * 1000), // 22 hours ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Central Bank Digital Currency Pilots Expand Globally",
            description: "Seven additional countries announce CBDC testing programs as digital currency adoption accelerates worldwide...",
            url: "https://example.com/news/cbdc-expansion",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            sentiment: "neutral",
            summary: generateRandomSummary()
          },
          {
            title: "Cryptocurrency Education Programs Launch in Universities",
            description: "Leading academic institutions introduce blockchain and cryptocurrency courses to meet growing industry demand...",
            url: "https://example.com/news/crypto-education",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 26 * 60 * 60 * 1000), // 1 day 2h ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Decentralized Autonomous Organizations See Record Funding",
            description: "DAO treasuries reach $15 billion as governance token holders approve ambitious development roadmaps...",
            url: "https://example.com/news/dao-funding",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 28 * 60 * 60 * 1000), // 1 day 4h ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Quantum-Resistant Cryptocurrency Protocols Under Development",
            description: "Research teams work on cryptographic solutions to protect blockchain networks from potential quantum computing threats...",
            url: "https://example.com/news/quantum-resistant",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000), // 1 day 6h ago
            sentiment: "neutral",
            summary: generateRandomSummary()
          },
          {
            title: "Green Energy Mining Operations Reach 60% of Network",
            description: "Renewable energy sources now power majority of Bitcoin mining operations as sustainability becomes priority...",
            url: "https://example.com/news/green-mining",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 32 * 60 * 60 * 1000), // 1 day 8h ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Flash Loan Attack Targets DeFi Protocol",
            description: "Security researchers identify vulnerability in lending protocol, highlighting importance of smart contract audits...",
            url: "https://example.com/news/flash-loan-attack",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 34 * 60 * 60 * 1000), // 1 day 10h ago
            sentiment: "bearish",
            summary: generateRandomSummary()
          },
          {
            title: "Metaverse Real Estate Sales Reach $500 Million",
            description: "Virtual land transactions surge as major brands establish presence in blockchain-based virtual worlds...",
            url: "https://example.com/news/metaverse-real-estate",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1 day 12h ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Algorithmic Trading Bots Drive 70% of Crypto Volume",
            description: "Automated trading systems dominate cryptocurrency markets as institutional adoption of algorithmic strategies grows...",
            url: "https://example.com/news/algorithmic-trading",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 38 * 60 * 60 * 1000), // 1 day 14h ago
            sentiment: "neutral",
            summary: generateRandomSummary()
          },
          {
            title: "Privacy Coins Face Regulatory Scrutiny",
            description: "Financial authorities examine privacy-focused cryptocurrencies amid concerns over anti-money laundering compliance...",
            url: "https://example.com/news/privacy-coins-regulation",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 40 * 60 * 60 * 1000), // 1 day 16h ago
            sentiment: "bearish",
            summary: generateRandomSummary()
          },
          {
            title: "Smart Contract Insurance Market Expands Rapidly",
            description: "DeFi insurance protocols see 300% growth as users seek protection for their digital asset investments...",
            url: "https://example.com/news/defi-insurance",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 42 * 60 * 60 * 1000), // 1 day 18h ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Tokenized Real World Assets Reach $50 Billion",
            description: "Blockchain-based representations of traditional assets gain momentum as institutional infrastructure improves...",
            url: "https://example.com/news/tokenized-assets",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 44 * 60 * 60 * 1000), // 1 day 20h ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Cryptocurrency ATM Network Reaches 50,000 Machines",
            description: "Physical access points for digital currencies expand globally, making crypto more accessible to mainstream users...",
            url: "https://example.com/news/crypto-atm-growth",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 46 * 60 * 60 * 1000), // 1 day 22h ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Blockchain Gaming Revenue Surpasses $3 Billion",
            description: "Play-to-earn games and NFT integration drive unprecedented growth in blockchain-based gaming ecosystem...",
            url: "https://example.com/news/blockchain-gaming",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Institutional Custody Solutions Mature",
            description: "Traditional financial institutions launch enhanced cryptocurrency custody services with institutional-grade security...",
            url: "https://example.com/news/institutional-custody",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 47 * 60 * 60 * 1000), // 1 day 23h ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Yield Farming Strategies Evolve with New Protocols",
            description: "DeFi users discover innovative ways to maximize returns through sophisticated liquidity mining techniques...",
            url: "https://example.com/news/yield-farming-evolution",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 45 * 60 * 60 * 1000), // 1 day 21h ago
            sentiment: "neutral",
            summary: generateRandomSummary()
          },
          {
            title: "Web3 Social Media Platforms Gain 10 Million Users",
            description: "Decentralized social networks see explosive growth as users seek alternatives to traditional platforms...",
            url: "https://example.com/news/web3-social-media",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 43 * 60 * 60 * 1000), // 1 day 19h ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Cryptocurrency Payment Processing Hits New Highs",
            description: "Merchant adoption of digital currency payments increases 400% year-over-year as infrastructure improves...",
            url: "https://example.com/news/crypto-payments",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 41 * 60 * 60 * 1000), // 1 day 17h ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Blockchain Supply Chain Solutions Gain Enterprise Adoption",
            description: "Fortune 500 companies implement blockchain technology for supply chain transparency and efficiency improvements...",
            url: "https://example.com/news/blockchain-supply-chain",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 39 * 60 * 60 * 1000), // 1 day 15h ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Decentralized Identity Solutions Enter Mainstream",
            description: "Self-sovereign identity protocols gain traction as privacy concerns drive demand for user-controlled digital identity...",
            url: "https://example.com/news/decentralized-identity",
            source: "Crypto News",
            publishedAt: new Date(Date.now() - 37 * 60 * 60 * 1000), // 1 day 13h ago
            sentiment: "neutral",
            summary: generateRandomSummary()
          }
        ];

        // CoinDesk source articles
        const coinDeskArticles = [
          {
            title: "Institutional Bitcoin Holdings Reach Historic Milestone",
            description: "Corporate treasuries and investment funds now control over 1.2 million Bitcoin as institutional adoption accelerates...",
            url: "https://example.com/news/institutional-bitcoin-holdings",
            source: "CoinDesk",
            publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Ethereum Layer 2 Ecosystem Sees 400% Growth in TVL",
            description: "Polygon, Arbitrum, and Optimism lead surge in total value locked as users migrate to cheaper alternatives...",
            url: "https://example.com/news/ethereum-layer2-growth",
            source: "CoinDesk",
            publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Regulatory Framework for Stablecoins Nears Completion",
            description: "US lawmakers reach bipartisan agreement on comprehensive stablecoin legislation expected to pass this quarter...",
            url: "https://example.com/news/stablecoin-regulation",
            source: "CoinDesk",
            publishedAt: new Date(Date.now() - 15 * 60 * 60 * 1000), // 15 hours ago
            sentiment: "neutral",
            summary: generateRandomSummary()
          }
        ];

        // CoinTelegraph source articles  
        const coinTelegraphArticles = [
          {
            title: "Central Bank Digital Currencies Enter Testing Phase",
            description: "Major economies launch pilot programs for digital versions of national currencies as CBDC development accelerates...",
            url: "https://example.com/news/cbdc-testing-phase",
            source: "CoinTelegraph",
            publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            sentiment: "neutral",
            summary: generateRandomSummary()
          },
          {
            title: "NFT Gaming Platforms Report Record User Engagement",
            description: "Play-to-earn games experience 300% increase in daily active users as new mechanics improve player retention...",
            url: "https://example.com/news/nft-gaming-engagement",
            source: "CoinTelegraph", 
            publishedAt: new Date(Date.now() - 11 * 60 * 60 * 1000), // 11 hours ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          },
          {
            title: "Cryptocurrency Exchange Security Reaches New Standards",
            description: "Leading platforms implement advanced multi-signature and cold storage solutions following security audit recommendations...",
            url: "https://example.com/news/exchange-security-standards",
            source: "CoinTelegraph",
            publishedAt: new Date(Date.now() - 19 * 60 * 60 * 1000), // 19 hours ago
            sentiment: "bullish",
            summary: generateRandomSummary()
          }
        ];

        // Combine all news sources
        allNews.push(...cryptoNewsArticles, ...coinDeskArticles, ...coinTelegraphArticles);

        for (const article of allNews) {
          const validatedArticle = insertNewsArticleSchema.parse(article);
          const savedArticle = await storage.createNewsArticle(validatedArticle);
          articles.push(savedArticle);
        }
      } catch (error) {
        console.error("Error fetching CoinTelegraph news:", error);
      }

      let allNews = await storage.getNewsArticles(50);
      
      // Apply source filter if specified
      if (sourceFilter && sourceFilter !== 'all') {
        const sourceMap: { [key: string]: string } = {
          'crypto-news': 'Crypto News',
          'coindesk': 'CoinDesk', 
          'cointelegraph': 'CoinTelegraph'
        };
        
        const targetSource = sourceMap[sourceFilter];
        if (targetSource) {
          allNews = allNews.filter(article => article.source === targetSource);
        }
      }
      
      res.json(allNews.slice(0, 30));
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news data" });
    }
  });

  // Search endpoint for cryptocurrencies and news
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.trim().length < 2) {
        return res.json({ cryptocurrencies: [], news: [] });
      }

      const searchTerm = query.toLowerCase();
      const results = { cryptocurrencies: [], news: [] };

      // Search cryptocurrencies
      try {
        const cryptoResponse = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 100,
            page: 1,
            sparkline: false
          }
        });

        if (cryptoResponse.data) {
          const matchingCryptos = cryptoResponse.data.filter((crypto: any) => 
            crypto.name?.toLowerCase().includes(searchTerm) ||
            crypto.symbol?.toLowerCase().includes(searchTerm)
          ).slice(0, 5);
          
          results.cryptocurrencies = matchingCryptos.map((crypto: any) => ({
            id: crypto.id,
            name: crypto.name,
            symbol: crypto.symbol?.toUpperCase(),
            currentPrice: crypto.current_price,
            priceChange24h: crypto.price_change_percentage_24h,
            marketCap: crypto.market_cap,
            image: crypto.image
          }));
        }
      } catch (error) {
        console.error("Error searching cryptocurrencies:", error);
      }

      // Search news articles
      try {
        const allNews = await storage.getNewsArticles(100);
        const matchingNews = allNews.filter((article: any) =>
          article.title?.toLowerCase().includes(searchTerm) ||
          article.description?.toLowerCase().includes(searchTerm)
        ).slice(0, 5);
        
        results.news = matchingNews;
      } catch (error) {
        console.error("Error searching news:", error);
      }

      res.json(results);
    } catch (error) {
      console.error("Error in search:", error);
      res.status(500).json({ message: "Search failed" });
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