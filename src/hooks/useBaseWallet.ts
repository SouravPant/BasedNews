import { useState, useEffect } from 'react';

interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

interface BaseWalletHook {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToBase: () => Promise<void>;
}

const BASE_MAINNET_CHAIN_ID = 8453;
const BASE_TESTNET_CHAIN_ID = 84532;

const BASE_MAINNET_CONFIG = {
  chainId: `0x${BASE_MAINNET_CHAIN_ID.toString(16)}`,
  chainName: 'Base Mainnet',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org'],
};

export function useBaseWallet(): BaseWalletHook {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  // Check if already connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWallet(prev => ({
            ...prev,
            address: accounts[0],
            isConnected: true,
            error: null,
          }));
        }
      };

      const handleChainChanged = (chainId: string) => {
        setWallet(prev => ({
          ...prev,
          chainId: parseInt(chainId, 16),
        }));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const checkConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (accounts.length > 0) {
          setWallet({
            address: accounts[0],
            chainId: parseInt(chainId, 16),
            isConnected: true,
            isConnecting: false,
            error: null,
          });
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async (): Promise<void> => {
    if (typeof window === 'undefined') {
      throw new Error('Window is not defined');
    }

    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Check if MetaMask or Coinbase Wallet is installed
      if (!window.ethereum) {
        throw new Error('No wallet found. Please install MetaMask, Coinbase Wallet, or use a Web3 browser.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      // Get current chain ID
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      const numericChainId = parseInt(chainId, 16);

      setWallet({
        address: accounts[0],
        chainId: numericChainId,
        isConnected: true,
        isConnecting: false,
        error: null,
      });

      // Auto-switch to Base if not already on it
      if (numericChainId !== BASE_MAINNET_CHAIN_ID && numericChainId !== BASE_TESTNET_CHAIN_ID) {
        try {
          await switchToBase();
        } catch (switchError) {
          console.warn('Could not auto-switch to Base network:', switchError);
          // Don't throw here, as the wallet is still connected
        }
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect wallet';
      setWallet(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  };

  const disconnectWallet = (): void => {
    setWallet({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  };

  const switchToBase = async (): Promise<void> => {
    if (!window.ethereum) {
      throw new Error('No wallet found');
    }

    try {
      // Try to switch to Base Mainnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_MAINNET_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BASE_MAINNET_CONFIG],
          });
        } catch (addError) {
          throw new Error('Failed to add Base network to wallet');
        }
      } else {
        throw new Error('Failed to switch to Base network');
      }
    }
  };

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    switchToBase,
  };
}

// Declare global window.ethereum type
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
    };
  }
}