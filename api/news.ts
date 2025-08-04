import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const apiKey = process.env.CRYPTOPANIC_API_KEY;

      if (!apiKey) {
        console.log('CryptoPanic API key not found - using fallback news');
        const fallbackNews = [
          {
            title: "Bitcoin ETF Approval Sends BTC to New All-Time High",
            url: "https://example.com/btc-etf-ath",
            source: "CoinTelegraph",
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            sentiment: "bullish" as const,
            description: "The approval of a major Bitcoin ETF has propelled BTC to unprecedented price levels, marking a significant milestone for cryptocurrency adoption."
          },
          {
            title: "Ethereum 2.0 Staking Rewards Reach Record Levels",
            url: "https://example.com/eth-staking-rewards",
            source: "CryptoPanic",
            publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            sentiment: "bullish" as const,
            description: "Ethereum validators are experiencing higher-than-expected staking rewards as network activity continues to surge."
          },
          {
            title: "DeFi Protocol Security Audit Reveals Critical Vulnerabilities",
            url: "https://example.com/defi-security-audit",
            source: "CoinTelegraph",
            publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            sentiment: "bearish" as const,
            description: "A comprehensive security audit of a popular DeFi protocol has uncovered several critical vulnerabilities that could pose risks to user funds."
          }
        ];
        return res.status(200).json(fallbackNews);
      }

      // Fetch news from CryptoPanic API
      const response = await axios.get('https://cryptopanic.com/api/v1/posts/', {
        params: {
          auth_token: apiKey,
          kind: 'news',
          filter: 'hot',
          page: 1,
          public: true
        }
      });

      const newsArticles = response.data.results.slice(0, 10).map((article: any) => {
        // Determine sentiment based on keywords in title
        let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
        const title = article.title.toLowerCase();
        
        const bullishKeywords = ['surge', 'rally', 'bull', 'gains', 'rise', 'pump', 'moon', 'ath', 'breakout', 'adoption'];
        const bearishKeywords = ['crash', 'dump', 'bear', 'fall', 'drop', 'decline', 'selloff', 'vulnerability', 'hack'];
        
        if (bullishKeywords.some(keyword => title.includes(keyword))) {
          sentiment = 'bullish';
        } else if (bearishKeywords.some(keyword => title.includes(keyword))) {
          sentiment = 'bearish';
        }

        return {
          title: article.title,
          url: article.url,
          source: article.source?.title || 'CryptoPanic',
          publishedAt: article.created_at,
          sentiment,
          description: article.title // CryptoPanic doesn't provide descriptions, using title
        };
      });

      res.status(200).json(newsArticles);
    } catch (error) {
      console.error("Error fetching news data:", error);
      
      // Return fallback data on error
      const fallbackNews = [
        {
          title: "Market Update: Crypto Markets Show Mixed Signals",
          url: "https://example.com/market-update",
          source: "CryptoPanic",
          publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          sentiment: "neutral" as const,
          description: "Cryptocurrency markets are displaying mixed signals as investors await regulatory clarity."
        }
      ];
      
      res.status(200).json(fallbackNews);
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}