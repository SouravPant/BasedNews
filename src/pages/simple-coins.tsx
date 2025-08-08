import React from "react";

export function SimpleCoins() {
  const [coins, setCoins] = React.useState([]);
  const [status, setStatus] = React.useState('Loading top cryptocurrencies...');
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    console.log('Fetching cryptocurrency data...');
    fetch('/api/cryptocurrencies?per_page=50')
      .then(res => res.json())
      .then(data => {
        console.log('Crypto data loaded:', data.length, 'coins');
        setCoins(Array.isArray(data) ? data : []);
        setStatus(`Successfully loaded ${Array.isArray(data) ? data.length : 0} cryptocurrencies`);
      })
      .catch(err => {
        console.error('Error loading crypto data:', err);
        setStatus('Error loading cryptocurrencies: ' + err.message);
      });
  }, []);

  const filteredCoins = coins.filter(coin => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      coin.name?.toLowerCase().includes(query) ||
      coin.symbol?.toLowerCase().includes(query)
    );
  });

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

  const formatMarketCap = (marketCap) => {
    if (!marketCap) return '$0';
    const num = parseFloat(marketCap);
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    return `$${(num / 1e3).toFixed(1)}K`;
  };

  const formatPercentage = (percentage) => {
    if (!percentage) return '0.00%';
    const num = parseFloat(percentage);
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <header style={{
        textAlign: 'center',
        marginBottom: '40px',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#2563eb',
          margin: '0 0 10px 0'
        }}>
          💰 Top Cryptocurrencies
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#6b7280',
          margin: '0 0 10px 0'
        }}>
          Real-time prices and market data
        </p>
        <p style={{
          fontSize: '14px',
          color: '#9ca3af',
          margin: 0
        }}>
          {status}
        </p>
      </header>

      {/* Navigation */}
      <nav style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <a 
          href="/" 
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#6b7280',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            marginRight: '10px',
            fontWeight: '500'
          }}
        >
          📰 Back to News
        </a>
        <a 
          href="/coins" 
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#059669',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500'
          }}
        >
          💰 Cryptocurrencies
        </a>
      </nav>

      {/* Search */}
      <div style={{
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <input
          type="text"
          placeholder="🔍 Search cryptocurrencies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '12px 20px',
            fontSize: '16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '400px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#2563eb';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
          }}
        />
      </div>

      {/* Coins Table */}
      <main>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '20px'
        }}>
          Market Rankings ({filteredCoins.length} cryptocurrencies)
        </h2>

        <div style={{
          overflowX: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f9fafb',
                borderBottom: '2px solid #e5e7eb'
              }}>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  #
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Cryptocurrency
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'right',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Price
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'right',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  24h Change
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'right',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Market Cap
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCoins.map((coin, index) => (
                <tr 
                  key={coin.id || index}
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{
                    padding: '16px',
                    fontWeight: '600',
                    color: '#6b7280'
                  }}>
                    {coin.marketCapRank || index + 1}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      {coin.image && (
                        <img 
                          src={coin.image} 
                          alt={coin.name}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%'
                          }}
                        />
                      )}
                      <div>
                        <div style={{
                          fontWeight: '600',
                          color: '#1f2937'
                        }}>
                          {coin.name || 'Unknown'}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}>
                          {coin.symbol?.toUpperCase() || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{
                    padding: '16px',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {formatPrice(coin.currentPrice)}
                  </td>
                  <td style={{
                    padding: '16px',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: parseFloat(coin.priceChangePercentage24h || 0) >= 0 ? '#059669' : '#dc2626'
                  }}>
                    {formatPercentage(coin.priceChangePercentage24h)}
                  </td>
                  <td style={{
                    padding: '16px',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {formatMarketCap(coin.marketCap)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCoins.length === 0 && !status.includes('Loading') && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '20px',
              border: '2px dashed #d1d5db',
              borderRadius: '12px',
              color: '#6b7280'
            }}>
              <p style={{ margin: 0, fontSize: '16px' }}>
                {searchQuery ? `No cryptocurrencies found for "${searchQuery}"` : 'No cryptocurrencies available'}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: '60px',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '14px'
      }}>
        <p style={{ margin: 0 }}>
          Real-time cryptocurrency market data • Powered by CoinGecko API
        </p>
      </footer>
    </div>
  );
}