// Vercel cron job endpoint for news fetching
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { storage } from '../../server/storage';
import { insertNewsArticleSchema } from '../../shared/schema';

// Helper function to generate crypto-related image URLs
function generateCryptoImage(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('bitcoin') || titleLower.includes('btc')) {
    const bitcoinImages = [
      'https://images.unsplash.com/photo-1640161704729-cbe966a08476?w=800&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800&h=400&fit=crop&q=80'
    ];
    return bitcoinImages[Math.floor(Math.random() * bitcoinImages.length)];
  }
  
  if (titleLower.includes('ethereum') || titleLower.includes('eth')) {
    const ethereumImages = [
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1644361567989-a8492747ca36?w=800&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1644361566696-3d442b5b482a?w=800&h=400&fit=crop&q=80'
    ];
    return ethereumImages[Math.floor(Math.random() * ethereumImages.length)];
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
  
  // Default comprehensive summary
  return "The cryptocurrency ecosystem continues advancing through technological innovation, regulatory clarity, and mainstream adoption. Current developments encompass blockchain scalability solutions, institutional investment growth, and enhanced security protocols that strengthen the digital asset infrastructure.";
}

function generateSummaryFromContent(content: string, title?: string): string {
  if (!content || content.trim().length < 10) {
    if (title) {
      return generateContextualSummary(title);
    }
    return "Stay informed with the latest developments in cryptocurrency markets, blockchain technology, and digital asset regulations.";
  }
  
  // Clean and process the content
  const cleanText = content.replace(/\s+/g, ' ').replace(/[^\w\s.,!?-]/g, '').trim();
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 15);
  
  if (sentences.length === 0) {
    return title ? generateContextualSummary(title) : "Cryptocurrency market update with latest insights.";
  }
  
  // Take first 2-3 sentences up to ~150 words
  let summary = '';
  let wordCount = 0;
  const targetWords = 150;
  
  for (let i = 0; i < Math.min(sentences.length, 3); i++) {
    const sentence = sentences[i].trim();
    const sentenceWords = sentence.split(' ').length;
    
    if (wordCount + sentenceWords <= targetWords || i === 0) {
      summary += sentence + '. ';
      wordCount += sentenceWords;
    } else {
      break;
    }
  }
  
  return summary.trim();
}

async function fetchLatestNews() {
  console.log('🕒 Vercel cron: Starting scheduled news fetch...');
  const articles: any[] = [];
  const apiSources: string[] = [];

  try {
    // CryptoCompare News API
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
          
          try {
            const validatedArticle = insertNewsArticleSchema.parse(article);
            const savedArticle = await storage.createNewsArticle(validatedArticle);
            articles.push(savedArticle);
          } catch (validationError) {
            console.error('Article validation error:', validationError);
          }
        }
      }
    } catch (error) {
      console.error("CryptoCompare API error:", (error as any)?.message);
    }

    if (articles.length > 0) {
      console.log(`✅ Vercel cron: Successfully fetched ${articles.length} new articles from: ${apiSources.join(', ')}`);
    } else {
      console.log('📰 Vercel cron: No new articles found this hour');
    }

    return articles;
  } catch (error) {
    console.error('❌ Vercel cron: Error in scheduled news fetch:', error);
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify this is a legitimate cron request (optional security)
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const articles = await fetchLatestNews();
    
    res.status(200).json({
      message: 'News fetch completed',
      articlesCount: articles.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job error:', error);
    res.status(500).json({
      message: 'Error fetching news',
      error: (error as Error).message
    });
  }
}