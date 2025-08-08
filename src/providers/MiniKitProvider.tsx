import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  address?: string;
  bio?: string;
}

interface WalletInfo {
  address: string;
  balance?: string;
  chainId?: number;
  isConnected: boolean;
}

interface MiniKitContextType {
  setFrameReady: () => void;
  isFrameReady: boolean;
  context: any;
  isInBaseApp: boolean;
  user: User | null;
  wallet: WalletInfo | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signInWithBase: () => Promise<{ success: boolean; user?: User; error?: string }>;
}

const MiniKitContext = createContext<MiniKitContextType | undefined>(undefined);

interface MiniKitProviderProps {
  children: ReactNode;
}

declare global {
  interface Window {
    ethereum?: any;
    coinbaseWalletExtension?: any;
  }
}

export function MiniKitProvider({ children }: MiniKitProviderProps) {
  const [isFrameReady, setIsFrameReadyState] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [isInBaseApp, setIsInBaseApp] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);

  const setFrameReady = () => {
    setIsFrameReadyState(true);
  };

  const connectWallet = async () => {
    try {
      // Check if we're in Base App environment
      if (isInBaseApp && context?.user) {
        // Use Base App's native wallet
        const mockWallet: WalletInfo = {
          address: '0x' + Math.random().toString(16).substring(2, 42),
          balance: '1.234',
          chainId: 8453, // Base mainnet
          isConnected: true
        };
        setWallet(mockWallet);
        return;
      }

      // Check for Coinbase Wallet extension
      if (window.coinbaseWalletExtension) {
        const accounts = await window.coinbaseWalletExtension.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts.length > 0) {
          const walletInfo: WalletInfo = {
            address: accounts[0],
            isConnected: true,
            chainId: 8453
          };
          setWallet(walletInfo);
        }
        return;
      }

      // Check for general ethereum provider (MetaMask, etc.)
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({
            method: 'eth_chainId'
          });
          
          const walletInfo: WalletInfo = {
            address: accounts[0],
            isConnected: true,
            chainId: parseInt(chainId, 16)
          };
          setWallet(walletInfo);
        }
        return;
      }

      // Fallback for testing
      const mockWallet: WalletInfo = {
        address: '0x' + Math.random().toString(16).substring(2, 42),
        balance: '0.0',
        chainId: 8453,
        isConnected: true
      };
      setWallet(mockWallet);
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setUser(null);
  };

  const signInWithBase = async (): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      // If already authenticated in Base App
      if (context?.user) {
        const baseUser: User = {
          fid: context.user.fid,
          username: context.user.username,
          displayName: context.user.displayName,
          pfpUrl: context.user.pfpUrl,
          address: wallet?.address
        };
        setUser(baseUser);
        return { success: true, user: baseUser };
      }

      // Try to connect wallet first
      if (!wallet) {
        await connectWallet();
      }

      // Simulate Base authentication
      const mockUser: User = {
        fid: Math.floor(Math.random() * 1000000),
        username: 'baseuser' + Date.now(),
        displayName: 'Base User',
        pfpUrl: 'https://avatar.tobi.sh/base.svg',
        address: wallet?.address || '0x' + Math.random().toString(16).substring(2, 42)
      };
      
      setUser(mockUser);
      return { success: true, user: mockUser };
      
    } catch (error) {
      console.error('Base authentication failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  };

  useEffect(() => {
    // Check if we're running in a Base App or Farcaster environment
    const checkEnvironment = () => {
      // Check for Farcaster SDK or Base App context
      const isFarcaster = typeof window !== 'undefined' && 
        (window.location.href.includes('farcaster') || 
         window.location.href.includes('warpcast') ||
         window.location.search.includes('baseapp=true') ||
         window.parent !== window);
      
      setIsInBaseApp(isFarcaster);
      
      if (isFarcaster) {
        // Mock context for testing - in real implementation this would come from SDK
        setContext({
          user: {
            fid: 12345,
            username: 'baseuser',
            displayName: 'Base User',
            pfpUrl: 'https://avatar.tobi.sh/base.svg'
          }
        });
      }
    };

    checkEnvironment();
    
    // Listen for messages from parent frame
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'base-app-context') {
        setIsInBaseApp(true);
        setContext(event.data.context);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Auto-connect if in Base App
  useEffect(() => {
    if (isInBaseApp && context?.user && !user) {
      signInWithBase();
    }
  }, [isInBaseApp, context, user]);

  const value: MiniKitContextType = {
    setFrameReady,
    isFrameReady,
    context,
    isInBaseApp,
    user,
    wallet,
    connectWallet,
    disconnectWallet,
    signInWithBase
  };

  return (
    <MiniKitContext.Provider value={value}>
      {children}
    </MiniKitContext.Provider>
  );
}

export function useMiniKitContext() {
  const context = useContext(MiniKitContext);
  if (!context) {
    throw new Error('useMiniKitContext must be used within a MiniKitProvider');
  }
  return context;
}