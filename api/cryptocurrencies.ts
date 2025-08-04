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
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: 20,
            page: 1,
            sparkline: false,
            price_change_percentage: "24h"
          }
        }
      );

      // Filter out stablecoins and wrapped tokens
      const excludedTokens = [
        'tether', 'usd-coin', 'wrapped-steth', 'staked-ether', 'binance-usd', 'dai',
        'true-usd', 'wrapped-bitcoin', 'first-digital-usd'
      ];

      const filteredCoins = response.data
        .filter((coin: any) => !excludedTokens.includes(coin.id))
        .slice(0, 20);

      const cryptocurrencies = filteredCoins.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        currentPrice: coin.current_price?.toString() || "0",
        priceChange24h: coin.price_change_24h?.toString() || "0",
        priceChangePercentage24h: coin.price_change_percentage_24h?.toString() || "0",
        marketCap: coin.market_cap?.toString() || "0",
        volume24h: coin.total_volume?.toString() || "0",
        marketCapRank: coin.market_cap_rank || 0,
        image: coin.image || "",
        lastUpdated: new Date().toISOString()
      }));

      res.status(200).json(cryptocurrencies);
    } catch (error) {
      console.error("Error fetching cryptocurrency data:", error);
      res.status(500).json({ message: "Failed to fetch cryptocurrency data" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}