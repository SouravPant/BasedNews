import { useState, useEffect } from 'react';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

const APP_NAME = 'Crypto News Aggregator';
const APP_LOGO_URL = 'https://via.placeholder.com/64';

interface CoinbaseWalletProps {
  onAccountChange?: (account: string | null) => void;
}

export function CoinbaseWallet({ onAccountChange }: CoinbaseWalletProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Initialize Coinbase Wallet SDK
    const coinbaseWallet = new CoinbaseWalletSDK({
      appName: APP_NAME,
      appLogoUrl: APP_LOGO_URL
    });

    const ethereum = coinbaseWallet.makeWeb3Provider();
    setProvider(ethereum);

    // Check if already connected (only if user has previously authorized)
    // Skip initial check to avoid "Must call 'eth_requestAccounts'" error

    // Listen for account changes
    ethereum.on('accountsChanged', (result: unknown) => {
      const accounts = result as string[];
      const newAccount = accounts.length > 0 ? accounts[0] : null;
      setAccount(newAccount);
      onAccountChange?.(newAccount);
    });

    return () => {
      ethereum.removeAllListeners('accountsChanged');
    };
  }, [onAccountChange]);

  const connectWallet = async () => {
    if (!provider) return;

    setIsConnecting(true);
    try {
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        onAccountChange?.(accounts[0]);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    onAccountChange?.(null);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (account) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-sm">
          {formatAddress(account)}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={disconnectWallet}
          className="text-red-600 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      <Wallet className="h-4 w-4 mr-2" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}