import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    const excludedTokens = [
      'tether', 'usd-coin', 'wrapped-steth', 'binance-usd', 
      'dai', 'true-usd', 'wrapped-bitcoin', 'first-digital-usd'
    ];

    const filteredCoins = response.data
      .filter((coin: any) => !excludedTokens.includes(coin.id))
      .slice(0, 10);

    const cryptos = filteredCoins.map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      currentPrice: coin.current_price?.toString(),
      priceChange24h: coin.price_change_24h?.toString(),
      priceChangePercentage24h: coin.price_change_percentage_24h?.toString(),
      marketCap: coin.market_cap?.toString(),
      volume24h: coin.total_volume?.toString(),
      marketCapRank: coin.market_cap_rank,
      image: coin.image
    }));

    for (const crypto of cryptos) {
      await storage.upsertCryptocurrency(crypto);
    }

    const storedCryptos = await storage.getCryptocurrencies();
    return res.json(storedCryptos);
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error);
    const cachedCryptos = await storage.getCryptocurrencies();
    if (cachedCryptos.length > 0) {
      return res.json(cachedCryptos);
    } else {
      return res.status(500).json({ message: "Failed to fetch cryptocurrency data" });
    }
  }
}