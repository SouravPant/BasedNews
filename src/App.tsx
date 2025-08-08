import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MiniKitProvider } from "@/providers/MiniKitProvider";
import { NewsAggregator } from "@/pages/news-aggregator";
import { Coins } from "@/pages/coins";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <div className="light">
      <QueryClientProvider client={queryClient}>
        <MiniKitProvider>
          <TooltipProvider>
            <Toaster />
            <Switch>
              <Route path="/" component={NewsAggregator} />
              <Route path="/coins" component={Coins} />
              <Route component={NotFound} />
            </Switch>
          </TooltipProvider>
        </MiniKitProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
