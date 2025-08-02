import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // Fallback Reddit data
      const fallbackReddit = [
        {
          id: "reddit_1",
          title: "Just bought my first Bitcoin! Any tips for a beginner?",
          url: "https://reddit.com/r/cryptocurrency/example1",
          author: "CryptoNewbie2024",
          score: 156,
          numComments: 23,
          subreddit: "r/cryptocurrency",
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          selfText: "Finally took the plunge and bought 0.1 BTC. What should I know about storing and managing it safely?"
        },
        {
          id: "reddit_2",
          title: "ETH gas fees are actually reasonable today!",
          url: "https://reddit.com/r/ethereum/example2", 
          author: "GasWatcher",
          score: 89,
          numComments: 15,
          subreddit: "r/ethereum",
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          selfText: "Seeing gas fees under 20 gwei for the first time in weeks. Great time to move some tokens around!"
        }
      ];

      res.status(200).json(fallbackReddit);
    } catch (error) {
      console.error("Error fetching Reddit data:", error);
      res.status(500).json({ message: "Failed to fetch Reddit data" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}