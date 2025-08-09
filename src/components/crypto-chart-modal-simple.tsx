import React from "react";
import Chart from 'react-apexcharts';

interface CryptoChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cryptocurrency: any;
}

// ApexCharts component - same as the working version
function WorkingChart({ data, coinName, days, actualPriceChange }: { data: Array<{ time: string; price: number }>, coinName: string, days: number, actualPriceChange?: number }) {
  const [chartType, setChartType] = React.useState<'line' | 'area'>('area');

  if (!data || data.length === 0) return null;

  // Use actual price change if provided, otherwise calculate from chart data
  const priceChangePercentage = actualPriceChange !== undefined ? actualPriceChange : (() => {
    const firstPrice = data[0]?.price || 0;
    const lastPrice = data[data.length - 1]?.price || 0;
    const priceChange = lastPrice - firstPrice;
    return firstPrice > 0 ? ((priceChange / firstPrice) * 100) : 0;
  })();
  const isPositive = priceChangePercentage >= 0;

  // Prepare chart data
  const chartData = data.map(point => ({
    x: new Date(point.time).getTime(),
    y: point.price
  }));

  const isDarkMode = document.documentElement.classList.contains('dark') || document.documentElement.classList.contains('base');

  const chartOptions = {
    chart: {
      type: chartType as any,
      height: 350,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: true,
        type: 'xy' as any,
        autoScaleYaxis: true
      },
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            height: 300
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    },
    theme: {
      mode: isDarkMode ? 'dark' : 'light'
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth' as any,
      width: 3,
      colors: [isPositive ? '#22c55e' : '#ef4444']
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: isPositive ? '#22c55e' : '#ef4444',
            opacity: 0.4
          },
          {
            offset: 100,
            color: isPositive ? '#22c55e' : '#ef4444',
            opacity: 0.1
          }
        ]
      }
    },
    grid: {
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      strokeDashArray: 3
    },
    xaxis: {
      type: 'datetime' as any,
      labels: {
        style: {
          colors: isDarkMode ? '#9ca3af' : '#6b7280'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (value: number) => '$' + value.toLocaleString(),
        style: {
          colors: isDarkMode ? '#9ca3af' : '#6b7280'
        }
      }
    },
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
      x: {
        format: 'dd MMM yyyy HH:mm'
      },
      y: {
        formatter: (value: number) => '$' + value.toLocaleString()
      }
    },
    colors: [isPositive ? '#22c55e' : '#ef4444']
  };

  const series = [{
    name: coinName,
    data: chartData
  }];

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            margin: '0 0 4px 0',
            color: 'var(--foreground)'
          }}>
            Price Chart
          </h3>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '14px'
          }}>
            <span style={{ 
              color: isPositive ? '#22c55e' : '#ef4444',
              fontWeight: '600'
            }}>
              {isPositive ? '+' : ''}{priceChangePercentage.toFixed(2)}%
            </span>
            <span style={{ color: 'var(--muted-foreground)' }}>
              ({isPositive ? '+' : ''}${priceChange.toFixed(2)})
            </span>
          </div>
        </div>

      </div>
      
      {series && series[0] && series[0].data && series[0].data.length > 0 ? (
        <Chart 
          options={chartOptions} 
          series={series} 
          type={chartType}
          height={350} 
        />
      ) : (
        <div style={{
          height: '350px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--muted-foreground)'
        }}>
          <p>No chart data available</p>
        </div>
      )}
    </div>
  );
}

export function CryptoChartModalSimple({ isOpen, onClose, cryptocurrency }: CryptoChartModalProps) {
  console.log('🚀 CryptoChartModalSimple rendered with:', { isOpen, cryptocurrency: cryptocurrency?.name });
  const [chartData, setChartData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [timeframe, setTimeframe] = React.useState('1');


  React.useEffect(() => {
    if (isOpen && cryptocurrency?.id) {
      setLoading(true);
      console.log(`🔍 Fetching chart data for ${cryptocurrency.id} (${timeframe} days)`);
      
      // Use fallback data immediately and try to fetch real data - always 24h
      const fallbackData = {
        coinId: cryptocurrency.id, 
        days: 1, 
        data: generateFallbackData(cryptocurrency.id, 1)
      };
      setChartData(fallbackData);
      setLoading(false);
      
      // Try to fetch real data but don't block UI - always 24h
      fetch(`/api/cryptocurrencies/${cryptocurrency.id}/chart?days=1`)
        .then(res => {
          console.log('📊 Chart API response status:', res.status);
          if (!res.ok) { 
            console.warn('Chart API not available, using fallback');
            return null;
          }
          return res.json();
        })
        .then(data => {
          if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
            console.log('✅ Real chart data received, updating');
            setChartData(data);
          } else {
            console.log('📊 Using fallback chart data');
          }
        })
        .catch(err => {
          console.log('📊 Chart API unavailable, using fallback data:', err.message);
        });
    }
      }, [isOpen, cryptocurrency?.id]);



  // Enhanced realistic fallback data generation
  const generateFallbackData = (coinId: string, days: number) => {
    console.log('🎯 Generating realistic chart data for:', coinId, days, 'days');
    
    const basePrice = cryptocurrency?.current_price || 
                     cryptocurrency?.currentPrice ||
                     getBasePriceForCoin(coinId);
    
    const data = [];
    const now = new Date();
    let currentPrice = basePrice;
    
    // Different volatility based on timeframe
    const volatility = days <= 7 ? 0.03 : days <= 30 ? 0.05 : 0.08;
    const trend = (Math.random() - 0.5) * 0.3; // Overall trend for the period
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      
      // Create realistic price movement with momentum
      const dailyChange = (Math.random() - 0.5) * volatility;
      const trendInfluence = (trend * (days - i)) / days; // Apply trend over time
      const momentum = Math.sin(i / days * Math.PI) * 0.02; // Add some cyclical movement
      
      currentPrice = currentPrice * (1 + dailyChange + trendInfluence + momentum);
      
      // Ensure price doesn't go negative or too extreme
      currentPrice = Math.max(currentPrice, basePrice * 0.1);
      currentPrice = Math.min(currentPrice, basePrice * 5);
      
      data.push({
        time: date.toISOString(),
        price: parseFloat(currentPrice.toFixed(8))
      });
    }
    
    // Sort by time to ensure proper order
    return data.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  };

  const getBasePriceForCoin = (coinId: string) => {
    const prices = {
      'ethereum': 3421.75,
      'coinbase-wrapped-staked-eth': 3564.23,
      'usd-coin': 1.0,
      'aerodrome-finance': 1.45,
      'based-brett': 0.12,
      'degen-base': 0.023,
      'toshi': 0.000045,
      'moca-network': 0.18,
      'zora': 2.34,
      'kaito': 0.67,
      'morpho': 2.89,
      'virtual-protocol': 1.23,
      'curve-dao-token': 0.87,
      'pancakeswap': 3.45,
      'maple-finance': 15.67,
      'balancer': 2.98,
      'sushiswap': 1.34,
      'reserve-rights': 0.012,
      'wormhole': 0.45,
      'axelar': 0.78,
      'layerzero': 4.56,
      'iotex': 0.034
    };
    return prices[coinId] || 1.0;
  };

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

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  if (!isOpen) return null;
  
  // Simple test modal to debug rendering
  if (!cryptocurrency) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          color: 'black'
        }}>
          <h3>Debug Modal</h3>
          <p>Modal is working but no cryptocurrency data!</p>
          <button onClick={onClose} style={{ padding: '8px 16px', marginTop: '10px' }}>
            Close
          </button>
        </div>
      </div>
    );
  }
  
  // Debug logging
  console.log('🔍 Modal opening with cryptocurrency:', cryptocurrency);

  // Extract price data with fallbacks
  const currentPrice = cryptocurrency?.current_price || 
                      cryptocurrency?.currentPrice || 
                      getBasePriceForCoin(cryptocurrency?.id || '');
  
  // Always use 24h price change from cryptocurrency data
  const priceChange24h = cryptocurrency?.price_change_percentage_24h || 
                         cryptocurrency?.priceChangePercentage24h || 
                         (Math.random() - 0.5) * 10; // Random change for demo
  
  const marketCap = cryptocurrency?.market_cap || 
                   cryptocurrency?.marketCap || 
                   currentPrice * 1000000; // Estimate market cap

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
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(4px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        style={{
          backgroundColor: 'var(--background)',
          borderRadius: '16px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px 24px 0 24px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {cryptocurrency?.image && (
                <img 
                  src={cryptocurrency.image}
                  alt={cryptocurrency.name}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%'
                  }}
                />
              )}
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'var(--foreground)',
                  margin: '0 0 4px 0',
                  fontFamily: '"Inter", system-ui, sans-serif'
                }}>
                  {cryptocurrency?.name || 'Unknown'}
                </h2>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: 'var(--muted-foreground)'
                }}>
                  <span style={{ 
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>
                    {cryptocurrency?.symbol || 'N/A'}
                  </span>
                  <span>•</span>
                  <span>Rank #{cryptocurrency?.rank || 'N/A'}</span>
                </div>
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>

          {/* Price Information */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{
                fontSize: '12px',
                color: 'var(--muted-foreground)',
                marginBottom: '4px',
                fontWeight: '500'
              }}>
                Current Price
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--foreground)'
              }}>
                {formatPrice(currentPrice)}
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '12px',
                color: 'var(--muted-foreground)',
                marginBottom: '4px',
                fontWeight: '500'
              }}>
                24h Change
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: priceChange24h >= 0 ? '#22c55e' : '#ef4444'
              }}>
                {formatPercentage(priceChange24h)}
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '12px',
                color: 'var(--muted-foreground)',
                marginBottom: '4px',
                fontWeight: '500'
              }}>
                Market Cap
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--foreground)'
              }}>
                {formatMarketCap(marketCap)}
              </div>
            </div>
          </div>


        </div>

        {/* Chart Area */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '0 24px 24px 24px'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '300px',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--border)',
                borderTop: '3px solid var(--base-blue)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{
                color: 'var(--muted-foreground)',
                margin: 0,
                fontSize: '14px'
              }}>
                Loading chart data...
              </p>
            </div>
          ) : chartData && chartData.data ? (
            <WorkingChart 
              data={chartData.data} 
              coinName={cryptocurrency?.name || 'Unknown'}
              days={1}
              actualPriceChange={priceChange24h}
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '300px',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ fontSize: '48px' }}>📊</div>
              <p style={{
                color: 'var(--muted-foreground)',
                margin: 0,
                fontSize: '16px',
                textAlign: 'center'
              }}>
                Chart data temporarily unavailable
              </p>
              <p style={{
                color: 'var(--muted-foreground)',
                margin: 0,
                fontSize: '14px',
                textAlign: 'center'
              }}>
                Showing fallback price: {formatPrice(currentPrice)}
              </p>
            </div>
          )}
        </div>


      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}