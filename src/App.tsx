import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MiniKitProvider, useMiniKitContext } from "@/providers/MiniKitProvider";
import { NewsAggregator } from "@/pages/news-aggregator";
import { Coins } from "@/pages/coins";
import NotFound from "@/pages/not-found";
import { ErrorBoundary } from "./components/error-boundary";
import { FarcasterLoadingScreen } from "./components/FarcasterLoadingScreen";
import { useEffect, useState } from "react";
import { initializeFarcasterSDK, forceReadyCall } from "./utils/farcaster-sdk";

function AppContent() {
  const { isFrameReady, isInBaseApp } = useMiniKitContext();
  const [showContent, setShowContent] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    // Debug iframe context
    const isInIframe = window !== window.parent;
    const userAgent = navigator.userAgent;
    const referrer = document.referrer;
    
    const debug = {
      isInIframe,
      isInBaseApp,
      userAgent: userAgent.substring(0, 100),
      referrer: referrer.substring(0, 100),
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
    
    console.log('🔵 Based News Debug Info:', debug);
    setDebugInfo(JSON.stringify(debug, null, 2));
    
    // Initialize SDK immediately
    initializeFarcasterSDK();
    
    // If we're not in a Farcaster environment, show content immediately
    if (!isInBaseApp) {
      setShowContent(true);
      // Force ready call for safety
      forceReadyCall();
      return;
    }

    // If we're in Farcaster, wait for frame to be ready
    if (isFrameReady) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowContent(true);
        // Force ready call when content is shown
        forceReadyCall();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isFrameReady, isInBaseApp]);

  // Additional aggressive ready calls when content is shown
  useEffect(() => {
    if (showContent) {
      // Multiple ready calls with different timings
      initializeFarcasterSDK();
      setTimeout(() => initializeFarcasterSDK(), 100);
      setTimeout(() => initializeFarcasterSDK(), 500);
      setTimeout(() => initializeFarcasterSDK(), 1000);
      setTimeout(() => initializeFarcasterSDK(), 2000);
      setTimeout(() => forceReadyCall(), 3000);
    }
  }, [showContent]);

  console.log('🔵 Based News App State:', { 
    isInBaseApp, 
    isFrameReady, 
    showContent 
  });

  // Show loading screen while initializing in Farcaster environment
  if (!showContent) {
    return (
      <div>
        <FarcasterLoadingScreen />
        {/* Debug info for troubleshooting */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            position: 'fixed', 
            bottom: '10px', 
            left: '10px', 
            background: 'rgba(0,0,0,0.8)', 
            color: 'white', 
            padding: '10px', 
            fontSize: '10px',
            maxWidth: '300px',
            zIndex: 9999
          }}>
            <pre>{debugInfo}</pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="light" style={{ minHeight: '100vh', background: 'var(--background, #ffffff)' }}>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Switch>
            <Route path="/" component={NewsAggregator} />
            <Route path="/coins" component={Coins} />
            <Route component={NotFound} />
          </Switch>
        </ErrorBoundary>
      </TooltipProvider>
    </div>
  );
}

function App() {
  // Initialize SDK on app mount with multiple attempts
  useEffect(() => {
    console.log('🔵 Based News: App mounted, initializing Farcaster SDK...');
    
    // Log environment info
    console.log('🔵 Environment:', {
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      isIframe: window !== window.parent,
      url: window.location.href
    });
    
    initializeFarcasterSDK();
    
    // Additional calls at different intervals
    setTimeout(() => initializeFarcasterSDK(), 500);
    setTimeout(() => initializeFarcasterSDK(), 1500);
    setTimeout(() => forceReadyCall(), 3000);
    
    // Set up interval for persistent attempts
    const persistentInterval = setInterval(() => {
      initializeFarcasterSDK();
    }, 2000);
    
    // Clear after 30 seconds
    setTimeout(() => clearInterval(persistentInterval), 30000);
    
    return () => clearInterval(persistentInterval);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MiniKitProvider>
          <AppContent />
        </MiniKitProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
