import React from "react";

interface WalletConnectProps {
  onAccountChange?: (account: string | null) => void;
}

export function WalletConnect({ onAccountChange }: WalletConnectProps) {
  const [account, setAccount] = React.useState<string | null>(null);
  const [balance, setBalance] = React.useState<string | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showBenefits, setShowBenefits] = React.useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if MetaMask or other wallet is available
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (accounts.length > 0) {
          const connectedAccount = accounts[0];
          setAccount(connectedAccount);
          onAccountChange?.(connectedAccount);

          // Switch to Base network if needed
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x2105' }], // Base Mainnet (8453)
            });
          } catch (switchError: any) {
            // Network doesn't exist, add it
            if (switchError.code === 4902) {
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
            }
          }

          // Get balance
          const balanceWei = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [connectedAccount, 'latest'],
          });
          
          const balanceEth = parseInt(balanceWei, 16) / Math.pow(10, 18);
          setBalance(balanceEth.toFixed(4));
        }
      } else {
        setError('No Web3 wallet detected. Please install MetaMask or Coinbase Wallet.');
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance(null);
    setError(null);
    onAccountChange?.(null);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (account) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: '#0052ff',
        border: '2px solid #0066ff',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        color: '#ffffff',
        fontWeight: '600',
        fontSize: '14px',
        minWidth: '220px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#22c55e',
              borderRadius: '50%'
            }}></div>
            <span>Connected</span>
          </div>
          <button
            onClick={disconnectWallet}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '2px' }}>
            Address
          </div>
          <div style={{ fontFamily: 'monospace' }}>
            {formatAddress(account)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '2px' }}>
            Balance
          </div>
          <div style={{ fontWeight: '700' }}>
            {balance} ETH
          </div>
        </div>

        <div style={{
          marginTop: '12px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          fontSize: '12px',
          opacity: 0.8
        }}>
          🔵 Base Network
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      <div style={{ position: 'relative' }}>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          onMouseEnter={() => setShowBenefits(true)}
          onMouseLeave={() => setShowBenefits(false)}
          style={{
            backgroundColor: '#0052ff',
            border: '2px solid #0066ff',
            borderRadius: '12px',
            padding: '12px 20px',
            color: '#ffffff',
            cursor: isConnecting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease',
            opacity: isConnecting ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => {
            if (!isConnecting) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
            }
          }}
          onMouseOut={(e) => {
            if (!isConnecting) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }
          }}
        >
          {isConnecting ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid #ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Connecting...
            </>
          ) : (
            <>
              <span>🔗</span>
              Unlock Premium Features
            </>
          )}
        </button>

        {/* Benefits Tooltip */}
        {showBenefits && !account && (
          <div style={{
            position: 'absolute',
            top: '60px',
            right: '0',
            backgroundColor: '#1f2937',
            color: '#ffffff',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '14px',
            width: '280px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
            zIndex: 1002,
            border: '1px solid #374151'
          }}>
            <div style={{
              fontWeight: '600',
              marginBottom: '8px',
              color: '#60a5fa'
            }}>
              🚀 Premium Features
            </div>
            <ul style={{
              margin: 0,
              paddingLeft: '16px',
              fontSize: '13px',
              lineHeight: '1.5'
            }}>
              <li>💰 Track your crypto portfolio</li>
              <li>🔔 Personalized news alerts</li>
              <li>📊 Advanced market analytics</li>
              <li>⭐ Bookmark favorite articles</li>
              <li>🎯 Sentiment-based filters</li>
              <li>🔵 Base ecosystem rewards</li>
            </ul>
            <div style={{
              marginTop: '12px',
              padding: '8px',
              backgroundColor: '#374151',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#d1d5db'
            }}>
              Connect your wallet to unlock these features and more!
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '0',
          backgroundColor: '#dc2626',
          color: '#ffffff',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          maxWidth: '250px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1001
        }}>
          {error}
        </div>
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