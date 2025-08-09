import React from "react";
import { BaseWalletConnect } from "./base-wallet-connect";

interface Coin {
  id: string;
  name: string;
  symbol: string;
  currentPrice: string;
  priceChangePercentage24h: string;
  image?: string;
}

interface WatchlistItem extends Coin {
  alertPrice?: number;
  alertType?: 'above' | 'below';
}

interface PortfolioItem extends Coin {
  amount: number;
  purchasePrice: number;
}

export function MiniAppDashboard() {
  const [watchlist, setWatchlist] = React.useState<WatchlistItem[]>([]);
  const [portfolio, setPortfolio] = React.useState<PortfolioItem[]>([]);
  const [totalPortfolioValue, setTotalPortfolioValue] = React.useState(0);
  const [portfolioChange24h, setPortfolioChange24h] = React.useState(0);
  const [isAddingCoin, setIsAddingCoin] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<Coin[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Load saved data from localStorage
  React.useEffect(() => {
    const savedWatchlist = localStorage.getItem('basednews-watchlist');
    const savedPortfolio = localStorage.getItem('basednews-portfolio');
    
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio));
    }
  }, []);

  // Calculate portfolio value
  React.useEffect(() => {
    if (portfolio.length > 0) {
      let totalValue = 0;
      let totalChange = 0;
      
      portfolio.forEach(item => {
        const currentValue = item.amount * parseFloat(item.currentPrice);
        const purchaseValue = item.amount * item.purchasePrice;
        totalValue += currentValue;
        totalChange += (currentValue - purchaseValue);
      });
      
      setTotalPortfolioValue(totalValue);
      setPortfolioChange24h(totalChange);
    }
  }, [portfolio]);

  // Search for coins
  const searchCoins = React.useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/cryptocurrencies?search=${encodeURIComponent(query)}&per_page=5`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    }
  }, []);

  const addToWatchlist = (coin: Coin) => {
    const newWatchlist = [...watchlist, coin];
    setWatchlist(newWatchlist);
    localStorage.setItem('basednews-watchlist', JSON.stringify(newWatchlist));
    setIsAddingCoin(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeFromWatchlist = (coinId: string) => {
    const newWatchlist = watchlist.filter(item => item.id !== coinId);
    setWatchlist(newWatchlist);
    localStorage.setItem('basednews-watchlist', JSON.stringify(newWatchlist));
  };

  const addToPortfolio = (coin: Coin, amount: number, purchasePrice: number) => {
    const portfolioItem: PortfolioItem = {
      ...coin,
      amount,
      purchasePrice
    };
    const newPortfolio = [...portfolio, portfolioItem];
    setPortfolio(newPortfolio);
    localStorage.setItem('basednews-portfolio', JSON.stringify(newPortfolio));
  };

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
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

  const formatPercentage = (percentage: string | number) => {
    const num = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: '80px' // Space for bottom nav
    }}>
      {/* Header */}
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
          justifyContent: 'space-between'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--primary)',
            margin: 0
          }}>
            Dashboard
          </h1>
          <button
            onClick={() => setIsAddingCoin(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            + Add Coin
          </button>
        </div>
      </header>

              {/* Portfolio Overview */}
        <section style={{ padding: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--foreground)',
              margin: 0
            }}>
              💼 Portfolio Overview
            </h2>
            <BaseWalletConnect showInPortfolio={true} />
          </div>
        
        <div style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{
              fontSize: '14px',
              color: 'var(--muted-foreground)'
            }}>
              Total Value
            </span>
            <span style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--card-foreground)'
            }}>
              {formatPrice(totalPortfolioValue)}
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '14px',
              color: 'var(--muted-foreground)'
            }}>
              24h Change
            </span>
            <span style={{
              fontSize: '16px',
              fontWeight: '600',
              color: portfolioChange24h >= 0 ? '#22c55e' : '#ef4444'
            }}>
              {portfolioChange24h >= 0 ? '+' : ''}{formatPrice(portfolioChange24h)}
            </span>
          </div>
        </div>

        {/* Portfolio Holdings */}
        {portfolio.length > 0 && (
          <div style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--card-foreground)',
              marginBottom: '12px'
            }}>
              Holdings
            </h3>
            
            {portfolio.map((item, index) => {
              const currentValue = item.amount * parseFloat(item.currentPrice);
              const purchaseValue = item.amount * item.purchasePrice;
              const pnl = currentValue - purchaseValue;
              const pnlPercent = ((currentValue - purchaseValue) / purchaseValue) * 100;
              
              return (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: index < portfolio.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--card-foreground)'
                    }}>
                      {item.amount} {item.symbol.toUpperCase()}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--muted-foreground)'
                    }}>
                      Avg: {formatPrice(item.purchasePrice)}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--card-foreground)'
                    }}>
                      {formatPrice(currentValue)}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: pnl >= 0 ? '#22c55e' : '#ef4444'
                    }}>
                      {pnl >= 0 ? '+' : ''}{formatPrice(pnl)} ({formatPercentage(pnlPercent)})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Watchlist */}
      <section style={{ padding: '0 16px 16px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: 'var(--foreground)',
          marginBottom: '12px'
        }}>
          👀 Watchlist
        </h2>
        
        {watchlist.length === 0 ? (
          <div style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--muted-foreground)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📈</div>
            <p style={{ margin: '0 0 16px 0' }}>Start tracking your favorite coins</p>
            <button
              onClick={() => setIsAddingCoin(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              + Add Your First Coin
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {watchlist.map((coin, index) => (
              <div key={index} style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
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
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'var(--card-foreground)'
                    }}>
                      {coin.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--muted-foreground)'
                    }}>
                      {coin.symbol.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'var(--card-foreground)'
                  }}>
                    {formatPrice(coin.currentPrice)}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: parseFloat(coin.priceChangePercentage24h) >= 0 ? '#22c55e' : '#ef4444'
                  }}>
                    {formatPercentage(coin.priceChangePercentage24h)}
                  </div>
                </div>
                
                <button
                  onClick={() => removeFromWatchlist(coin.id)}
                  style={{
                    padding: '4px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--muted-foreground)',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Coin Modal */}
      {isAddingCoin && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--background)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            border: '1px solid var(--border)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--foreground)',
                margin: 0
              }}>
                Add Cryptocurrency
              </h3>
              <button
                onClick={() => {
                  setIsAddingCoin(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  color: 'var(--muted-foreground)',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            <input
              type="text"
              placeholder="Search cryptocurrencies..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchCoins(e.target.value);
              }}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                marginBottom: '16px'
              }}
            />

            {searchResults.length > 0 && (
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {searchResults.map((coin) => (
                  <div
                    key={coin.id}
                    onClick={() => addToWatchlist(coin)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
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
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--foreground)'
                      }}>
                        {coin.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--muted-foreground)'
                      }}>
                        {coin.symbol.toUpperCase()}
                      </div>
                    </div>
                    <div style={{
                      marginLeft: 'auto',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--foreground)'
                    }}>
                      {formatPrice(coin.currentPrice)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
             color: 'var(--primary)',
             fontSize: '12px',
             fontWeight: '600'
           }}
         >
           <svg style={{ width: '20px', height: '20px', marginBottom: '2px', fill: 'var(--primary)' }} viewBox="0 0 24 24">
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
             color: 'var(--muted-foreground)',
             fontSize: '12px',
             fontWeight: '600'
           }}
         >
           <div style={{
             width: '20px',
             height: '20px',
             background: 'var(--muted-foreground)',
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
           Coins
         </a>
       </nav>
    </div>
  );
}