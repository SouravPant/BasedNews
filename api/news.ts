import { VercelRequest, VercelResponse } from '@vercel/node';

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

      res.status(200).json(fallbackNews);
    } catch (error) {
      console.error("Error fetching news data:", error);
      res.status(500).json({ message: "Failed to fetch news data" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}