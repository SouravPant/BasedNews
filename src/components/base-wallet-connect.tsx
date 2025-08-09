import React from "react";
import { Address, Avatar, Name, Identity } from '@coinbase/onchainkit/identity';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

interface WalletConnectProps {
  showInPortfolio?: boolean;
}

export function BaseWalletConnect({ showInPortfolio = false }: WalletConnectProps) {
  const [account, setAccount] = React.useState<string | null>(null);
  const [balance, setBalance] = React.useState<string | null>(null);
  const [portfolioValue, setPortfolioValue] = React.useState<string | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [walletType, setWalletType] = React.useState<'metamask' | 'coinbase' | 'smart-wallet' | 'farcaster' | null>(null);
  const [showOptions, setShowOptions] = React.useState(false);

  // Check for existing connection on mount
  React.useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await fetchBalance(accounts[0]);
          await fetchPortfolioValue(accounts[0]);
          
          // Detect wallet type
          if (window.ethereum.isMetaMask) {
            setWalletType('metamask');
          } else if (window.ethereum.isCoinbaseWallet) {
            setWalletType('coinbase');
          }
        }
      } catch (error) {
        console.log('No existing connection found');
      }
    }
  };

  const fetchBalance = async (address: string) => {
    try {
      if (window.ethereum) {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        // Convert from wei to ETH
        const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
        setBalance(ethBalance.toFixed(4));
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchPortfolioValue = async (address: string) => {
    try {
      console.log('🔍 Fetching portfolio for:', address);
      
      if (window.ethereum) {
        const ethBalance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        
        const ethValue = parseInt(ethBalance, 16) / Math.pow(10, 18);
        
        // Mock portfolio calculation for demo
        // In production, fetch real token balances from Base network
        const mockTokenValue = Math.random() * 1000;
        const totalValue = (ethValue * 3400) + mockTokenValue; // ETH price * amount + tokens
        
        setPortfolioValue(totalValue.toFixed(2));
        console.log('💰 Portfolio value:', totalValue.toFixed(2));
      }
    } catch (error) {
      console.error('Error fetching portfolio value:', error);
      setPortfolioValue('0.00');
    }
  };

  const switchToBase = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }], // Base Mainnet
      });
    } catch (switchError: any) {
      // If Base network is not added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2105',
              chainName: 'Base',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org'],
            }],
          });
        } catch (addError) {
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  };

  // Connect with MetaMask/Injected Wallet
  const connectMetaMask = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask or another Web3 wallet');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        await switchToBase();
        setAccount(accounts[0]);
        setWalletType('metamask');
        await fetchBalance(accounts[0]);
        await fetchPortfolioValue(accounts[0]);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
      setShowOptions(false);
    }
  };

  // Connect with Coinbase Wallet
  const connectCoinbaseWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // For Coinbase Wallet, try the specific connection method
      if (window.ethereum?.isCoinbaseWallet) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts.length > 0) {
          await switchToBase();
          setAccount(accounts[0]);
          setWalletType('coinbase');
          await fetchBalance(accounts[0]);
          await fetchPortfolioValue(accounts[0]);
        }
      } else {
        // Redirect to Coinbase Wallet if not installed
        window.open('https://wallet.coinbase.com/', '_blank');
        throw new Error('Please install Coinbase Wallet');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect Coinbase Wallet');
    } finally {
      setIsConnecting(false);
      setShowOptions(false);
    }
  };

  // Connect with Base Smart Wallet (OnchainKit integration)
  const connectSmartWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // This would integrate with OnchainKit for smart wallet
      // For now, we'll use a placeholder implementation
      const demoAddress = '0x' + Math.random().toString(16).substring(2, 42);
      setAccount(demoAddress);
      setWalletType('smart-wallet');
      setBalance('0.0000');
      
      // In a real implementation, this would use:
      // import { useAccount, useConnect } from '@coinbase/onchainkit'
      console.log('Smart wallet connection would be implemented with OnchainKit');
    } catch (error: any) {
      setError(error.message || 'Failed to connect Smart Wallet');
    } finally {
      setIsConnecting(false);
      setShowOptions(false);
    }
  };

  // Connect with Farcaster (MiniKit integration)
  const connectFarcaster = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // This would integrate with Farcaster's MiniKit
      // For now, we'll use a placeholder implementation
      const demoAddress = '0x' + Math.random().toString(16).substring(2, 42);
      setAccount(demoAddress);
      setWalletType('farcaster');
      setBalance('0.0000');
      
      // In a real implementation, this would use Farcaster's SDK
      console.log('Farcaster connection would be implemented with MiniKit');
    } catch (error: any) {
      setError(error.message || 'Failed to connect via Farcaster');
    } finally {
      setIsConnecting(false);
      setShowOptions(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance(null);
    setWalletType(null);
    setError(null);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'metamask': return '🦊';
      case 'coinbase': return '🔵';
      case 'smart-wallet': return '⚡';
      case 'farcaster': return '🎩';
      default: return '🔗';
    }
  };

  const getWalletName = (type: string) => {
    switch (type) {
      case 'metamask': return 'MetaMask';
      case 'coinbase': return 'Coinbase Wallet';
      case 'smart-wallet': return 'Base Smart Wallet';
      case 'farcaster': return 'Farcaster';
      default: return 'Wallet';
    }
  };

  // Connected wallet UI
  if (account) {
    return (
      <div style={{
        position: showInPortfolio ? 'relative' : 'fixed',
        top: showInPortfolio ? 'auto' : '20px',
        right: showInPortfolio ? 'auto' : '20px',
        zIndex: showInPortfolio ? 'auto' : 1000,
        fontFamily: '"Inter", system-ui, sans-serif'
      }}>
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: showInPortfolio ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)',
          backdropFilter: showInPortfolio ? 'none' : 'blur(20px)',
          WebkitBackdropFilter: showInPortfolio ? 'none' : 'blur(20px)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--base-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>
            {getWalletIcon(walletType || '')}
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--foreground)',
              marginBottom: '2px'
            }}>
              {formatAddress(account)}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--muted-foreground)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {showInPortfolio && portfolioValue ? (
                <span>Portfolio: ${portfolioValue}</span>
              ) : (
                <span>{balance} ETH</span>
              )}
              <span>•</span>
              <span style={{
                padding: '2px 6px',
                background: 'var(--base-blue)',
                color: 'white',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '600'
              }}>
                BASE
              </span>
            </div>
          </div>

          <button
            onClick={disconnectWallet}
            style={{
              padding: '6px',
              background: 'var(--secondary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'var(--secondary-foreground)',
              fontSize: '12px'
            }}
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  // Connection options UI
  return (
    <div style={{
      position: showInPortfolio ? 'relative' : 'fixed',
      top: showInPortfolio ? 'auto' : '20px',
      right: showInPortfolio ? 'auto' : '20px',
      zIndex: showInPortfolio ? 'auto' : 1000,
      fontFamily: '"Inter", system-ui, sans-serif'
    }}>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={isConnecting}
          className="base-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: 'var(--base-blue)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: showInPortfolio ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)',
            backdropFilter: showInPortfolio ? 'none' : 'blur(20px)',
            WebkitBackdropFilter: showInPortfolio ? 'none' : 'blur(20px)',
            transition: 'all 0.2s ease'
          }}
        >
          {isConnecting ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Connecting...
            </>
          ) : (
            <>
              <span>🔵</span>
              Connect Base Wallet
            </>
          )}
        </button>

        {/* Wallet Options Dropdown */}
        {showOptions && !isConnecting && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'var(--popover)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '8px',
            minWidth: '260px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 1001
          }}>
            <div style={{
              padding: '12px',
              borderBottom: '1px solid var(--border)',
              marginBottom: '8px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--foreground)',
                margin: '0 0 4px 0'
              }}>
                Choose Wallet
              </h3>
              <p style={{
                fontSize: '12px',
                color: 'var(--muted-foreground)',
                margin: 0
              }}>
                Connect to Base network for the best onchain experience
              </p>
            </div>

            {/* MetaMask Option */}
            <button
              onClick={connectMetaMask}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                marginBottom: '4px',
                fontFamily: '"Inter", system-ui, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#f6851b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                🦊
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: 'var(--foreground)' }}>
                  MetaMask
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                  Connect using MetaMask
                </div>
              </div>
            </button>

            {/* Coinbase Wallet Option */}
            <button
              onClick={connectCoinbaseWallet}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                marginBottom: '4px',
                fontFamily: '"Inter", system-ui, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--base-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                🔵
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: 'var(--foreground)' }}>
                  Coinbase Wallet
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                  Official Coinbase wallet
                </div>
              </div>
            </button>

            {/* Base Smart Wallet Option */}
            <button
              onClick={connectSmartWallet}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                marginBottom: '4px',
                fontFamily: '"Inter", system-ui, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--base-blue) 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                ⚡
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: 'var(--foreground)' }}>
                  Base Smart Wallet
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                  Gasless transactions (Coming Soon)
                </div>
              </div>
            </button>

            {/* Farcaster Option */}
            <button
              onClick={connectFarcaster}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                marginBottom: '4px',
                fontFamily: '"Inter", system-ui, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                🎩
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: 'var(--foreground)' }}>
                  Farcaster
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                  Connect via Farcaster (Coming Soon)
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          background: 'var(--destructive)',
          color: 'var(--destructive-foreground)',
          borderRadius: '8px',
          fontSize: '12px',
          maxWidth: '250px'
        }}>
          {error}
        </div>
      )}

      {/* Click outside to close */}
      {showOptions && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowOptions(false)}
        />
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}