import cron from 'node-cron';
import axios from 'axios';
import { storage } from './storage';
import { insertNewsArticleSchema } from '@shared/schema';

// Helper function to generate crypto-related image URLs with variety
function generateCryptoImage(title: string): string {
  const titleLower = title.toLowerCase();
  
  // Bitcoin-related images
  if (titleLower.includes('bitcoin') || titleLower.includes('btc')) {
    const bitcoinImages = [
      'https://images.unsplash.com/photo-1640161704729-cbe966a08476?w=800&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800&h=400&fit=crop&q=80'
    ];
    return bitcoinImages[Math.floor(Math.random() * bitcoinImages.length)];
  }
  
  // Ethereum-related images
  if (titleLower.includes('ethereum') || titleLower.includes('eth')) {
    const ethereumImages = [
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1644361567989-a8492747ca36?w=800&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1644361566696-3d442b5b482a?w=800&h=400&fit=crop&q=80'
    ];
    return ethereumImages[Math.floor(Math.random() * ethereumImages.length)];
  }
  
  // DeFi-related images
  if (titleLower.includes('defi') || titleLower.includes('yield') || titleLower.includes('staking')) {
    const defiImages = [
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1642543348152-6c29b9db37b6?w=800&h=400&fit=crop&q=80'
    ];
    return defiImages[Math.floor(Math.random() * defiImages.length)];
  }
  
  // Trading-related images
  if (titleLower.includes('trading') || titleLower.includes('market') || titleLower.includes('price')) {
    const tradingImages = [
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800&h=400&fit=crop&q=80'
    ];
    return tradingImages[Math.floor(Math.random() * tradingImages.length)];
  }
  
  // NFT-related images
  if (titleLower.includes('nft') || titleLower.includes('art') || titleLower.includes('collection')) {
    const nftImages = [
      'https://images.unsplash.com/photo-1643101808200-0d159c1331ee?w=800&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=400&fit=crop&q=80'
    ];
    return nftImages[Math.floor(Math.random() * nftImages.length)];
  }
  
  // General crypto images for other topics
  const generalCryptoImages = [
    'https://images.unsplash.com/photo-1640161704729-cbe966a08476?w=800&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518544866727-e41b5c2ca7cf?w=800&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=400&fit=crop&q=80'
  ];
  return generalCryptoImages[Math.floor(Math.random() * generalCryptoImages.length)];
}

// Enhanced function to generate comprehensive summaries
function generateSummaryFromContent(content: string, title?: string): string {
  if (!content || content.trim().length < 10) {
    // Generate contextual summary based on title if content is missing
    if (title) {
      return generateContextualSummary(title);
    }
    return "Stay informed with the latest developments in cryptocurrency markets, blockchain technology, and digital asset regulations. This article provides insights into current trends affecting the crypto ecosystem.";
  }
  
  // Clean and process the content
  const cleanText = content.replace(/\s+/g, ' ').replace(/[^\w\s.,!?-]/g, '').trim();
  
  // Split into sentences and filter out very short ones
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 15);
  
  if (sentences.length === 0) {
    return title ? generateContextualSummary(title) : generateRandomSummary().substring(0, 300) + '...';
  }
  
  // Take first 2-3 sentences up to ~200 words
  let summary = '';
  let wordCount = 0;
  const targetWords = 150;
  
  for (let i = 0; i < Math.min(sentences.length, 4); i++) {
    const sentence = sentences[i].trim();
    const sentenceWords = sentence.split(' ').length;
    
    if (wordCount + sentenceWords <= targetWords || i === 0) {
      summary += sentence + '. ';
      wordCount += sentenceWords;
    } else {
      break;
    }
  }
  
  // Ensure summary is substantial
  if (wordCount < 30 && title) {
    return generateContextualSummary(title);
  }
  
  return summary.trim();
}

// Generate contextual summary based on title keywords
function generateContextualSummary(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('bitcoin') || titleLower.includes('btc')) {
    return "Bitcoin continues to evolve as the world's leading cryptocurrency, with developments in network upgrades, institutional adoption, and market dynamics. Recent analysis shows growing confidence among investors and technological improvements that enhance security and scalability.";
  }
  
  if (titleLower.includes('ethereum') || titleLower.includes('eth')) {
    return "Ethereum's ecosystem demonstrates robust growth with smart contract innovations, decentralized applications, and ongoing network improvements. The platform's transition to proof-of-stake and layer-2 solutions continues to enhance performance and reduce environmental impact.";
  }
  
  if (titleLower.includes('defi') || titleLower.includes('yield') || titleLower.includes('staking')) {
    return "Decentralized Finance protocols are reshaping traditional financial services through innovative lending, borrowing, and yield generation mechanisms. Current developments focus on security enhancements, user experience improvements, and cross-chain interoperability solutions.";
  }
  
  if (titleLower.includes('nft') || titleLower.includes('art') || titleLower.includes('collection')) {
    return "The NFT marketplace continues expanding beyond digital art into utility-focused applications, gaming assets, and real-world tokenization. Recent trends show increased emphasis on creator royalties, community building, and sustainable blockchain solutions.";
  }
  
  if (titleLower.includes('trading') || titleLower.includes('market') || titleLower.includes('price')) {
    return "Cryptocurrency markets show dynamic movement influenced by institutional adoption, regulatory developments, and technological innovations. Current analysis indicates evolving trading patterns, increased liquidity, and growing correlation with traditional financial markets.";
  }
  
  if (titleLower.includes('regulation') || titleLower.includes('sec') || titleLower.includes('legal')) {
    return "Regulatory frameworks for digital assets continue evolving globally, with governments seeking balance between innovation protection and consumer safety. Recent developments suggest increasing clarity for cryptocurrency businesses and improved compliance standards.";
  }
  
  // Default comprehensive summary
  return "The cryptocurrency ecosystem continues advancing through technological innovation, regulatory clarity, and mainstream adoption. Current developments encompass blockchain scalability solutions, institutional investment growth, and enhanced security protocols that strengthen the digital asset infrastructure.";
}

// Generate comprehensive random summaries
function generateRandomSummary(): string {
  const cryptoTopics = [
    "Bitcoin's revolutionary blockchain technology continues to evolve with significant network upgrades and institutional adoption milestones.",
    "Ethereum's smart contract capabilities are expanding through layer-2 solutions and improved consensus mechanisms.",
    "DeFi protocols are transforming traditional finance with innovative lending, borrowing, and yield generation strategies.",
    "NFT marketplaces are evolving beyond digital art into utility-focused applications and real-world asset tokenization.",
    "Layer 2 scaling solutions are dramatically reducing transaction costs while maintaining security and decentralization principles."
  ];

  const marketAnalysis = [
    "Technical analysis indicates strong bullish momentum with key resistance levels being tested. Trading volumes have increased significantly, suggesting institutional interest is growing.",
    "Market sentiment remains cautiously optimistic despite recent volatility. On-chain metrics reveal increasing network activity and wallet growth, indicating fundamental strength.",
    "Current market conditions present both growth potential and inherent risks. Successful navigation requires understanding underlying technology and staying informed about regulatory developments.",
    "The regulatory landscape continues to evolve, creating opportunities for compliant market participants while establishing clearer guidelines for institutional adoption."
  ];

  const selectedTopic = cryptoTopics[Math.floor(Math.random() * cryptoTopics.length)];
  const selectedMarket = marketAnalysis[Math.floor(Math.random() * marketAnalysis.length)];

  return `${selectedTopic} ${selectedMarket} As the industry matures, we expect increased traditional finance integration and clearer regulatory frameworks to emerge.`;
}

async function fetchLatestNews() {
  console.log('🕒 Starting scheduled news fetch...');
  const articles = [];
  const apiSources = [];

  try {
    // 1. CryptoCompare News API
    try {
      console.log("Fetching from CryptoCompare...");
      const cryptoCompareResponse = await axios.get(
        "https://min-api.cryptocompare.com/data/v2/news/",
        {
          params: {
            categories: 'BTC,ETH,Trading,Blockchain',
            excludeCategories: 'Sponsored',
            lTs: Math.floor(Date.now() / 1000) - 3600 // Last hour
          }
        }
      );

      if (cryptoCompareResponse.data?.Data) {
        apiSources.push("CryptoCompare");
        console.log(`✅ CryptoCompare API: Fetched ${cryptoCompareResponse.data.Data.length} articles`);
        
        for (const item of cryptoCompareResponse.data.Data.slice(0, 10)) {
          const article = {
            title: item.title,
            description: item.body ? item.body.substring(0, 200) + "..." : item.title,
            content: item.body,
            url: item.url || item.guid,
            source: item.source_info?.name || "CryptoCompare",
            author: null,
            publishedAt: new Date(item.published_on * 1000),
            imageUrl: item.imageurl || generateCryptoImage(item.title),
            sentiment: "neutral",
            category: item.categories?.split(',')[0] || null,
            summary: generateSummaryFromContent(item.body || item.title, item.title)
          };
          
          const validatedArticle = insertNewsArticleSchema.parse(article);
          const savedArticle = await storage.createNewsArticle(validatedArticle);
          articles.push(savedArticle);
        }
      }
    } catch (error) {
      console.error("CryptoCompare API error:", (error as any)?.message);
    }

    // 2. Reddit Crypto News
    try {
      console.log("Fetching from Reddit r/CryptoCurrency...");
      const redditResponse = await axios.get(
        "https://www.reddit.com/r/CryptoCurrency/hot.json",
        {
          params: { limit: 10 },
          headers: { 'User-Agent': 'BasedNews/1.0' }
        }
      );

      if (redditResponse.data?.data?.children) {
        apiSources.push("Reddit");
        console.log(`✅ Reddit API: Fetched ${redditResponse.data.data.children.length} posts`);
        
        for (const post of redditResponse.data.data.children.slice(0, 5)) {
          const item = post.data;
          if (!item.is_self && item.url && !item.url.includes('reddit.com')) {
            const article = {
              title: item.title,
              description: item.selftext ? item.selftext.substring(0, 200) + "..." : item.title,
              content: item.selftext,
              url: item.url,
              source: "Reddit Crypto",
              author: item.author,
              publishedAt: new Date(item.created_utc * 1000),
              imageUrl: item.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&') || generateCryptoImage(item.title),
              sentiment: "neutral",
              summary: generateSummaryFromContent(item.selftext || item.title)
            };
            
            const validatedArticle = insertNewsArticleSchema.parse(article);
            const savedArticle = await storage.createNewsArticle(validatedArticle);
            articles.push(savedArticle);
          }
        }
      }
    } catch (error) {
      console.error("Reddit API error:", (error as any)?.message);
    }

    if (articles.length > 0) {
      console.log(`✅ Successfully fetched ${articles.length} new articles from: ${apiSources.join(', ')}`);
    } else {
      console.log('📰 No new articles found this hour');
    }

    return articles;
  } catch (error) {
    console.error('❌ Error in scheduled news fetch:', error);
    return [];
  }
}

export function startNewsScheduler() {
  console.log('🚀 Starting news scheduler - updates every hour');
  
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log(`🕐 Running hourly news update - ${new Date().toISOString()}`);
    await fetchLatestNews();
  });

  // Initial fetch
  setTimeout(async () => {
    console.log('🏁 Running initial news fetch...');
    await fetchLatestNews();
  }, 5000); // Wait 5 seconds after server start
}