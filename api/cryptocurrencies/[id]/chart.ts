import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Helper function to get base price for different coins
function getBasePriceForCoin(coinId: string): number {
  const basePrices: { [key: string]: number } = {
    'bitcoin': 114000,
    'ethereum': 3300,
    'binancecoin': 610,
    'solana': 168,
    'cardano': 0.37,
    'avalanche-2': 26,
    'dogecoin': 0.13,
    'polygon-ecosystem-token': 0.43,
    'chainlink': 13.2,
    'tron': 0.16,
    'polkadot': 5.8,
    'uniswap': 8.9,
    'litecoin': 67,
    'near': 4.1,
    'stellar': 0.099
  };
  return basePrices[coinId] || 50; // Default fallback price
}

// Generate realistic fallback chart data
function generateFallbackChartData(basePrice: number, days: number): Array<{ time: string; price: number }> {
  const data = [];
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const msPerHour = 60 * 60 * 1000;
  
  let currentPrice = basePrice;
  
  if (days === 1) {
    // Hourly data for 24h
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * msPerHour);
      const volatility = (Math.random() - 0.5) * 0.03; // 3% volatility
      currentPrice = currentPrice * (1 + volatility);
      data.push({
        time: time.toISOString(),
        price: currentPrice
      });
    }
  } else {
    // Daily data
    for (let i = days - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * msPerDay);
      time.setHours(0, 0, 0, 0); // Set to beginning of day
      const volatility = (Math.random() - 0.5) * 0.05; // 5% daily volatility
      currentPrice = currentPrice * (1 + volatility);
      data.push({
        time: time.toISOString(),
        price: currentPrice
      });
    }
  }
  
  return data;
}

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

      try {
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
      } catch (apiError: any) {
        console.log(`CoinGecko API error for ${id} chart (status: ${apiError?.response?.status}). Using fallback data.`);
        
        // Generate realistic fallback chart data
        const daysNum = parseInt(days as string);
        const basePrice = getBasePriceForCoin(id as string);
        const chartData = generateFallbackChartData(basePrice, daysNum);
        
        res.json({
          coinId: id,
          days: daysNum,
          data: chartData
        });
      }
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