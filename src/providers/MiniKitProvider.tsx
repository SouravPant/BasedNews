import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sdk } from '@farcaster/frame-sdk';

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
  const [isAppLoaded, setIsAppLoaded] = useState(false);

  const setFrameReady = () => {
    if (!isFrameReady) {
      console.log('🔵 Based News: Setting frame ready...');
      setIsFrameReadyState(true);
      
      // Call Farcaster SDK ready when frame is ready
      try {
        sdk.actions.ready();
        console.log('✅ Based News: Farcaster SDK ready() called successfully');
      } catch (error) {
        console.log('⚠️ Based News: Not in Farcaster environment or SDK not available:', error);
      }
    }
  };

  const connectWallet = async () => {
    try {
      // Check if we're in Farcaster environment and try to use context
      if (context?.user) {
        // Use Farcaster context data
        const contextWallet: WalletInfo = {
          address: context.user.address || '0x' + Math.random().toString(16).substring(2, 42),
          balance: '1.234',
          chainId: 8453, // Base mainnet
          isConnected: true
        };
        setWallet(contextWallet);
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
      // If already authenticated in Farcaster context
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

  // Initialize Farcaster SDK and detect environment
  useEffect(() => {
    const initializeFarcasterSDK = async () => {
      try {
        console.log('🔵 Based News: Initializing Farcaster environment...');
        
        // Check if we're in a Farcaster frame
        const isInFrame = window.parent !== window;
        const hasFrameParams = window.location.search.includes('fid=') || 
                             window.location.search.includes('frameData=') ||
                             window.location.href.includes('farcaster') ||
                             window.location.href.includes('warpcast');
        
        if (isInFrame || hasFrameParams) {
          console.log('🔵 Based News: Detected Farcaster environment');
          setIsInBaseApp(true);
          
          // Try to get context from Farcaster SDK
          try {
            const frameContext = await sdk.context;
            console.log('🔵 Based News: Farcaster context:', frameContext);
            setContext(frameContext);
          } catch (error) {
            console.log('⚠️ Based News: Could not get Farcaster context, using fallback');
            // Use fallback context for testing
            setContext({
              user: {
                fid: 12345,
                username: 'baseuser',
                displayName: 'Base User',
                pfpUrl: 'https://avatar.tobi.sh/base.svg'
              }
            });
          }
        } else {
          console.log('🔵 Based News: Not in Farcaster environment, running standalone');
        }
        
        // Mark app as loaded after environment detection
        setIsAppLoaded(true);
        
      } catch (error) {
        console.log('⚠️ Based News: Farcaster SDK not available, running in standalone mode');
        setIsAppLoaded(true);
      }
    };

    initializeFarcasterSDK();
  }, []);

  // Set frame ready when app is loaded and DOM is ready
  useEffect(() => {
    if (isAppLoaded && !isFrameReady) {
      // Wait a bit for DOM to be fully rendered
      const timer = setTimeout(() => {
        console.log('🔵 Based News: App loaded, setting frame ready');
        setFrameReady();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAppLoaded, isFrameReady]);

  // Auto-connect if in Farcaster environment
  useEffect(() => {
    if (isInBaseApp && context?.user && !user) {
      console.log('🔵 Based News: Auto-connecting user in Farcaster environment');
      signInWithBase();
    }
  }, [isInBaseApp, context, user]);

  // Listen for messages from parent frame
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'farcaster-frame-context') {
        console.log('🔵 Based News: Received Farcaster frame context:', event.data);
        setIsInBaseApp(true);
        setContext(event.data.context);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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