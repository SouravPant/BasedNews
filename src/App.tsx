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

// Farcaster SDK ready function
function callFarcasterReady() {
  try {
    // Try postMessage communication
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'ready' }, '*');
      window.parent.postMessage({ type: 'frame-ready' }, '*');
      window.parent.postMessage({ type: 'miniapp-ready' }, '*');
      console.log('✅ Based News App: Ready messages sent via postMessage');
    }
    
    // Try SDK methods
    if (window.sdk?.actions?.ready) {
      window.sdk.actions.ready();
      console.log('✅ Based News App: sdk.actions.ready() called');
    }
    
    // Try MiniKit
    if (window.MiniKit?.ready) {
      window.MiniKit.ready();
      console.log('✅ Based News App: MiniKit.ready() called');
    }
  } catch (error) {
    console.log('⚠️ Based News App: Ready call error:', error);
  }
}

function AppContent() {
  const { isFrameReady, isInBaseApp } = useMiniKitContext();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // If we're not in a Farcaster environment, show content immediately
    if (!isInBaseApp) {
      setShowContent(true);
      // Call ready anyway for safety
      callFarcasterReady();
      return;
    }

    // If we're in Farcaster, wait for frame to be ready
    if (isFrameReady) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowContent(true);
        // Call ready when content is shown
        callFarcasterReady();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFrameReady, isInBaseApp]);

  // Additional ready calls when content is shown
  useEffect(() => {
    if (showContent) {
      // Call ready multiple times with delays
      callFarcasterReady();
      setTimeout(callFarcasterReady, 100);
      setTimeout(callFarcasterReady, 500);
      setTimeout(callFarcasterReady, 1000);
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
  // Call ready on app mount
  useEffect(() => {
    callFarcasterReady();
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
