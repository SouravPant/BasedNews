import { useEffect } from 'react';
import { useMiniKitContext } from '../providers/MiniKitProvider';

export function useMiniKit() {
  const { setFrameReady, isFrameReady, context, isInBaseApp, user } = useMiniKitContext();
  
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return {
    setFrameReady,
    isFrameReady,
    context,
    isInBaseApp,
    user
  };
}

export function useBaseAuth() {
  const { context, isInBaseApp } = useMiniKitContext();
  
  const signInWithBase = async () => {
    try {
      if (context?.user) {
        // User is already authenticated via Base App
        return {
          success: true,
          user: context.user,
          method: 'base_app'
        };
      }
      
      // In real implementation, this would trigger actual authentication
      // For now, simulate successful auth
      return {
        success: true,
        user: { username: 'demo_user' },
        method: 'fallback'
      };
    } catch (error) {
      console.error('Base authentication failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  };

  return {
    signInWithBase,
    isAuthenticated: !!context?.user || isInBaseApp,
    user: context?.user
  };
}

export function useBaseSocial() {
  const { isInBaseApp } = useMiniKitContext();
  
  const shareToFarcaster = (text: string, embeds?: string[]) => {
    if (!isInBaseApp) {
      // Fallback to traditional sharing
      if (navigator.share) {
        navigator.share({
          title: 'BasedHub',
          text,
          url: embeds?.[0] || window.location.href
        });
      } else {
        // Copy to clipboard or open in new window
        const url = embeds?.[0] || window.location.href;
        const shareText = `${text} ${url}`;
        navigator.clipboard?.writeText(shareText);
      }
      return;
    }
    
    // In real implementation, this would use the actual SDK
    console.log('Sharing to Farcaster:', { text, embeds });
  };
  
  const sharePortfolio = (performance: string) => {
    shareToFarcaster(
      `📈 My crypto portfolio performance: ${performance}! Check out BasedHub for real-time tracking. 🚀`,
      [window.location.origin]
    );
  };
  
  const shareNewsArticle = (title: string, url: string) => {
    shareToFarcaster(
      `📰 Interesting crypto news: ${title}`,
      [url]
    );
  };
  
  const shareWatchlist = (cryptos: string[]) => {
    shareToFarcaster(
      `👀 Watching these cryptos: ${cryptos.join(', ')}. Stay updated with BasedHub! 📊`,
      [window.location.origin]
    );
  };

  const viewProfile = (fid?: number) => {
    if (!isInBaseApp) {
      // Fallback - could open social profile in new tab
      return;
    }
    console.log('Viewing profile:', fid);
  };
  
  const openUrl = (url: string) => {
    if (!isInBaseApp) {
      window.open(url, '_blank');
      return;
    }
    // In real implementation, would use SDK
    console.log('Opening URL in Base App:', url);
    window.open(url, '_blank');
  };

  return {
    shareToFarcaster,
    sharePortfolio,
    shareNewsArticle,
    shareWatchlist,
    viewProfile,
    openUrl
  };
}

export function useBaseApp() {
  const { isInBaseApp } = useMiniKitContext();
  
  const addToBaseApp = async () => {
    try {
      if (!isInBaseApp) {
        // Fallback - could show instruction to visit in Base App
        return { success: false, error: 'Not in Base App environment' };
      }
      
      // In real implementation, would use actual SDK
      const mockResult = {
        url: `${window.location.origin}/api/notification`,
        token: 'mock_token_' + Date.now()
      };
      
      localStorage.setItem('baseapp_notification_url', mockResult.url);
      localStorage.setItem('baseapp_notification_token', mockResult.token);
      
      return {
        success: true,
        url: mockResult.url,
        token: mockResult.token
      };
    } catch (error) {
      console.error('Failed to add frame:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add frame' 
      };
    }
  };
  
  const sendPriceAlert = async (title: string, body: string) => {
    if (!isInBaseApp) {
      // Fallback to browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
      return;
    }
    
    // In real implementation, would use actual notification API
    try {
      const response = await fetch('/api/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body })
      });
      const result = await response.json();
      console.log('Notification sent:', result);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };
  
  const close = () => {
    if (!isInBaseApp) {
      // Fallback - could close current tab or show message
      if (window.parent !== window) {
        window.parent.postMessage('close', '*');
      }
      return;
    }
    // In real implementation, would use SDK close function
    console.log('Closing Base App frame');
  };

  return {
    addToBaseApp,
    sendPriceAlert,
    close
  };
}