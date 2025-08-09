import React from "react";

interface SimpleCoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  coin: any;
}

export function SimpleCoinModal({ isOpen, onClose, coin }: SimpleCoinModalProps) {
  const [coinData, setCoinData] = React.useState<any>(null);
  const [chartData, setChartData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

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
      console.log('🔍 Fetching coin data for:', coin.id);
      
      // Fetch both coin data and chart data
      Promise.all([
        // Basic coin data
        fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`),
        // 7-day chart data
        fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=7&interval=hourly`)
      ])
        .then(async ([coinRes, chartRes]) => {
          const coinData = await coinRes.json();
          const chartData = await chartRes.json();
          
          console.log('✅ Coin data received:', coinData);
          console.log('✅ Chart data received:', chartData);
          
          setCoinData(coinData);
          setChartData(chartData);
          setLoading(false);
        })
        .catch(error => {
          console.error('❌ Error fetching coin data:', error);
          setLoading(false);
        });
    }
  }, [isOpen, coin?.id]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
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
              src={coin?.image || coinData?.image?.large} 
              alt={coin?.name}
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            />
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                {coin?.name || coinData?.name}
              </h2>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted-foreground)' }}>
                {coin?.symbol?.toUpperCase() || coinData?.symbol?.toUpperCase()}
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
                    ${coinData.market_data?.current_price?.usd?.toFixed(6) || 'N/A'}
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
                    color: (coinData.market_data?.price_change_percentage_24h || 0) >= 0 ? '#22c55e' : '#ef4444'
                  }}>
                    {(coinData.market_data?.price_change_percentage_24h || 0).toFixed(2)}%
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
                    {coinData.market_data?.market_cap?.usd ? 
                      formatMarketCap(coinData.market_data.market_cap.usd) : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Enhanced 7-Day Chart */}
              {chartData?.prices && chartData.prices.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                    7-Day Price Chart
                  </h3>
                  <div style={{
                    height: '150px',
                    backgroundColor: 'var(--muted)',
                    borderRadius: '12px',
                    padding: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {(() => {
                      const prices = chartData.prices.map((point: [number, number]) => point[1]);
                      const maxPrice = Math.max(...prices);
                      const minPrice = Math.min(...prices);
                      const priceRange = maxPrice - minPrice;
                      
                      // Create SVG path for smooth line
                      const width = 100; // percentage
                      const height = 100; // percentage
                      const step = width / (prices.length - 1);
                      
                      let pathData = '';
                      
                      prices.forEach((price: number, index: number) => {
                        const x = index * step;
                        const y = 100 - ((price - minPrice) / priceRange) * 80 - 10; // Invert Y and add padding
                        
                        if (index === 0) {
                          pathData += `M ${x} ${y}`;
                        } else {
                          pathData += ` L ${x} ${y}`;
                        }
                      });
                      
                      // Determine if trend is positive or negative
                      const firstPrice = prices[0];
                      const lastPrice = prices[prices.length - 1];
                      const isPositive = lastPrice >= firstPrice;
                      
                      return (
                        <svg
                          width="100%"
                          height="100%"
                          viewBox="0 0 100 100"
                          style={{ position: 'absolute', top: 0, left: 0 }}
                        >
                          {/* Gradient definition */}
                          <defs>
                            <linearGradient id={`gradient-${coin.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0.3" />
                              <stop offset="100%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0.05" />
                            </linearGradient>
                          </defs>
                          
                          {/* Fill area under the curve */}
                          <path
                            d={`${pathData} L 100 100 L 0 100 Z`}
                            fill={`url(#gradient-${coin.id})`}
                          />
                          
                          {/* Main line */}
                          <path
                            d={pathData}
                            fill="none"
                            stroke={isPositive ? '#22c55e' : '#ef4444'}
                            strokeWidth="0.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          
                          {/* Data points */}
                          {prices.map((price: number, index: number) => {
                            if (index % Math.ceil(prices.length / 10) === 0) { // Show every nth point
                              const x = index * step;
                              const y = 100 - ((price - minPrice) / priceRange) * 80 - 10;
                              
                              return (
                                <circle
                                  key={index}
                                  cx={x}
                                  cy={y}
                                  r="0.8"
                                  fill={isPositive ? '#22c55e' : '#ef4444'}
                                  opacity="0.8"
                                />
                              );
                            }
                            return null;
                          })}
                        </svg>
                      );
                    })()}
                    
                    {/* Price labels */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      fontSize: '12px',
                      color: 'var(--muted-foreground)'
                    }}>
                      High: ${Math.max(...chartData.prices.map((p: [number, number]) => p[1])).toFixed(4)}
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      fontSize: '12px',
                      color: 'var(--muted-foreground)'
                    }}>
                      Low: ${Math.min(...chartData.prices.map((p: [number, number]) => p[1])).toFixed(4)}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {coinData.description?.en && (
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                    About {coinData.name}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.5',
                    color: 'var(--muted-foreground)',
                    margin: 0
                  }}>
                    {coinData.description.en.replace(/<[^>]*>/g, '').substring(0, 300)}
                    {coinData.description.en.length > 300 ? '...' : ''}
                  </p>
                </div>
              )}
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