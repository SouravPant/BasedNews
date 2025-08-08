import React from "react";
import { CryptoChartModalSimple } from "../components/crypto-chart-modal-simple";

export function EnhancedCoins() {
  const [coins, setCoins] = React.useState([]);
  const [filteredCoins, setFilteredCoins] = React.useState([]);
  const [status, setStatus] = React.useState('Loading cryptocurrencies...');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCoin, setSelectedCoin] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [showBaseOnly, setShowBaseOnly] = React.useState(false);

  // Base ecosystem coin IDs
  const baseEcosystemIds = new Set([
    'aerodrome-finance', 'based-brett', 'degen-base', 'coinbase-wrapped-staked-eth',
    'toshi', 'moca-network', 'zora', 'kaito', 'morpho', 'virtual-protocol',
    'curve-dao-token', 'pancakeswap', 'maple-finance', 'balancer', 'sushiswap',
    'reserve-rights', 'wormhole', 'axelar', 'layerzero', 'iotex'
  ]);

  React.useEffect(() => {
    console.log('Fetching cryptocurrency data...');
    
    // Fetch comprehensive crypto data
    Promise.all([
      // Our API
      fetch('/api/cryptocurrencies?per_page=100')
        .then(res => res.json())
        .catch(() => []),
      
      // CoinGecko for Base ecosystem specifically
      fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${Array.from(baseEcosystemIds).join(',')}&order=market_cap_desc&per_page=50&page=1&sparkline=false`)
        .then(res => res.json())
        .catch(() => [])
    ])
    .then(([apiData, baseData]) => {
      console.log('API data:', apiData.length, 'Base data:', baseData.length);
      
      const combined = [];
      const seenIds = new Set();

      // Add Base ecosystem data first
      if (Array.isArray(baseData)) {
        baseData.forEach(coin => {
          if (!seenIds.has(coin.id)) {
            combined.push({
              id: coin.id,
              name: coin.name,
              symbol: coin.symbol,
              currentPrice: coin.current_price?.toString(),
              priceChangePercentage24h: coin.price_change_percentage_24h?.toString(),
              marketCap: coin.market_cap?.toString(),
              volume24h: coin.total_volume?.toString(),
              marketCapRank: coin.market_cap_rank,
              image: coin.image,
              isBaseEcosystem: true
            });
            seenIds.add(coin.id);
          }
        });
      }

      // Add remaining top coins
      if (Array.isArray(apiData)) {
        apiData.forEach(coin => {
          if (!seenIds.has(coin.id) && combined.length < 100) {
            combined.push({
              ...coin,
              isBaseEcosystem: baseEcosystemIds.has(coin.id)
            });
            seenIds.add(coin.id);
          }
        });
      }

      setCoins(combined);
      setStatus(`Loaded ${combined.length} cryptocurrencies`);
      console.log('Combined data:', combined.length, 'total coins');
    })
    .catch(err => {
      console.error('Error loading crypto data:', err);
      setStatus('Error loading cryptocurrencies: ' + err.message);
    });
  }, []);

  React.useEffect(() => {
    let filtered = coins;

    // Apply Base filter
    if (showBaseOnly) {
      filtered = filtered.filter(coin => coin.isBaseEcosystem);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(coin =>
        coin.name?.toLowerCase().includes(query) ||
        coin.symbol?.toLowerCase().includes(query)
      );
    }

    setFilteredCoins(filtered);
  }, [coins, showBaseOnly, searchQuery]);

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    const num = parseFloat(price);
    if (num >= 1) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 8
    }).format(num);
  };

  const formatPercentage = (percentage) => {
    if (!percentage) return '0.00%';
    const num = parseFloat(percentage);
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const handleCoinClick = (coin) => {
    console.log('Coin clicked:', coin.id);
    setSelectedCoin(coin);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCoin(null);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--background, #ffffff)',
      paddingTop: '80px' // Space for fixed headers
    }}>
      {/* Left Sidebar - Cryptocurrency List */}
      <div style={{
        width: '400px',
        borderRight: '1px solid #e5e7eb',
        backgroundColor: '#fafafa',
        padding: '20px',
        overflowY: 'auto',
        height: 'calc(100vh - 80px)',
        position: 'fixed',
        left: 0,
        top: '80px'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            💰 Cryptocurrencies
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            {status}
          </p>
        </div>

        {/* Filters */}
        <div style={{
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Base Ecosystem Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <button
              onClick={() => setShowBaseOnly(!showBaseOnly)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: showBaseOnly ? '#0052ff' : '#ffffff',
                color: showBaseOnly ? '#ffffff' : '#374151',
                border: '2px solid #0052ff',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🔵</span>
              {showBaseOnly ? 'Show All' : 'Base Ecosystem Only'}
            </button>
            {showBaseOnly && (
              <span style={{
                fontSize: '12px',
                color: '#0052ff',
                fontWeight: '600'
              }}>
                {filteredCoins.length} Base coins
              </span>
            )}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Search cryptocurrencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '10px 12px',
              fontSize: '14px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0052ff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
            }}
          />
        </div>

        {/* Cryptocurrency List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {filteredCoins.map((coin, index) => (
            <div
              key={coin.id || index}
              onClick={() => handleCoinClick(coin)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f9ff';
                e.currentTarget.style.borderColor = '#0052ff';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              {coin.image && (
                <img 
                  src={coin.image} 
                  alt={coin.name}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%'
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '2px'
                }}>
                  <span style={{
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#1f2937'
                  }}>
                    {coin.name}
                  </span>
                  {coin.isBaseEcosystem && (
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      backgroundColor: '#dbeafe',
                      color: '#1d4ed8',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      BASE
                    </span>
                  )}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    {coin.symbol?.toUpperCase()}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: parseFloat(coin.priceChangePercentage24h || 0) >= 0 ? '#059669' : '#dc2626'
                  }}>
                    {formatPercentage(coin.priceChangePercentage24h)}
                  </span>
                </div>
              </div>
              <div style={{
                textAlign: 'right'
              }}>
                <div style={{
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#1f2937'
                }}>
                  {formatPrice(coin.currentPrice)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        marginLeft: '400px',
        flex: 1,
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '2px dashed #d1d5db'
        }}>
          <div style={{
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              📊
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Select a Cryptocurrency
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '16px'
            }}>
              Click on any cryptocurrency from the left to view detailed charts and analysis
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <span style={{
                padding: '6px 12px',
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                🔵 Base Ecosystem
              </span>
              <span style={{
                padding: '6px 12px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                📈 Interactive Charts
              </span>
              <span style={{
                padding: '6px 12px',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                💰 Real-time Data
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Modal */}
      <CryptoChartModalSimple 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        cryptocurrency={selectedCoin}
      />
    </div>
  );
}