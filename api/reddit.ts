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
      const clientId = process.env.REDDIT_CLIENT_ID;
      const clientSecret = process.env.REDDIT_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        console.log('Reddit API credentials not found - using fallback data');
        const fallbackReddit = [
          {
            id: "reddit_fallback_1",
            title: "Discussion: Best crypto exchanges for beginners?",
            url: "https://reddit.com/r/cryptocurrency/fallback1",
            author: "CryptoHelper",
            score: 234,
            numComments: 45,
            subreddit: "r/cryptocurrency",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            selfText: "Looking for recommendations on beginner-friendly exchanges with good security."
          },
          {
            id: "reddit_fallback_2",
            title: "Market Analysis: Why DeFi is gaining momentum",
            url: "https://reddit.com/r/defi/fallback2",
            author: "DeFiAnalyst",
            score: 187,
            numComments: 32,
            subreddit: "r/defi", 
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            selfText: "Recent trends show increased adoption of DeFi protocols across multiple chains."
          }
        ];
        return res.status(200).json(fallbackReddit);
      }

      // Get Reddit access token
      const tokenResponse = await axios.post('https://www.reddit.com/api/v1/access_token', 
        'grant_type=client_credentials', {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'BasedHub/1.0'
        }
      });

      const accessToken = tokenResponse.data.access_token;

      // Fetch posts from multiple crypto subreddits
      const subreddits = ['cryptocurrency', 'bitcoin', 'ethereum', 'defi', 'cryptomarkets'];
      const allPosts: any[] = [];

      for (const subreddit of subreddits) {
        try {
          const response = await axios.get(`https://oauth.reddit.com/r/${subreddit}/hot`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'User-Agent': 'BasedHub/1.0'
            },
            params: {
              limit: 5
            }
          });

          const posts = response.data.data.children
            .filter((post: any) => !post.data.stickied && !post.data.over_18)
            .slice(0, 3)
            .map((post: any) => ({
              id: post.data.id,
              title: post.data.title,
              url: `https://reddit.com${post.data.permalink}`,
              author: post.data.author,
              score: post.data.score,
              numComments: post.data.num_comments,
              subreddit: `r/${subreddit}`,
              createdAt: new Date(post.data.created_utc * 1000).toISOString(),
              selfText: post.data.selftext ? post.data.selftext.substring(0, 200) + '...' : ''
            }));

          allPosts.push(...posts);
        } catch (error) {
          console.error(`Error fetching from r/${subreddit}:`, error);
        }
      }

      // Sort by score and take top 10
      const topPosts = allPosts
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 10);

      res.status(200).json(topPosts);
    } catch (error) {
      console.error("Error fetching Reddit data:", error);
      
      // Return fallback data on error
      const fallbackReddit = [
        {
          id: "reddit_error_1",
          title: "Weekly Discussion: Market outlook for this week",
          url: "https://reddit.com/r/cryptocurrency/error1",
          author: "CryptoWeekly",
          score: 156,
          numComments: 67,
          subreddit: "r/cryptocurrency",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          selfText: "What are your predictions for the crypto market this week?"
        }
      ];
      
      res.status(200).json(fallbackReddit);
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}