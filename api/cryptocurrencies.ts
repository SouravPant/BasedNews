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
      // Get parameters with validation
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const per_page = Math.min(Math.max(1, parseInt(req.query.per_page as string) || 20), 250);
      const includeStablecoins = req.query.includeStablecoins === 'true';
      const includeBaseCoins = req.query.includeBaseCoins === 'true';
      const idsParam = req.query.ids as string;
      const searchQuery = req.query.search as string; // Add search parameter support
      
      console.log('API called with params:', { page, per_page, includeStablecoins, includeBaseCoins, idsParam, searchQuery });
      
      // Base ecosystem coins for priority inclusion
      const baseEcosystemCoins = [
        // Core Base tokens
        'ethereum', 'coinbase-wrapped-staked-eth', 'usd-coin', 'dai', 'wrapped-bitcoin',
        // Base native projects
        'aerodrome-finance', 'degen', 'moonwell', 'compound-ether', 'compound-usd-coin',
        // DeFi on Base
        'uniswap', 'aave', 'curve-dao-token', 'balancer', 'chainlink',
        // Major tokens available on Base
        'tether', 'maker', 'sushiswap', 'yearn-finance', 'convex-finance',
        // Popular Base ecosystem
        'based-brett', 'higher', 'bald', 'toshi', 'friend-tech', 'zora',
        // Cross-chain tokens on Base  
        'render-token', 'artificial-superintelligence-alliance', 'filecoin'
      ];

      let allCoins = [];

      // If specific IDs are requested, fetch them first
      if (idsParam && idsParam.trim()) {
        const requestedIds = idsParam.split(',').map(id => id.trim()).filter(Boolean);
        console.log('Fetching specific coins:', requestedIds);
        
        if (requestedIds.length > 0) {
          try {
            const specificCoinsResponse = await axios.get(
              "https://api.coingecko.com/api/v3/coins/markets",
              {
                params: {
                  vs_currency: "usd",
                  ids: requestedIds.slice(0, 50).join(','), // Limit to 50 IDs per request
                  order: "market_cap_desc",
                  per_page: 250,
                  page: 1,
                  sparkline: false,
                  price_change_percentage: "24h"
                },
                timeout: 10000 // 10 second timeout
              }
            );
            allCoins = [...specificCoinsResponse.data];
            console.log('Fetched specific coins:', allCoins.length);
          } catch (error) {
            console.error('Error fetching specific coins:', error);
            // Continue with fallback logic
          }
        }
      }

      // If we need more coins or Base coins specifically
      if (allCoins.length < per_page || includeBaseCoins || searchQuery) {
        try {
          // For search queries, fetch more coins to search through
          const coinsToFetch = searchQuery ? Math.min(per_page * 10, 250) : Math.min(per_page, 100);
          
          const response = await axios.get(
            "https://api.coingecko.com/api/v3/coins/markets",
            {
              params: {
                vs_currency: "usd",
                order: "market_cap_desc",
                per_page: coinsToFetch,
                page: page,
                sparkline: false,
                price_change_percentage: "24h"
              },
              timeout: 10000 // 10 second timeout
            }
          );

          // Merge without duplicates
          const existingIds = new Set(allCoins.map(coin => coin.id));
          const additionalCoins = response.data.filter((coin: any) => !existingIds.has(coin.id));
          allCoins = [...allCoins, ...additionalCoins];
          console.log('Total coins after merge:', allCoins.length);
        } catch (error) {
          console.error('Error fetching top coins:', error);
          
          // If we have no coins at all, return a basic error response
          if (allCoins.length === 0) {
            return res.status(500).json({ 
              message: "Failed to fetch cryptocurrency data",
              error: error.message 
            });
          }
        }
      }

      // Filter out stablecoins if not explicitly included
      const excludedTokens = [
        'tether', 'usd-coin', 'wrapped-steth', 'staked-ether', 'binance-usd', 'dai',
        'true-usd', 'wrapped-bitcoin', 'first-digital-usd'
      ];

      let filteredCoins = allCoins;
      
      // Apply search filter if provided
      if (searchQuery && searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase().trim();
        filteredCoins = filteredCoins.filter((coin: any) => 
          coin.name.toLowerCase().includes(searchTerm) ||
          coin.symbol.toLowerCase().includes(searchTerm) ||
          coin.id.toLowerCase().includes(searchTerm)
        );
        
        // Sort search results to prioritize Base ecosystem coins and exact matches
        filteredCoins.sort((a: any, b: any) => {
          const aIsBase = baseEcosystemCoins.includes(a.id);
          const bIsBase = baseEcosystemCoins.includes(b.id);
          const aExactMatch = a.name.toLowerCase() === searchTerm || a.symbol.toLowerCase() === searchTerm;
          const bExactMatch = b.name.toLowerCase() === searchTerm || b.symbol.toLowerCase() === searchTerm;
          
          // Prioritize exact matches first
          if (aExactMatch && !bExactMatch) return -1;
          if (!aExactMatch && bExactMatch) return 1;
          
          // Then prioritize Base ecosystem coins
          if (aIsBase && !bIsBase) return -1;
          if (!aIsBase && bIsBase) return 1;
          
          // Finally sort by market cap rank
          return (a.market_cap_rank || 999999) - (b.market_cap_rank || 999999);
        });
        
        console.log(`Search "${searchTerm}" found ${filteredCoins.length} coins`);
        
        // Debug logging for DEGEN searches
        if (searchTerm.includes('degen')) {
          console.log('DEGEN search results:', filteredCoins.map((coin: any) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            isBase: baseEcosystemCoins.includes(coin.id)
          })));
        }
      }
      
      if (!includeStablecoins) {
        filteredCoins = filteredCoins.filter((coin: any) => !excludedTokens.includes(coin.id));
      }

      // Limit results
      if (per_page < 100) {
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

      console.log('Returning cryptocurrencies:', cryptocurrencies.length);
      res.status(200).json(cryptocurrencies);
    } catch (error) {
      console.error("Error in cryptocurrency API:", error);
      res.status(500).json({ 
        message: "Failed to fetch cryptocurrency data",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}