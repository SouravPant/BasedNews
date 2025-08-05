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
      const { id } = req.query;
      const { days = "7" } = req.query; // Default to 7 days
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: "Invalid cryptocurrency ID" });
      }

      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
        {
          params: {
            vs_currency: "usd",
            days: days,
            interval: days === "1" ? "hourly" : "daily"
          }
        }
      );

      // Format the data for the chart
      const chartData = response.data.prices.map(([timestamp, price]: [number, number]) => ({
        time: new Date(timestamp).toISOString(),
        price: price
      }));

      res.json({
        coinId: id,
        days: parseInt(days as string),
        data: chartData
      });
    } catch (error: any) {
      console.error(`Error fetching chart data for ${req.query.id}:`, error);
      
      if (error.response?.status === 429) {
        return res.status(429).json({ 
          message: "Rate limit exceeded. Please try again later.",
          coinId: req.query.id,
          days: parseInt((req.query.days as string) || "7"),
          data: []
        });
      }
      
      res.status(500).json({ 
        message: "Failed to fetch chart data",
        coinId: req.query.id,
        days: parseInt((req.query.days as string) || "7"),
        data: []
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}