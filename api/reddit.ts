import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { insertRedditPostSchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const subreddit = req.query.subreddit as string || "cryptocurrency";
    
    const mockRedditPosts = [
      {
        id: "reddit_1",
        title: "Just bought my first Bitcoin! Any tips for a newbie?",
        author: "CryptoNewbie2024",
        subreddit: "cryptocurrency",
        url: "https://reddit.com/r/cryptocurrency/post1",
        upvotes: 245,
        comments: 89,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: "reddit_2",
        title: "Market Analysis: Why I think we're entering a bull run",
        author: "TradingExpert",
        subreddit: "cryptocurrency",
        url: "https://reddit.com/r/cryptocurrency/post2",
        upvotes: 1520,
        comments: 234,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      },
      {
        id: "reddit_3",
        title: "DeFi yield farming strategies that actually work",
        author: "DeFiMaster",
        subreddit: "cryptocurrency",
        url: "https://reddit.com/r/cryptocurrency/post3",
        upvotes: 892,
        comments: 67,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
      }
    ];

    for (const post of mockRedditPosts) {
      const validatedPost = insertRedditPostSchema.parse(post);
      await storage.createRedditPost(validatedPost);
    }

    const redditPosts = await storage.getRedditPosts(subreddit, 10);
    return res.json(redditPosts);
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return res.status(500).json({ message: "Failed to fetch Reddit data" });
  }
}