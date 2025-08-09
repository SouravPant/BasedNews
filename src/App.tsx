import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MiniKitProvider } from "@/providers/MiniKitProvider";
import { NewsAggregator } from "@/pages/news-aggregator";
import { Coins } from "@/pages/coins";
import NotFound from "@/pages/not-found";
import { ErrorBoundary } from "./components/error-boundary";
import { MiniAppDashboard } from "./components/mini-app-dashboard";

function App() {
  return (
    <ErrorBoundary>
      <div className="light" style={{ minHeight: '100vh', background: 'var(--background, #ffffff)' }}>
        <QueryClientProvider client={queryClient}>
          <MiniKitProvider>
            <TooltipProvider>
              <ErrorBoundary>
                <Toaster />
                <Switch>
                  <Route path="/" component={NewsAggregator} />
                  <Route path="/coins" component={Coins} />
                  <Route path="/dashboard" component={MiniAppDashboard} />
                  <Route component={NotFound} />
                </Switch>
              </ErrorBoundary>
            </TooltipProvider>
          </MiniKitProvider>
        </QueryClientProvider>
      </div>
    </ErrorBoundary>
  );
}

export default App;
