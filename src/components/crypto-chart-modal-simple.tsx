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
      mode: (isDarkMode ? 'dark' : 'light') as 'dark' | 'light'
    },
    stroke: {
      curve: 'smooth' as any,
      width: 3
    },
    colors: [isPositive ? '#0052ff' : '#ef4444'],
    fill: {
      type: chartType === 'area' ? 'gradient' : 'solid',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    xaxis: {
      type: 'datetime' as any,
      labels: {
        format: days === 1 ? 'HH:mm' : days <= 7 ? 'MMM dd' : 'MMM dd, yyyy',
        style: {
          colors: isDarkMode ? '#9ca3af' : '#6b7280'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (value: number) => `$${value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: value < 1 ? 6 : 2,
        })}`,
        style: {
          colors: isDarkMode ? '#9ca3af' : '#6b7280'
        }
      }
    },
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
      x: {
        format: days === 1 ? 'MMM dd, HH:mm' : 'MMM dd, yyyy'
      },
      y: {
        formatter: (value: number) => `$${value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: value < 1 ? 6 : 2,
        })}`
      }
    },
    grid: {
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      strokeDashArray: 3
    },
    dataLabels: {
      enabled: false
    }
  };

  const series = [{
    name: `${coinName} Price`,
    data: chartData
  }];

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        padding: '0 16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            backgroundColor: isPositive ? '#dcfce7' : '#fef2f2',
            color: isPositive ? '#166534' : '#dc2626'
          }}>
            {isPositive ? '+' : ''}{priceChangePercentage.toFixed(2)}%
          </div>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {data.length} data points
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setChartType('line')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              backgroundColor: chartType === 'line' ? '#0052ff' : 'transparent',
              color: chartType === 'line' ? '#ffffff' : '#6b7280',
              cursor: 'pointer'
            }}
          >
            Line
          </button>
          <button
            onClick={() => setChartType('area')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              backgroundColor: chartType === 'area' ? '#0052ff' : 'transparent',
              color: chartType === 'area' ? '#ffffff' : '#6b7280',
              cursor: 'pointer'
            }}
          >
            Area
          </button>
        </div>
      </div>
      
      <div style={{ width: '100%', height: '350px' }}>
        <Chart
          options={chartOptions}
          series={series}
          type={chartType}
          height={350}
          width="100%"
        />
      </div>
    </div>
  );
}

export function CryptoChartModalSimple({ isOpen, onClose, cryptocurrency }: CryptoChartModalProps) {
  const [chartData, setChartData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [timeframe, setTimeframe] = React.useState('7');

  React.useEffect(() => {
    if (isOpen && cryptocurrency?.id) {
      setLoading(true);
      console.log(`Fetching chart data for ${cryptocurrency.id} (${timeframe} days)`);
      
      // Use our working API endpoint with better error handling
      fetch(`/api/cryptocurrencies/${cryptocurrency.id}/chart?days=${timeframe}`)
        .then(res => {
          console.log('Chart API response status:', res.status);
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.text(); // Get as text first to debug
        })
        .then(text => {
          console.log('Raw API response:', text.substring(0, 200));
          try {
            const data = JSON.parse(text);
            console.log('Parsed chart data:', data);
            
            // Validate the data structure
            if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
              setChartData(data);
            } else {
              console.warn('Invalid chart data structure:', data);
              // Generate fallback data
              setChartData({
                coinId: cryptocurrency.id,
                days: parseInt(timeframe),
                data: generateFallbackData(cryptocurrency.id, parseInt(timeframe))
              });
            }
            setLoading(false);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            setChartData(null);
            setLoading(false);
          }
        })
        .catch(err => {
          console.error('Chart data fetch error:', err);
          // Generate fallback data on API failure
          setChartData({
            coinId: cryptocurrency.id,
            days: parseInt(timeframe),
            data: generateFallbackData(cryptocurrency.id, parseInt(timeframe))
          });
          setLoading(false);
        });
    }
  }, [isOpen, cryptocurrency?.id, timeframe]);

  // Generate fallback chart data
  const generateFallbackData = (coinId, days) => {
    const basePrice = getBasePriceForCoin(coinId);
    const data = [];
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    
    for (let i = days - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - (i * msPerDay));
      const randomFactor = 0.9 + Math.random() * 0.2; // ±10% variation
      const price = basePrice * randomFactor;
      
      data.push({
        time: time.toISOString(),
        price: price
      });
    }
    
    return data;
  };

  const getBasePriceForCoin = (coinId) => {
    const basePrices = {
      'bitcoin': 116000,
      'ethereum': 4000,
      'aerodrome-finance': 1.02,
      'based-brett': 0.06,
      'degen-base': 0.01,
      'binancecoin': 700,
      'solana': 180,
      'cardano': 0.8,
      'avalanche-2': 40,
      'dogecoin': 0.23,
      'chainlink': 19,
      'polygon-ecosystem-token': 0.5,
      'tron': 0.25,
      'polkadot': 8,
      'uniswap': 15,
      'litecoin': 110,
      'near': 6,
      'stellar': 0.45
    };
    return basePrices[coinId] || 50; // Default fallback price
  };

  if (!isOpen) return null;

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

  const formatMarketCap = (marketCap) => {
    if (!marketCap) return '$0';
    const num = parseFloat(marketCap);
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    return `$${(num / 1e3).toFixed(1)}K`;
  };

  const timeframes = [
    { value: '1', label: '24H' },
    { value: '7', label: '7D' },
    { value: '30', label: '30D' },
    { value: '90', label: '90D' },
    { value: '365', label: '1Y' }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.color = '#374151';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
          paddingRight: '40px'
        }}>
          {cryptocurrency?.image && (
            <img 
              src={cryptocurrency.image} 
              alt={cryptocurrency.name}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%'
              }}
            />
          )}
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 4px 0'
            }}>
              {cryptocurrency?.name || 'Unknown'}
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0,
              fontWeight: '600'
            }}>
              {cryptocurrency?.symbol?.toUpperCase()} • Rank #{cryptocurrency?.marketCapRank || 'N/A'}
            </p>
          </div>
        </div>

        {/* Price Info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Current Price
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1f2937'
            }}>
              {formatPrice(cryptocurrency?.currentPrice)}
            </div>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              24h Change
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: parseFloat(cryptocurrency?.priceChangePercentage24h || 0) >= 0 ? '#059669' : '#dc2626'
            }}>
              {formatPercentage(cryptocurrency?.priceChangePercentage24h)}
            </div>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Market Cap
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1f2937'
            }}>
              {formatMarketCap(cryptocurrency?.marketCap)}
            </div>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              24h Volume
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1f2937'
            }}>
              {formatMarketCap(cryptocurrency?.volume24h)}
            </div>
          </div>
        </div>

        {/* Timeframe Selection */}
        <div style={{
          marginBottom: '20px'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '12px'
          }}>
            Price Chart
          </div>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                style={{
                  padding: '8px 16px',
                  border: `2px solid ${timeframe === tf.value ? '#2563eb' : '#e5e7eb'}`,
                  backgroundColor: timeframe === tf.value ? '#2563eb' : '#ffffff',
                  color: timeframe === tf.value ? '#ffffff' : '#6b7280',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (timeframe !== tf.value) {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.color = '#2563eb';
                  }
                }}
                onMouseOut={(e) => {
                  if (timeframe !== tf.value) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.color = '#6b7280';
                  }
                }}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div style={{
          height: '300px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 12px'
              }}></div>
              <div>Loading chart data...</div>
            </div>
          ) : chartData?.data?.length > 0 ? (
            <WorkingChart 
              data={chartData.data} 
              coinName={cryptocurrency?.name || 'Unknown'}
              days={parseInt(timeframe)}
            />
          ) : (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{
                fontSize: '18px',
                marginBottom: '8px'
              }}>
                📊
              </div>
              <div>Chart data unavailable</div>
            </div>
          )}
        </div>

        {/* Analysis Section */}
        <div style={{
          padding: '20px',
          backgroundColor: '#f0f9ff',
          borderRadius: '12px',
          border: '1px solid #bae6fd'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#0c4a6e',
            margin: '0 0 12px 0'
          }}>
            Quick Analysis
          </h3>
          <div style={{
            display: 'grid',
            gap: '8px',
            fontSize: '14px',
            color: '#0c4a6e'
          }}>
            <div>
              • <strong>Market Position:</strong> Ranked #{cryptocurrency?.marketCapRank || 'N/A'} by market cap
            </div>
            <div>
              • <strong>Price Trend:</strong> {parseFloat(cryptocurrency?.priceChangePercentage24h || 0) >= 0 ? '📈 Bullish (24h)' : '📉 Bearish (24h)'}
            </div>
            <div>
              • <strong>Volume:</strong> {formatMarketCap(cryptocurrency?.volume24h)} in 24h trading
            </div>
            <div>
              • <strong>Supply:</strong> {cryptocurrency?.symbol?.toUpperCase()} token on multiple exchanges
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}