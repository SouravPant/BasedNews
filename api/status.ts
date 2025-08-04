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
      const status = {
        coingecko: "connected",
        cryptopanic: "no_api_key",
        reddit: "fallback_data",
        lastUpdate: new Date().toISOString()
      };
      res.status(200).json(status);
    } catch (error) {
      console.error("Error getting API status:", error);
      res.status(500).json({ message: "Failed to get API status" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}