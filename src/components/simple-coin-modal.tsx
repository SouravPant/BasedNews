import React from "react";

interface SimpleCoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  coin: any;
}

export function SimpleCoinModal({ isOpen, onClose, coin }: SimpleCoinModalProps) {
  const [coinData, setCoinData] = React.useState<any>(null);
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
      
      // Fetch basic coin data only
      fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
        .then(res => res.json())
        .then(data => {
          console.log('✅ Coin data received:', data);
          setCoinData(data);
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