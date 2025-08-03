import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface ApiStatus {
  coingecko: string;
  cryptopanic: string;
  reddit: string;
  lastUpdate: string;
}

export function StatusBar() {
  const [currentTime, setCurrentTime] = useState<string>("");

  const { data: apiStatus } = useQuery<ApiStatus>({
    queryKey: ["/api/status"],
    refetchInterval: 60000,
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    return status === 'connected' ? 'bg-green-500' : 'bg-red-500';
  };

  return (
    <footer className="bg-based-surface border-t border-border mt-12">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(apiStatus?.coingecko || 'connected')}`}></div>
              <span className="text-muted-foreground">CoinGecko API</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(apiStatus?.cryptopanic || 'connected')}`}></div>
              <span className="text-muted-foreground">CryptoPanic</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(apiStatus?.reddit || 'connected')}`}></div>
              <span className="text-muted-foreground">Reddit API</span>
            </div>
          </div>
          
          <div className="text-muted-foreground">
            <span>Data refreshes every 30 seconds • Last update: </span>
            <span>{currentTime}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
