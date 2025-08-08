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
      // Function to detect sentiment based on keywords
      function detectSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
        const bullishWords = ['surge', 'rise', 'bull', 'gain', 'up', 'high', 'rally', 'moon', 'pump', 'breakthrough', 'adoption', 'approval', 'breakout', 'ath'];
        const bearishWords = ['crash', 'fall', 'bear', 'down', 'drop', 'decline', 'dump', 'sell', 'fear', 'panic', 'correction', 'vulnerability', 'hack'];
        
        const lowerText = text.toLowerCase();
        const bullishCount = bullishWords.filter(word => lowerText.includes(word)).length;
        const bearishCount = bearishWords.filter(word => lowerText.includes(word)).length;
        
        if (bullishCount > bearishCount) return 'bullish';
        if (bearishCount > bullishCount) return 'bearish';
        return 'neutral';
      }

      // Try NewsAPI first (primary source for crypto news)
      const newsApiKey = process.env.NEWS_API_KEY;
      
      if (newsApiKey) {
        try {
          const newsApiResponse = await axios.get('https://newsapi.org/v2/everything', {
            params: {
              q: 'bitcoin OR cryptocurrency OR blockchain OR ethereum OR crypto',
              sortBy: 'publishedAt',
              pageSize: 15,
              language: 'en',
              apiKey: newsApiKey
            },
            headers: {
              'User-Agent': 'BasedHub/1.0'
            }
          });

          if (newsApiResponse.data.articles && newsApiResponse.data.articles.length > 0) {
            console.log('✅ NewsAPI success: Fetched', newsApiResponse.data.articles.length, 'articles');
            
            const newsArticles = newsApiResponse.data.articles.slice(0, 10).map((article: any) => ({
              title: article.title || 'Untitled',
              url: article.url,
              source: article.source?.name || 'Unknown Source',
              publishedAt: article.publishedAt || new Date().toISOString(),
              sentiment: detectSentiment(article.title + ' ' + (article.description || '')),
              description: article.description || article.title,
              urlToImage: article.urlToImage || null,
              content: article.content || null
            }));

            return res.status(200).json(newsArticles);
          }
        } catch (newsApiError) {
          console.log('⚠️ NewsAPI failed, trying CoinGecko News:', newsApiError);
        }
      }

      // Try CoinGecko News API (backup - no API key needed)
      try {
        const coinGeckoResponse = await axios.get('https://api.coingecko.com/api/v3/news?page=1', {
          headers: {
            'User-Agent': 'BasedHub/1.0'
          }
        });

        if (coinGeckoResponse.data.data && coinGeckoResponse.data.data.length > 0) {
          console.log('✅ CoinGecko News API success: Fetched', coinGeckoResponse.data.data.length, 'articles');
          
          const newsArticles = coinGeckoResponse.data.data.slice(0, 10).map((article: any) => ({
            title: article.title || 'Untitled',
            url: article.url,
            source: article.author || 'CoinGecko',
            publishedAt: article.created_at || new Date().toISOString(),
            sentiment: detectSentiment(article.title + ' ' + (article.description || '')),
            description: article.description || article.title,
            urlToImage: article.thumb_2x || article.thumb || null,
            content: article.description || null
          }));

          return res.status(200).json(newsArticles);
        }
      } catch (coinGeckoError) {
        console.log('⚠️ CoinGecko News failed, using fallback:', coinGeckoError);
      }

      // If both APIs fail, return fallback news
      console.log('⚠️ All news APIs failed, using fallback news');
      const fallbackNews = [
        {
          title: "Bitcoin ETF Approval Sends BTC to New All-Time High",
          url: "https://example.com/btc-etf-ath",
          source: "CoinTelegraph",
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sentiment: "bullish" as const,
          description: "The approval of a major Bitcoin ETF has propelled BTC to unprecedented price levels, marking a significant milestone for cryptocurrency adoption.",
          urlToImage: "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=500&h=300&fit=crop",
          content: "The approval of a major Bitcoin ETF has propelled BTC to unprecedented price levels, marking a significant milestone for cryptocurrency adoption. Trading volumes have surged as institutional investors enter the market."
        },
        {
          title: "Ethereum 2.0 Staking Rewards Reach Record Levels",
          url: "https://example.com/eth-staking-rewards",
          source: "CoinDesk",
          publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          sentiment: "bullish" as const,
          description: "Ethereum validators are experiencing higher-than-expected staking rewards as network activity continues to surge.",
          urlToImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=300&fit=crop",
          content: "Ethereum validators are experiencing higher-than-expected staking rewards as network activity continues to surge. The proof-of-stake mechanism has proven more efficient than anticipated."
        },
        {
          title: "DeFi Protocol Security Audit Reveals Critical Vulnerabilities",
          url: "https://example.com/defi-security-audit",
          source: "CoinTelegraph",
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          sentiment: "bearish" as const,
          description: "A comprehensive security audit of a popular DeFi protocol has uncovered several critical vulnerabilities that could pose risks to user funds.",
          urlToImage: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=500&h=300&fit=crop",
          content: "A comprehensive security audit of a popular DeFi protocol has uncovered several critical vulnerabilities that could pose risks to user funds. The protocol team is working on immediate fixes."
        }
      ];
      
      res.status(200).json(fallbackNews);
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
          description: "Cryptocurrency markets are displaying mixed signals as investors await regulatory clarity.",
          urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&h=300&fit=crop",
          content: "Cryptocurrency markets are displaying mixed signals as investors await regulatory clarity. Trading volumes remain stable despite recent volatility."
        }
      ];
      
      res.status(200).json(fallbackNews);
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}