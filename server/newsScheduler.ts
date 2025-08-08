import cron from 'node-cron';
import axios from 'axios';
import { storage } from './storage';
import { insertNewsArticleSchema } from '@shared/schema';

// Generate crypto image placeholder
function generateCryptoImage(title: string): string {
  const cryptoKeywords = ['bitcoin', 'ethereum', 'crypto', 'blockchain', 'defi', 'nft'];
  const hasKeyword = cryptoKeywords.some(keyword => title.toLowerCase().includes(keyword));
  
  if (hasKeyword) {
    return `https://images.unsplash.com/photo-1640161704729-cbe966a08476?w=800&h=400&fit=crop&q=80`;
  }
  
  return `https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop&q=80`;
}

// Generate summary from content
function generateSummaryFromContent(content: string): string {
  if (!content || content.length < 100) {
    return "Stay informed with the latest developments in cryptocurrency markets, blockchain technology, and digital asset regulations. This article provides insights into current trends affecting the crypto ecosystem.";
  }
  
  // Extract first few sentences as summary
  const sentences = content.split('.').filter(s => s.trim().length > 0);
  const summary = sentences.slice(0, 3).join('. ').trim();
  
  if (summary.length > 300) {
    return summary.substring(0, 297) + '...';
  }
  
  return summary + '.';
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
            summary: generateSummaryFromContent(item.body || item.title)
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