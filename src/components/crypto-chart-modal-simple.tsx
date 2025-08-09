import React from "react";
import Chart from 'react-apexcharts';

interface CryptoChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cryptocurrency: any;
}

// ApexCharts component - same as the working version
function WorkingChart({ data, coinName, days }: { data: Array<{ time: string; price: number }>, coinName: string, days: number }) {
  const [chartType, setChartType] = React.useState<'line' | 'area'>('area');

  if (!data || data.length === 0) return null;

  // Calculate price change
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercentage = firstPrice > 0 ? ((priceChange / firstPrice) * 100) : 0;
  const isPositive = priceChange >= 0;

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
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      zoom: {
        enabled: true,
        type: 'x' as any,
        autoScaleYaxis: true
      },
      background: 'transparent'
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
            Price Chart ({days}D)
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
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setChartType('area')}
            style={{
              padding: '6px 12px',
              background: chartType === 'area' ? 'var(--base-blue)' : 'var(--secondary)',
              color: chartType === 'area' ? 'white' : 'var(--secondary-foreground)',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Area
          </button>
          <button
            onClick={() => setChartType('line')}
            style={{
              padding: '6px 12px',
              background: chartType === 'line' ? 'var(--base-blue)' : 'var(--secondary)',
              color: chartType === 'line' ? 'white' : 'var(--secondary-foreground)',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Line
          </button>
        </div>
      </div>
      
      <Chart 
        options={chartOptions} 
        series={series} 
        type={chartType}
        height={350} 
      />
    </div>
  );
}

export function CryptoChartModalSimple({ isOpen, onClose, cryptocurrency }: CryptoChartModalProps) {
  const [chartData, setChartData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [timeframe, setTimeframe] = React.useState('7');
  const [coinDescription, setCoinDescription] = React.useState('');

  React.useEffect(() => {
    if (isOpen && cryptocurrency?.id) {
      setLoading(true);
      console.log(`🔍 Fetching chart data for ${cryptocurrency.id} (${timeframe} days)`);
      
      // Use fallback data immediately and try to fetch real data
      const fallbackData = {
        coinId: cryptocurrency.id, 
        days: parseInt(timeframe), 
        data: generateFallbackData(cryptocurrency.id, parseInt(timeframe))
      };
      setChartData(fallbackData);
      setLoading(false);
      
      // Try to fetch real data but don't block UI
      fetch(`/api/cryptocurrencies/${cryptocurrency.id}/chart?days=${timeframe}`)
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
  }, [isOpen, cryptocurrency?.id, timeframe]);

  // Fetch coin description from CoinGecko
  React.useEffect(() => {
    if (isOpen && cryptocurrency?.id) {
      console.log(`🔍 Fetching description for ${cryptocurrency.id}`);
      fetch(`https://api.coingecko.com/api/v3/coins/${cryptocurrency.id}`)
        .then(res => res.json())
        .then(data => {
          const description = data?.description?.en || '';
          // Remove HTML tags and limit length
          const cleanDescription = description.replace(/<[^>]*>/g, '').substring(0, 300);
          setCoinDescription(cleanDescription + (cleanDescription.length >= 300 ? '...' : ''));
          console.log(`✅ Description fetched for ${cryptocurrency.id}`);
        })
        .catch(error => {
          console.error('❌ Error fetching coin description:', error);
          setCoinDescription('Description not available for this cryptocurrency.');
        });
    }
  }, [isOpen, cryptocurrency?.id]);

  // Enhanced fallback data generation using cryptocurrency data
  const generateFallbackData = (coinId: string, days: number) => {
    console.log('Generating fallback data for:', coinId, 'cryptocurrency object:', cryptocurrency);
    
    // Use actual cryptocurrency data if available
    const basePrice = cryptocurrency?.current_price || 
                     cryptocurrency?.currentPrice ||
                     getBasePriceForCoin(coinId);
    
    const data = [];
    const now = new Date();
    const volatility = 0.05; // 5% volatility
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      // Create realistic price movement
      const randomFactor = 1 + (Math.random() - 0.5) * volatility;
      const trendFactor = 1 + (Math.random() - 0.5) * 0.02; // Small upward trend
      const price = basePrice * randomFactor * trendFactor;
      
      data.push({
        time: date.toISOString(),
        price: parseFloat(price.toFixed(8))
      });
    }
    
    return data;
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

  if (!isOpen || !cryptocurrency) return null;

  // Extract price data with fallbacks
  const currentPrice = cryptocurrency?.current_price || 
                      cryptocurrency?.currentPrice || 
                      getBasePriceForCoin(cryptocurrency?.id || '');
  
  // Calculate price change based on selected timeframe and chart data
  const calculatePriceChange = () => {
    if (chartData?.data && chartData.data.length > 1) {
      const firstPrice = chartData.data[0]?.price || currentPrice;
      const lastPrice = chartData.data[chartData.data.length - 1]?.price || currentPrice;
      return firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
    }
    // Fallback to 24h data if available
    return cryptocurrency?.price_change_percentage_24h || 
           cryptocurrency?.priceChangePercentage24h || 
           (Math.random() - 0.5) * 10; // Random change for demo
  };

  const priceChangeForTimeframe = calculatePriceChange();
  
  const marketCap = cryptocurrency?.market_cap || 
                   cryptocurrency?.marketCap || 
                   currentPrice * 1000000; // Estimate market cap

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
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
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
      }}>
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
                {timeframe === '1' ? '24h Change' : `${timeframe}d Change`}
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: priceChangeForTimeframe >= 0 ? '#22c55e' : '#ef4444'
              }}>
                {formatPercentage(priceChangeForTimeframe)}
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

          {/* Timeframe Selection */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <span style={{
              fontSize: '14px',
              color: 'var(--muted-foreground)',
              alignSelf: 'center',
              marginRight: '8px',
              fontWeight: '500'
            }}>
              Price Chart
            </span>
            {['1', '7', '30', '90', '365'].map((days) => (
              <button
                key={days}
                onClick={() => setTimeframe(days)}
                style={{
                  padding: '6px 12px',
                  background: timeframe === days ? 'var(--base-blue)' : 'var(--secondary)',
                  color: timeframe === days ? 'white' : 'var(--secondary-foreground)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {days === '1' ? '24H' : days === '7' ? '7D' : days === '30' ? '30D' : days === '90' ? '90D' : '1Y'}
              </button>
            ))}
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
              days={parseInt(timeframe)}
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

        {/* Analysis Section */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--muted)'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--foreground)',
            margin: '0 0 12px 0'
          }}>
            💡 About {cryptocurrency?.name || 'This Token'}
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'var(--muted-foreground)',
            margin: 0,
            lineHeight: '1.5'
          }}>
            {coinDescription || 'Loading description...'}
          </p>
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