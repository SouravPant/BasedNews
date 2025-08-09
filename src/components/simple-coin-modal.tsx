import React from "react";

interface SimpleCoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  coin: any;
}

export function SimpleCoinModal({ isOpen, onClose, coin }: SimpleCoinModalProps) {
  const [coinData, setCoinData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Helper function to format market cap
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(1)}B`;
    } else if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`;
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}K`;
    } else {
      return `$${marketCap.toFixed(2)}`;
    }
  };

  React.useEffect(() => {
    if (isOpen && coin?.id) {
      setLoading(true);
      setError(null);
      setCoinData(null);
      
      console.log('🔍 Fetching coin data for:', coin.id);
      
      // Create fallback data immediately
      const fallbackData = {
        id: coin.id,
        name: coin.name || 'Unknown Coin',
        symbol: coin.symbol || 'UNK',
        image: { large: coin.image || 'https://via.placeholder.com/64' },
        market_data: {
          current_price: { usd: coin.current_price || 0 },
          price_change_percentage_24h: coin.price_change_percentage_24h || 0,
          market_cap: { usd: coin.market_cap || 0 }
        },
        description: { en: 'Description temporarily unavailable. This coin is part of the Base ecosystem.' }
      };
      
      // Set fallback data immediately to prevent blank screen
      setCoinData(fallbackData);
      
      // Try to fetch real data
      const fetchWithTimeout = (url: string, timeout = 10000) => {
        return Promise.race([
          fetch(url),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          )
        ]);
      };
      
      fetchWithTimeout(`https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('✅ Real coin data received:', data);
          if (data && data.market_data) {
            setCoinData(data);
            setError(null);
          } else {
            console.warn('⚠️ Invalid data structure, using fallback');
            setError('Using cached data');
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('❌ Error fetching coin data:', error);
          setError(`Unable to fetch live data: ${error.message}`);
          setLoading(false);
          // Keep fallback data, don't clear it
        });
    }
  }, [isOpen, coin?.id]);

  if (!isOpen) return null;

  // Safety check for coin data
  if (!coin) {
    console.error('❌ No coin data provided to modal');
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}
        onClick={onClose}
      >
        <div style={{
          backgroundColor: 'var(--background)',
          borderRadius: '16px',
          padding: '30px',
          textAlign: 'center',
          border: '1px solid var(--border)',
          color: 'var(--foreground)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#ef4444' }}>⚠️ Error</h3>
          <p style={{ margin: '0 0 20px 0', color: 'var(--muted-foreground)' }}>
            No coin data available
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Safe data extraction with fallbacks
  const safeGetValue = (obj: any, path: string, fallback: any = 'N/A') => {
    try {
      return path.split('.').reduce((o, p) => o?.[p], obj) ?? fallback;
    } catch {
      return fallback;
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={handleOverlayClick}
    >
      <div 
        style={{
          backgroundColor: 'var(--background)',
          borderRadius: '16px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          color: 'var(--foreground)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src={safeGetValue(coin, 'image') || safeGetValue(coinData, 'image.large') || 'https://via.placeholder.com/64'} 
              alt={safeGetValue(coin, 'name', 'Unknown')}
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64';
              }}
            />
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                {safeGetValue(coin, 'name') || safeGetValue(coinData, 'name', 'Unknown Coin')}
              </h2>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted-foreground)' }}>
                {(safeGetValue(coin, 'symbol') || safeGetValue(coinData, 'symbol', 'UNK')).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--muted)',
              border: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
              fontSize: '18px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '60vh' }}>
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px'
            }}>
              <div>Loading coin data...</div>
            </div>
          ) : coinData ? (
            <div>
              {/* Price Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: 'var(--muted)',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                    Current Price
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>
                    ${safeGetValue(coinData, 'market_data.current_price.usd', 0).toFixed(6)}
                  </div>
                </div>
                
                <div style={{
                  padding: '12px',
                  backgroundColor: 'var(--muted)',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                    24h Change
                  </div>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: safeGetValue(coinData, 'market_data.price_change_percentage_24h', 0) >= 0 ? '#22c55e' : '#ef4444'
                  }}>
                    {safeGetValue(coinData, 'market_data.price_change_percentage_24h', 0).toFixed(2)}%
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  backgroundColor: 'var(--muted)',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                    Market Cap
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>
                    {(() => {
                      const marketCap = safeGetValue(coinData, 'market_data.market_cap.usd', 0);
                      return marketCap > 0 ? formatMarketCap(marketCap) : 'N/A';
                    })()}
                  </div>
                </div>
              </div>



              {/* Description */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  About {safeGetValue(coinData, 'name', 'this coin')}
                </h3>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: 'var(--muted-foreground)',
                  margin: 0
                }}>
                  {(() => {
                    const description = safeGetValue(coinData, 'description.en', '');
                    if (description && description.length > 10) {
                      const cleanDescription = description.replace(/<[^>]*>/g, '').substring(0, 300);
                      return cleanDescription + (cleanDescription.length >= 300 ? '...' : '');
                    } else {
                      return `${safeGetValue(coinData, 'name', 'This coin')} is part of the Base ecosystem. Real-time price data and market information are displayed above.`;
                    }
                  })()}
                </p>
                {error && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#ef4444'
                  }}>
                    ⚠️ {error}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              color: 'var(--muted-foreground)'
            }}>
              Failed to load coin data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}