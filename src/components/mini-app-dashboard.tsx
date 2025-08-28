import React from "react";
import { useComposeCast } from '@coinbase/onchainkit/minikit';

// OnchainKit and wallet state
interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: string;
  tokens: Array<{
    symbol: string;
    balance: string;
    usdValue: number;
  }>;
}

interface IdentityData {
  ensName: string | null;
  avatar: string | null;
  displayName: string;
}

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
  // MiniKit Farcaster integration
  const { composeCast } = useComposeCast();

  // Add CSS animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const [watchlist, setWatchlist] = React.useState<WatchlistItem[]>([]);
  const [portfolio, setPortfolio] = React.useState<PortfolioItem[]>([]);
  const [totalPortfolioValue, setTotalPortfolioValue] = React.useState(0);
  const [portfolioChange24h, setPortfolioChange24h] = React.useState(0);
  const [isAddingCoin, setIsAddingCoin] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<Coin[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // OnchainKit wallet state
  const [walletState, setWalletState] = React.useState<WalletState>({
    address: null,
    isConnected: false,
    balance: '0',
    tokens: []
  });
  
  // Identity and loading states
  const [identityData, setIdentityData] = React.useState<IdentityData>({
    ensName: null,
    avatar: null,
    displayName: ''
  });
  const [isLoadingWallet, setIsLoadingWallet] = React.useState(false);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = React.useState(false);
  
  // Base theme colors
  const baseTheme = {
    primary: '#0052ff',
    primaryHover: '#0041cc',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    purple: '#8a63d2',
    background: 'var(--background)',
    card: 'var(--card)',
    cardForeground: 'var(--card-foreground)',
    foreground: 'var(--foreground)',
    muted: 'var(--muted)',
    mutedForeground: 'var(--muted-foreground)',
    border: 'var(--border)'
  };

  // Fetch ENS name and avatar
  const fetchIdentityData = async (address: string) => {
    try {
      // Try to resolve ENS name
      const ensResponse = await fetch(`https://api.ensideas.com/ens/resolve/${address}`);
      let ensName = null;
      let avatar = null;
      
      if (ensResponse.ok) {
        const ensData = await ensResponse.json();
        ensName = ensData.name;
        avatar = ensData.avatar;
      }
      
      // Fallback: Try Base name service or use address
      const displayName = ensName || `${address.slice(0, 6)}...${address.slice(-4)}`;
      
      setIdentityData({
        ensName,
        avatar,
        displayName
      });
    } catch (error) {
      console.error('Failed to fetch identity data:', error);
      setIdentityData({
        ensName: null,
        avatar: null,
        displayName: `${address.slice(0, 6)}...${address.slice(-4)}`
      });
    }
  };

  // Base ecosystem token contracts
  const baseTokens = {
    USDC: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
    DEGEN: { address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Eff918', decimals: 18 },
    AERO: { address: '0x940181a94A35A4569E4529A3CDfB74287c58C93F', decimals: 18 },
    BRETT: { address: '0x532f27101965dd16442E59d40670FaF5eBB142E4', decimals: 18 },
    TOSHI: { address: '0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4', decimals: 18 }
  };

  // Fetch ERC20 token balance
  const fetchTokenBalance = async (address: string, tokenAddress: string, decimals: number) => {
    try {
      const response = await fetch('https://mainnet.base.org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: tokenAddress,
            data: `0x70a08231000000000000000000000000${address.slice(2)}`
          }, 'latest'],
          id: 1
        })
      });
      
      const result = await response.json();
      const balance = BigInt(result.result || '0');
      return Number(balance) / Math.pow(10, decimals);
    } catch (error) {
      console.error(`Failed to fetch token balance:`, error);
      return 0;
    }
  };

  // Fetch real wallet balances from Base chain
  const fetchWalletBalances = async (address: string) => {
    setIsLoadingWallet(true);
    setIsLoadingPortfolio(true);
    
    try {
      // Fetch identity data in parallel
      fetchIdentityData(address);
      
      // Get ETH balance using Base RPC
      const ethBalance = await fetch('https://mainnet.base.org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1
        })
      });
      
      const ethResult = await ethBalance.json();
      const ethBalanceWei = BigInt(ethResult.result || '0');
      const ethBalanceEth = Number(ethBalanceWei) / 1e18;
      
      // Get current prices for all tokens
      const priceResponse = await fetch('/api/cryptocurrencies?ids=ethereum,usd-coin,degen-base,aerodrome-finance,brett,toshi&per_page=10');
      const priceData = await priceResponse.json();
      
      const prices = {
        ETH: parseFloat(priceData.find(p => p.id === 'ethereum')?.currentPrice || '0'),
        USDC: parseFloat(priceData.find(p => p.id === 'usd-coin')?.currentPrice || '1'),
        DEGEN: parseFloat(priceData.find(p => p.id === 'degen-base')?.currentPrice || '0'),
        AERO: parseFloat(priceData.find(p => p.id === 'aerodrome-finance')?.currentPrice || '0'),
        BRETT: parseFloat(priceData.find(p => p.id === 'brett')?.currentPrice || '0'),
        TOSHI: parseFloat(priceData.find(p => p.id === 'toshi')?.currentPrice || '0')
      };
      
      // Fetch all token balances in parallel
      const tokenBalancePromises = Object.entries(baseTokens).map(async ([symbol, token]) => {
        const balance = await fetchTokenBalance(address, token.address, token.decimals);
        return {
          symbol,
          balance: balance.toFixed(symbol === 'USDC' ? 2 : 4),
          usdValue: balance * (prices[symbol as keyof typeof prices] || 0),
          rawBalance: balance
        };
      });
      
      const tokenBalances = await Promise.all(tokenBalancePromises);
      
      // Add ETH to tokens list
      const tokens = [
        {
          symbol: 'ETH',
          balance: ethBalanceEth.toFixed(4),
          usdValue: ethBalanceEth * prices.ETH,
          rawBalance: ethBalanceEth
        },
        ...tokenBalances.filter(token => token.rawBalance > 0) // Only show tokens with balance
      ];
      
      const totalValue = tokens.reduce((sum, token) => sum + token.usdValue, 0);
      const yesterday24hValue = totalValue * 0.98; // Mock 24h change for demo
      const change24h = totalValue - yesterday24hValue;
      
      setWalletState({
        address,
        isConnected: true,
        balance: ethBalanceEth.toFixed(4),
        tokens
      });
      
      setTotalPortfolioValue(totalValue);
      setPortfolioChange24h(change24h);
      
    } catch (error) {
      console.error('Failed to fetch wallet balances:', error);
    } finally {
      setIsLoadingWallet(false);
      setIsLoadingPortfolio(false);
    }
  };

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
            <div style={{
              padding: '20px',
              backgroundColor: 'var(--muted)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              textAlign: 'center'
            }}>
              <button 
                onClick={async () => {
                  try {
                    if (window.ethereum) {
                      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                      console.log('✅ Wallet Connected:', accounts[0]);
                      await fetchWalletBalances(accounts[0]);
                    } else {
                      window.open('https://wallet.coinbase.com/', '_blank');
                    }
                  } catch (error) {
                    console.error('Wallet connection failed:', error);
                  }
                }}
                disabled={isLoadingWallet}
                style={{
                  padding: '16px',
                  backgroundColor: isLoadingWallet ? baseTheme.mutedForeground : baseTheme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: isLoadingWallet ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                  fontSize: '16px',
                  width: '100%',
                  opacity: isLoadingWallet ? 0.7 : 1
                }}
              >
                {isLoadingWallet ? (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  // Professional Coinbase Wallet SVG Icon
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="12" fill="white"/>
                    <path 
                      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 16c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" 
                      fill="#0052ff"
                    />
                    <rect 
                      x="9" 
                      y="9" 
                      width="6" 
                      height="6" 
                      rx="1" 
                      fill="#0052ff"
                    />
                  </svg>
                )}
                {isLoadingWallet ? 'Connecting...' : 'Connect Coinbase Wallet'}
              </button>
              <p style={{ 
                color: 'var(--muted-foreground)', 
                margin: 0,
                fontSize: '14px'
              }}>
                Total Value: <strong style={{ color: 'var(--foreground)', fontSize: '18px' }}>
                  ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </p>
              {walletState.isConnected && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '8px',
                    padding: '8px',
                    backgroundColor: 'var(--card)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}>
                    {identityData.avatar ? (
                      <img 
                        src={identityData.avatar} 
                        alt="Avatar"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: baseTheme.primary,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {walletState.address?.slice(2, 4).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--foreground)' }}>
                        {identityData.ensName || identityData.displayName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                        {walletState.balance} ETH
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      try {
                        const shareText = `🚀 My Base portfolio: $${totalPortfolioValue.toFixed(2)} 📊\n\nBuilding on @base with real on-chain data! 💙\n\nTrack yours at BasedHub ⚡`;
                        
                        composeCast({
                          text: shareText,
                          embeds: [window.location.href]
                        });
                      } catch (error) {
                        console.error('Farcaster share failed:', error);
                        // Fallback to clipboard
                        const shareText = `🚀 My Base portfolio: $${totalPortfolioValue.toFixed(2)} 📊\n\nBuilding on @base with real on-chain data! 💙\n\nTrack yours at BasedHub ⚡`;
                        navigator.clipboard?.writeText(shareText + '\n' + window.location.href);
                        alert('📋 Copied to clipboard! Share on Farcaster.');
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#8a63d2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    📢 Share on Farcaster
                  </button>
                </div>
              )}
            </div>
          </div>
        
        <div style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          {isLoadingPortfolio ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--muted)',
                borderTop: '3px solid #0052ff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }} />
              <div style={{ color: 'var(--muted-foreground)' }}>Loading portfolio...</div>
            </div>
          ) : (
            <>
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
                alignItems: 'center',
                marginBottom: walletState.isConnected && walletState.tokens.length > 0 ? '20px' : '0'
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

              {/* Portfolio Analytics */}
              {walletState.isConnected && walletState.tokens.length > 0 && (
                <div>
                  <h4 style={{ 
                    margin: '0 0 12px 0', 
                    color: 'var(--foreground)',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    🔍 Portfolio Breakdown
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {walletState.tokens.map((token, index) => {
                      const percentage = totalPortfolioValue > 0 ? (token.usdValue / totalPortfolioValue) * 100 : 0;
                      const colors = ['#0052ff', '#22c55e', '#8a63d2', '#f59e0b', '#ef4444', '#06d6a0'];
                      const color = colors[index % colors.length];
                      
                      // Token icons
                      const tokenIcons = {
                        ETH: '🔷',
                        USDC: '💵',
                        DEGEN: '🎩',
                        AERO: '💨',
                        BRETT: '🟢',
                        TOSHI: '🟡'
                      };
                      
                      return (
                        <div key={token.symbol} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px',
                          backgroundColor: 'var(--muted)',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          transition: 'all 0.2s ease'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              backgroundColor: color,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px'
                            }}>
                              {tokenIcons[token.symbol as keyof typeof tokenIcons] || '💎'}
                            </div>
                            <div>
                              <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)' }}>
                                {token.symbol}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                                {token.balance} {token.symbol}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)' }}>
                              ${token.usdValue.toFixed(2)}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                              {percentage.toFixed(1)}% of portfolio
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Visual Portfolio Chart */}
                  <div style={{
                    display: 'flex',
                    height: '12px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    backgroundColor: 'var(--muted)',
                    border: '1px solid var(--border)'
                  }}>
                    {walletState.tokens.map((token, index) => {
                      const percentage = totalPortfolioValue > 0 ? (token.usdValue / totalPortfolioValue) * 100 : 0;
                      const colors = ['#0052ff', '#22c55e', '#8a63d2', '#f59e0b'];
                      const color = colors[index % colors.length];
                      
                      return (
                        <div
                          key={token.symbol}
                          style={{
                            flex: `0 0 ${percentage}%`,
                            backgroundColor: color,
                            height: '100%'
                          }}
                          title={`${token.symbol}: ${percentage.toFixed(1)}%`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
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