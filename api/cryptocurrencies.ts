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
      // Get page and per_page from query params
      const page = parseInt(req.query.page as string) || 1;
      const per_page = parseInt(req.query.per_page as string) || 20;
      const includeStablecoins = req.query.includeStablecoins === 'true';
      const includeBaseCoins = req.query.includeBaseCoins === 'true';
      const idsParam = req.query.ids as string; // Comma-separated list of coin IDs
      
      // Base ecosystem coins for priority inclusion
      const baseEcosystemCoins = [
        'ethereum', 'coinbase-wrapped-staked-eth', 'usd-coin', 'aerodrome-finance', 
        'based-brett', 'degen-base', 'toshi', 'moca-network', 'zora', 'moonwell',
        'base-protocol', 'seamless-protocol', 'friend-tech', 'extra-finance'
      ];

      let allCoins = [];

      // If specific IDs are requested, fetch them first
      if (idsParam) {
        const requestedIds = idsParam.split(',').map(id => id.trim()).filter(Boolean);
        if (requestedIds.length > 0) {
          try {
            const specificCoinsResponse = await axios.get(
              "https://api.coingecko.com/api/v3/coins/markets",
              {
                params: {
                  vs_currency: "usd",
                  ids: requestedIds.join(','),
                  order: "market_cap_desc",
                  per_page: 250,
                  page: 1,
                  sparkline: false,
                  price_change_percentage: "24h"
                }
              }
            );
            allCoins = [...specificCoinsResponse.data];
          } catch (error) {
            console.log('Error fetching specific coins, falling back to top coins...');
          }
        }
      }

      // If requesting Base coins specifically, fetch them and merge
      if (includeBaseCoins && baseEcosystemCoins.length > 0) {
        try {
          const baseCoinsResponse = await axios.get(
            "https://api.coingecko.com/api/v3/coins/markets",
            {
              params: {
                vs_currency: "usd",
                ids: baseEcosystemCoins.join(','),
                order: "market_cap_desc",
                per_page: 250,
                page: 1,
                sparkline: false,
                price_change_percentage: "24h"
              }
            }
          );
          // Merge without duplicates
          const existingIds = new Set(allCoins.map(coin => coin.id));
          const newBaseCoins = baseCoinsResponse.data.filter((coin: any) => !existingIds.has(coin.id));
          allCoins = [...allCoins, ...newBaseCoins];
        } catch (error) {
          console.log('Error fetching Base coins, continuing...');
        }
      }

      // If we don't have enough coins yet, fetch top market cap coins
      if (allCoins.length < per_page && !idsParam) {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "usd",
              order: "market_cap_desc",
              per_page: Math.min(per_page === 20 ? 20 : 200, 250), // Support up to 200 coins for selection
              page: page,
              sparkline: false,
              price_change_percentage: "24h"
            }
          }
        );
        // Merge without duplicates
        const existingIds = new Set(allCoins.map(coin => coin.id));
        const additionalCoins = response.data.filter((coin: any) => !existingIds.has(coin.id));
        allCoins = [...allCoins, ...additionalCoins];
      }

      // Filter out stablecoins if not explicitly included
      const excludedTokens = [
        'tether', 'usd-coin', 'wrapped-steth', 'staked-ether', 'binance-usd', 'dai',
        'true-usd', 'wrapped-bitcoin', 'first-digital-usd'
      ];

      let filteredCoins = allCoins;
      
      if (!includeStablecoins) {
        filteredCoins = filteredCoins.filter((coin: any) => !excludedTokens.includes(coin.id));
      }

      // For backward compatibility with dashboard, limit to specified amount
      if (per_page <= 50) {
        filteredCoins = filteredCoins.slice(0, per_page);
      }

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
        lastUpdated: new Date().toISOString(),
        isBaseEcosystem: baseEcosystemCoins.includes(coin.id)
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