import { useEffect } from 'react';
import { useMiniKitContext } from '../providers/MiniKitProvider';
import { sdk } from '@farcaster/miniapp-sdk';

export function useMiniKit() {
  const { 
    setFrameReady, 
    isFrameReady, 
    context, 
    isInBaseApp, 
    user, 
    wallet, 
    connectWallet, 
    disconnectWallet,
    signInWithBase 
  } = useMiniKitContext();
  
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
    user,
    wallet,
    connectWallet,
    disconnectWallet,
    signInWithBase
  };
}

export function useBaseAuth() {
  const { context, isInBaseApp, user, signInWithBase: signIn } = useMiniKitContext();
  
  return {
    signInWithBase: signIn,
    isAuthenticated: !!user,
    user
  };
}

export function useWallet() {
  const { wallet, connectWallet, disconnectWallet } = useMiniKitContext();
  
  return {
    wallet,
    connectWallet,
    disconnectWallet,
    isConnected: !!wallet?.isConnected
  };
}

export function useBaseSocial() {
  const { isInBaseApp } = useMiniKitContext();
  
  const shareToFarcaster = async (text: string, embeds?: string[]) => {
    // 1. Try Farcaster SDK composeCast (works in Base app and Farcaster clients)
    try {
      console.log('🎯 Using Farcaster SDK in shareToFarcaster');
      const result = await sdk.actions.composeCast({
        text,
        embeds: embeds || [window.location.href]
      });
      console.log('✅ SDK composeCast result:', result);
      
      if (result?.cast) {
        console.log('✅ Cast successful:', result.cast.hash);
        return { success: true, cast: result.cast };
      } else {
        console.log('ℹ️ User canceled the cast');
        return { success: false, canceled: true };
      }
    } catch (error) {
      console.error('❌ SDK composeCast failed:', error);
    }
    
    // 2. Fallback to traditional sharing
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BasedHub',
          text,
          url: embeds?.[0] || window.location.href
        });
        return { success: true, method: 'navigator.share' };
      } catch (shareError) {
        console.log('User canceled native share');
      }
    }
    
    // 3. Final fallback - clipboard
    const url = embeds?.[0] || window.location.href;
    const shareText = `${text} ${url}`;
    try {
      await navigator.clipboard?.writeText(shareText);
      return { success: true, method: 'clipboard' };
    } catch (clipboardError) {
      console.error('Failed to copy to clipboard:', clipboardError);
      return { success: false, error: 'All sharing methods failed' };
    }
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