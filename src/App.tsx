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

  useEffect(() => {
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
    return <FarcasterLoadingScreen />;
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
