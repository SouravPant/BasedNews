import React from "react";

interface CryptoChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cryptocurrency: any;
}

export function CryptoChartModalSimple({ isOpen, onClose, cryptocurrency }: CryptoChartModalProps) {
  const [chartData, setChartData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [timeframe, setTimeframe] = React.useState('7');

  React.useEffect(() => {
    if (isOpen && cryptocurrency?.id) {
      setLoading(true);
      fetch(`/api/cryptocurrencies/${cryptocurrency.id}/chart?days=${timeframe}`)
        .then(res => res.json())
        .then(data => {
          setChartData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Chart data error:', err);
          setLoading(false);
        });
    }
  }, [isOpen, cryptocurrency?.id, timeframe]);

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
          border: '2px dashed #d1d5db',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          {loading ? (
            <div style={{
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{
                fontSize: '18px',
                marginBottom: '8px'
              }}>
                📊
              </div>
              <div>Loading chart data...</div>
            </div>
          ) : chartData?.data?.length > 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{
                fontSize: '18px',
                marginBottom: '8px'
              }}>
                📈
              </div>
              <div>Chart data loaded ({chartData.data.length} points)</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                Interactive charts coming soon!
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{
                fontSize: '18px',
                marginBottom: '8px'
              }}>
                📊
              </div>
              <div>Chart unavailable</div>
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