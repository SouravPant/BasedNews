import React, { ReactNode, createContext, useContext, useState, useEffect } from 'react';

interface MiniKitContextType {
  isFrameReady: boolean;
  setFrameReady: () => Promise<void>;
  context: any;
  isInBaseApp: boolean;
  user: any;
}

const MiniKitContext = createContext<MiniKitContextType | undefined>(undefined);

interface MiniKitProviderProps {
  children: ReactNode;
}

export function MiniKitProvider({ children }: MiniKitProviderProps) {
  const [isFrameReady, setIsFrameReadyState] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [isInBaseApp, setIsInBaseApp] = useState(false);

  useEffect(() => {
    // Check if we're running in a Base App or Farcaster environment
    const checkEnvironment = () => {
      // Check for Farcaster SDK or Base App context
      const isFarcaster = typeof window !== 'undefined' && 
        (window.location.href.includes('farcaster') || 
         window.location.href.includes('warpcast') ||
         window.parent !== window);
      
      setIsInBaseApp(isFarcaster);
      
      if (isFarcaster) {
        // Mock context for now - in real implementation this would come from SDK
        setContext({
          user: {
            fid: 12345,
            username: 'baseuser',
            displayName: 'Base User',
            pfpUrl: 'https://example.com/pfp.png'
          }
        });
      }
    };

    checkEnvironment();
  }, []);

  const setFrameReady = async () => {
    setIsFrameReadyState(true);
    // In real implementation, this would call the actual SDK
    return Promise.resolve();
  };

  const value: MiniKitContextType = {
    isFrameReady,
    setFrameReady,
    context,
    isInBaseApp,
    user: context?.user
  };

  return (
    <MiniKitContext.Provider value={value}>
      {children}
    </MiniKitContext.Provider>
  );
}

export function useMiniKitContext() {
  const context = useContext(MiniKitContext);
  if (context === undefined) {
    throw new Error('useMiniKitContext must be used within a MiniKitProvider');
  }
  return context;
}