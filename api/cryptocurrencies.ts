import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Comprehensive list of 100+ cryptocurrencies including Base ecosystem tokens
const COMPREHENSIVE_CRYPTO_LIST = [
  // Base Ecosystem Tokens
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin' },
  { id: 'wrapped-bitcoin', symbol: 'WBTC', name: 'Wrapped Bitcoin' },
  { id: 'coinbase-wrapped-staked-eth', symbol: 'cbETH', name: 'Coinbase Wrapped Staked ETH' },
  { id: 'aerodrome-finance', symbol: 'AERO', name: 'Aerodrome Finance' },
  { id: 'seamless', symbol: 'SEAM', name: 'Seamless Protocol' },
  { id: 'moonwell', symbol: 'WELL', name: 'Moonwell' },
  { id: 'degen-base', symbol: 'DEGEN', name: 'Degen' },
  { id: 'based-brett', symbol: 'BRETT', name: 'Based Brett' },
  { id: 'higher', symbol: 'HIGHER', name: 'Higher' },
  { id: 'synth', symbol: 'SYNTH', name: 'Synth' },
  { id: 'prime', symbol: 'PRIME', name: 'Echelon Prime' },
  { id: 'virtuals-protocol', symbol: 'VIRTUAL', name: 'Virtuals Protocol' },
  { id: 'base-protocol', symbol: 'BASE', name: 'Base Protocol' },
  { id: 'frame', symbol: 'FRAME', name: 'Frame' },
  { id: 'friend-tech', symbol: 'FRIEND', name: 'Friend.tech' },
  { id: 'spectral', symbol: 'SPEC', name: 'Spectral' },
  { id: 'goldfinch', symbol: 'GFI', name: 'Goldfinch' },
  { id: 'compound', symbol: 'COMP', name: 'Compound' },
  { id: 'aave', symbol: 'AAVE', name: 'Aave' },
  
  // Top Market Cap Cryptocurrencies
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'polygon', symbol: 'MATIC', name: 'Polygon' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
  { id: 'near', symbol: 'NEAR', name: 'NEAR Protocol' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap' },
  { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos' },
  { id: 'filecoin', symbol: 'FIL', name: 'Filecoin' },
  { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum' },
  { id: 'optimism', symbol: 'OP', name: 'Optimism' },
  { id: 'sui', symbol: 'SUI', name: 'Sui' },
  
  // DeFi Tokens
  { id: 'pancakeswap-token', symbol: 'CAKE', name: 'PancakeSwap' },
  { id: 'sushiswap', symbol: 'SUSHI', name: 'SushiSwap' },
  { id: 'curve-dao-token', symbol: 'CRV', name: 'Curve DAO Token' },
  { id: 'maker', symbol: 'MKR', name: 'Maker' },
  { id: 'yearn-finance', symbol: 'YFI', name: 'yearn.finance' },
  { id: 'balancer', symbol: 'BAL', name: 'Balancer' },
  { id: 'synthetix-network-token', symbol: 'SNX', name: 'Synthetix' },
  { id: '0x', symbol: 'ZRX', name: '0x' },
  { id: 'kyber-network-crystal', symbol: 'KNC', name: 'Kyber Network Crystal' },
  { id: 'loopring', symbol: 'LRC', name: 'Loopring' },
  
  // Gaming & NFT
  { id: 'axie-infinity', symbol: 'AXS', name: 'Axie Infinity' },
  { id: 'the-sandbox', symbol: 'SAND', name: 'The Sandbox' },
  { id: 'decentraland', symbol: 'MANA', name: 'Decentraland' },
  { id: 'enjincoin', symbol: 'ENJ', name: 'Enjin Coin' },
  { id: 'gala', symbol: 'GALA', name: 'Gala' },
  { id: 'immutable-x', symbol: 'IMX', name: 'Immutable X' },
  { id: 'flow', symbol: 'FLOW', name: 'Flow' },
  { id: 'theta-token', symbol: 'THETA', name: 'Theta Network' },
  { id: 'chiliz', symbol: 'CHZ', name: 'Chiliz' },
  
  // Layer 1 & 2 Solutions
  { id: 'fantom', symbol: 'FTM', name: 'Fantom' },
  { id: 'harmony', symbol: 'ONE', name: 'Harmony' },
  { id: 'algorand', symbol: 'ALGO', name: 'Algorand' },
  { id: 'hedera-hashgraph', symbol: 'HBAR', name: 'Hedera' },
  { id: 'elrond-erd-2', symbol: 'EGLD', name: 'MultiversX' },
  { id: 'internet-computer', symbol: 'ICP', name: 'Internet Computer' },
  { id: 'tezos', symbol: 'XTZ', name: 'Tezos' },
  { id: 'stellar', symbol: 'XLM', name: 'Stellar' },
  { id: 'vechain', symbol: 'VET', name: 'VeChain' },
  { id: 'iota', symbol: 'MIOTA', name: 'IOTA' },
  
  // Meme Coins
  { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu' },
  { id: 'pepe', symbol: 'PEPE', name: 'Pepe' },
  { id: 'dogwifcoin', symbol: 'WIF', name: 'dogwifhat' },
  { id: 'floki', symbol: 'FLOKI', name: 'FLOKI' },
  { id: 'bonk', symbol: 'BONK', name: 'Bonk' },
  { id: 'baby-doge-coin', symbol: 'BABYDOGE', name: 'Baby Doge Coin' },
  
  // Infrastructure & Oracle
  { id: 'the-graph', symbol: 'GRT', name: 'The Graph' },
  { id: 'band-protocol', symbol: 'BAND', name: 'Band Protocol' },
  { id: 'helium', symbol: 'HNT', name: 'Helium' },
  { id: 'livepeer', symbol: 'LPT', name: 'Livepeer' },
  { id: 'arweave', symbol: 'AR', name: 'Arweave' },
  { id: 'storj', symbol: 'STORJ', name: 'Storj' },
  
  // Privacy Coins
  { id: 'monero', symbol: 'XMR', name: 'Monero' },
  { id: 'zcash', symbol: 'ZEC', name: 'Zcash' },
  { id: 'dash', symbol: 'DASH', name: 'Dash' },
  { id: 'horizen', symbol: 'ZEN', name: 'Horizen' },
  
  // Enterprise & Institutional
  { id: 'basic-attention-token', symbol: 'BAT', name: 'Basic Attention Token' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'quant-network', symbol: 'QNT', name: 'Quant' },
  { id: 'crypto-com-chain', symbol: 'CRO', name: 'Cronos' },
  
  // AI & Data
  { id: 'fetch-ai', symbol: 'FET', name: 'Fetch.ai' },
  { id: 'singularitynet', symbol: 'AGIX', name: 'SingularityNET' },
  { id: 'ocean-protocol', symbol: 'OCEAN', name: 'Ocean Protocol' },
  { id: 'numeraire', symbol: 'NMR', name: 'Numeraire' },
  
  // Additional Top Coins
  { id: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash' },
  { id: 'ethereum-classic', symbol: 'ETC', name: 'Ethereum Classic' },
  { id: 'leo-token', symbol: 'LEO', name: 'UNUS SED LEO' },
  { id: 'okb', symbol: 'OKB', name: 'OKB' },
  { id: 'bitcoin-sv', symbol: 'BSV', name: 'Bitcoin SV' },
  { id: 'aptos', symbol: 'APT', name: 'Aptos' },
  { id: 'render-token', symbol: 'RNDR', name: 'Render Token' },
  { id: 'kaspa', symbol: 'KAS', name: 'Kaspa' },
  { id: 'celestia', symbol: 'TIA', name: 'Celestia' },
  { id: 'starknet', symbol: 'STRK', name: 'Starknet' }
];

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
      const search = req.query.search as string;
      const page = parseInt(req.query.page as string) || 1;
      const per_page = parseInt(req.query.per_page as string) || 20;
      const includeStablecoins = req.query.includeStablecoins === 'true';

      // Handle search functionality
      if (search && search.length >= 1) {
        const searchLower = search.toLowerCase();
        const matchedCoins = COMPREHENSIVE_CRYPTO_LIST.filter(coin => 
          coin.name.toLowerCase().includes(searchLower) ||
          coin.symbol.toLowerCase().includes(searchLower) ||
          coin.id.toLowerCase().includes(searchLower)
        );

        // Get live data for matched coins
        if (matchedCoins.length > 0) {
          const coinIds = matchedCoins.slice(0, 10).map(coin => coin.id).join(',');
          
          try {
            const response = await axios.get(
              "https://api.coingecko.com/api/v3/coins/markets",
              {
                params: {
                  vs_currency: "usd",
                  ids: coinIds,
                  order: "market_cap_desc",
                  per_page: 10,
                  page: 1,
                  sparkline: false,
                  price_change_percentage: "24h"
                },
                timeout: 5000
              }
            );

            const searchResults = response.data.map((coin: any) => ({
              id: coin.id,
              name: coin.name,
              symbol: coin.symbol.toUpperCase(),
              currentPrice: coin.current_price?.toFixed(coin.current_price < 1 ? 6 : 2) || "0",
              priceChange24h: coin.price_change_24h?.toString() || "0",
              priceChangePercentage24h: coin.price_change_percentage_24h?.toFixed(2) || "0",
              marketCap: coin.market_cap?.toString() || "0",
              volume24h: coin.total_volume?.toString() || "0",
              marketCapRank: coin.market_cap_rank || 0,
              image: coin.image || "",
              lastUpdated: new Date().toISOString()
            }));

            return res.status(200).json(searchResults);
          } catch (apiError) {
            console.error('CoinGecko API error:', apiError);
            // Return basic info for matched coins without live data
            const fallbackResults = matchedCoins.slice(0, 10).map(coin => ({
              id: coin.id,
              name: coin.name,
              symbol: coin.symbol,
              currentPrice: "0.00",
              priceChange24h: "0",
              priceChangePercentage24h: "0",
              marketCap: "0",
              volume24h: "0",
              marketCapRank: 0,
              image: `https://assets.coingecko.com/coins/images/1/large/${coin.id}.png`,
              lastUpdated: new Date().toISOString()
            }));
            return res.status(200).json(fallbackResults);
          }
        } else {
          return res.status(200).json([]);
        }
      }

      // Default behavior: get top cryptocurrencies
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: Math.min(per_page, 250),
            page: page,
            sparkline: false,
            price_change_percentage: "24h"
          }
        }
      );

      // Filter out stablecoins and wrapped tokens only if not explicitly included
      const excludedTokens = [
        'tether', 'usd-coin', 'wrapped-steth', 'staked-ether', 'binance-usd', 'dai',
        'true-usd', 'wrapped-bitcoin', 'first-digital-usd'
      ];

      let filteredCoins = response.data;
      
      if (!includeStablecoins) {
        filteredCoins = filteredCoins.filter((coin: any) => !excludedTokens.includes(coin.id));
      }

      // For the original endpoint (per_page=20), limit to 20. For the new endpoint, return all filtered coins.
      if (per_page === 20 && page === 1) {
        filteredCoins = filteredCoins.slice(0, 20);
      }

      const cryptocurrencies = filteredCoins.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        currentPrice: coin.current_price?.toFixed(coin.current_price < 1 ? 6 : 2) || "0",
        priceChange24h: coin.price_change_24h?.toString() || "0",
        priceChangePercentage24h: coin.price_change_percentage_24h?.toFixed(2) || "0",
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