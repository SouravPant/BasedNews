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

function AppContent() {
  const { isFrameReady, isInBaseApp } = useMiniKitContext();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // If we're not in a Farcaster environment, show content immediately
    if (!isInBaseApp) {
      setShowContent(true);
      return;
    }

    // If we're in Farcaster, wait for frame to be ready
    if (isFrameReady) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFrameReady, isInBaseApp]);

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
