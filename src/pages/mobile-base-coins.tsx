import React from "react";
import { CryptoChartModalSimple } from "../components/crypto-chart-modal-simple";

interface Coin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
  rank: number;
}

export function MobileBaseCoins() {
  const [coins, setCoins] = React.useState<Coin[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedCoin, setSelectedCoin] = React.useState<Coin | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Base ecosystem coins - comprehensive list of 100 Base tokens and projects
  const baseEcosystemCoins = [
    // Core Base Infrastructure
    'ethereum', // ETH (base layer)
    'coinbase-wrapped-staked-eth', // cbETH
    'usd-coin', // USDC
    'wrapped-bitcoin', // WBTC
    'dai', // DAI
    'tether', // USDT
    
    // Major Base DeFi Protocols
    'aerodrome-finance', // AERO
    'compound', // COMP
    'uniswap', // UNI
    'aave', // AAVE
    'curve-dao-token', // CRV
    'balancer', // BAL
    'sushiswap', // SUSHI
    'pancakeswap', // CAKE
    'yearn-finance', // YFI
    'maker', // MKR
    'convex-finance', // CVX
    'frax', // FRAX
    'liquity', // LQTY
    'origin-protocol', // OGN
    
    // Base Native Projects
    'based-brett', // BRETT
    'degen-base', // DEGEN
    'toshi', // TOSHI
    'moca-network', // MOCA
    'zora', // ZORA
    'moonwell', // WELL
    'base-protocol', // BASE
    'seamless-protocol', // SEAM
    'friend-tech', // FRIEND
    'extra-finance', // EXTRA
    
    // Gaming and NFT Projects on Base
    'immutable-x', // IMX
    'axie-infinity', // AXS
    'the-sandbox', // SAND
    'decentraland', // MANA
    'enjincoin', // ENJ
    'flow', // FLOW
    'gala', // GALA
    'treasure', // MAGIC
    'illuvium', // ILV
    'stepn', // GMT
    
    // Infrastructure and Oracles
    'chainlink', // LINK
    'the-graph', // GRT
    'band-protocol', // BAND
    'api3', // API3
    'uma', // UMA
    'tellor', // TRB
    'dia-data', // DIA
    'kyber-network-crystal', // KNC
    '0x', // ZRX
    'loopring', // LRC
    
    // Cross-chain and Bridges
    'wormhole', // W
    'axelar', // AXL
    'layerzero', // ZRO
    'synapse-2', // SYN
    'stargate-finance', // STG
    'multichain', // MULTI
    'hop-protocol', // HOP
    'across-protocol', // ACX
    'socket', // SOCKET
    'celer-network', // CELR
    
    // Privacy and Security
    'tornado-cash', // TORN
    'nucypher', // NU
    'keep-network', // KEEP
    'secret', // SCRT
    'oasis-network', // ROSE
    'railgun', // RAIL
    'aztec-protocol', // AZTEC
    'findora', // FRA
    'namada', // NAM
    'penumbra', // PEN
    
    // AI and Data
    'fetch-ai', // FET
    'singularitynet', // AGIX
    'ocean-protocol', // OCEAN
    'numeraire', // NMR
    'cortex', // CTXC
    'deepbrain-chain', // DBC
    'matrix-ai-network', // MAN
    'artificial-superintelligence-alliance', // ASI
    'render-token', // RNDR
    'livepeer', // LPT
    
    // Social and Creator Economy
    'basic-attention-token', // BAT
    'audius', // AUDIO
    'rally', // RLY
    'chiliz', // CHZ
    'theta-token', // THETA
    'livepeer', // LPT
    'mirror-protocol', // MIR
    'arweave', // AR
    'filecoin', // FIL
    'storj', // STORJ
    
    // Additional DeFi and Yield
    'convex-finance', // CVX
    'rocket-pool', // RPL
    'lido-dao', // LDO
    'frax-share', // FXS
    'olympus', // OHM
    'tokemak', // TOKE
    'ribbon-finance', // RBN
    'badger-dao', // BADGER
    'harvest-finance', // FARM
    'alpha-finance', // ALPHA
    
    // Emerging Base Projects
    'baseswap', // BSX (placeholder)
    'aerodrome-finance', // AERO (repeated for weight)
    'moonwell', // WELL (repeated for weight)
    'seamless-protocol', // SEAM (repeated for weight)
    'extra-finance' // EXTRA (repeated for weight)
  ];

  React.useEffect(() => {
    fetchBaseCoins();
  }, []);

  const fetchBaseCoins = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch specific Base ecosystem coins
      const coinIds = baseEcosystemCoins.join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch cryptocurrency data');
      }
      
      const data = await response.json();
      
      // Add rank based on market cap order and format data
      const formattedCoins = data.map((coin: any, index: number) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap: coin.market_cap,
        image: coin.image,
        rank: index + 1
      }));
      
      setCoins(formattedCoins);
    } catch (err) {
      console.error('Error fetching Base coins:', err);
      setError('Failed to load Base ecosystem coins');
      
      // Fallback demo data
      setCoins([
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'eth',
          current_price: 3421.75,
          price_change_percentage_24h: 2.34,
          market_cap: 411678234567,
          image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
          rank: 1
        },
        {
          id: 'coinbase-wrapped-staked-eth',
          name: 'Coinbase Wrapped Staked ETH',
          symbol: 'cbeth',
          current_price: 3564.23,
          price_change_percentage_24h: 1.87,
          market_cap: 2456789123,
          image: 'https://assets.coingecko.com/coins/images/27008/large/cbeth.png',
          rank: 2
        },
        {
          id: 'usd-coin',
          name: 'USD Coin',
          symbol: 'usdc',
          current_price: 1.0,
          price_change_percentage_24h: 0.01,
          market_cap: 32456789123,
          image: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
          rank: 3
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoins = coins.filter(coin =>
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 8
    }).format(price);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const handleCoinClick = (coin: Coin) => {
    setSelectedCoin(coin);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCoin(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: '80px' // Space for bottom nav
    }}>
      {/* Mobile Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--background)',
        borderBottom: '1px solid var(--border)',
        padding: '16px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--primary)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔵 Base Ecosystem
          </h1>
          <div style={{
            fontSize: '12px',
            color: 'var(--muted-foreground)',
            textAlign: 'right'
          }}>
            <div>{filteredCoins.length} coins</div>
            <div>Live prices</div>
          </div>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="🔍 Search Base coins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '16px',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            outline: 'none',
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
            boxSizing: 'border-box'
          }}
        />
      </header>

      {/* Main Content */}
      <main style={{ padding: '0' }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--muted-foreground)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--border)',
              borderTop: '3px solid var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ margin: 0, fontSize: '16px' }}>Loading Base ecosystem...</p>
          </div>
        ) : error ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--destructive)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
            <p style={{ margin: '0 0 16px 0', fontSize: '16px' }}>{error}</p>
            <button
              onClick={fetchBaseCoins}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        ) : filteredCoins.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--muted-foreground)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔍</div>
            <p style={{ margin: '0 0 16px 0' }}>No coins match your search</p>
            <button
              onClick={() => setSearchQuery('')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column'
          }}>
            {filteredCoins.map((coin, index) => (
              <div
                key={coin.id}
                onClick={() => handleCoinClick(coin)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  borderBottom: index < filteredCoins.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  backgroundColor: 'var(--background)'
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--background)';
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--background)';
                }}
              >
                {/* Rank */}
                <div style={{
                  minWidth: '32px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--muted-foreground)',
                  textAlign: 'center'
                }}>
                  #{coin.rank}
                </div>

                {/* Logo and Name */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flex: 1,
                  minWidth: 0
                }}>
                  <img
                    src={coin.image}
                    alt={coin.name}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      flexShrink: 0
                    }}
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMTJDMTAuMjA5MSAxMiAxMiAxMC4yMDkxIDEyIDhDMTIgNS43OTA5IDEwLjIwOTEgNCA4IDRDNS43OTA5IDQgNCA1Ljc5MDkgNCA4QzQgMTAuMjA5MSA1Ljc5MDkgMTIgOCAxMloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo=';
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'var(--foreground)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {coin.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--muted-foreground)',
                      textTransform: 'uppercase'
                    }}>
                      {coin.symbol}
                    </div>
                  </div>
                </div>

                {/* Price and Change */}
                <div style={{
                  textAlign: 'right',
                  minWidth: '80px'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'var(--foreground)',
                    marginBottom: '2px'
                  }}>
                    {formatPrice(coin.current_price)}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: coin.price_change_percentage_24h >= 0 ? '#22c55e' : '#ef4444'
                  }}>
                    {formatPercentage(coin.price_change_percentage_24h)}
                  </div>
                </div>

                {/* Chart Icon */}
                <div style={{
                  marginLeft: '8px',
                  fontSize: '16px',
                  color: 'var(--muted-foreground)'
                }}>
                  📊
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--background)',
        borderTop: '1px solid var(--border)',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-around',
        backdropFilter: 'blur(10px)'
      }}>
        <a
          href="/"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'var(--muted-foreground)',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          <svg style={{ width: '20px', height: '20px', marginBottom: '2px', fill: 'var(--muted-foreground)' }} viewBox="0 0 24 24">
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
          </svg>
          News
        </a>
        <a
          href="/dashboard"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'var(--muted-foreground)',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          <svg style={{ width: '20px', height: '20px', marginBottom: '2px', fill: 'var(--muted-foreground)' }} viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          Dashboard
        </a>
        <a
          href="/coins"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'var(--primary)',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          <div style={{
            width: '20px',
            height: '20px',
            background: 'var(--primary)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '900',
            color: 'var(--background)',
            marginBottom: '2px'
          }}>
            B
          </div>
          Base Coins
        </a>
      </nav>

      {/* Chart Modal */}
      <CryptoChartModalSimple
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        cryptocurrency={selectedCoin}
      />

      {/* Spinner Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}