import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { MiniKitProvider } from "@/providers/MiniKitProvider";
import { NewsAggregator } from "@/pages/news-aggregator";
import { Coins } from "@/pages/coins";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="base" storageKey="basedhub-theme">
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
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
