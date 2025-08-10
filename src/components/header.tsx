import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { BaseMiniAppHeader } from "./base-miniapp-header";
import { BaseSocialFeatures } from "./base-social-features";
import { Zap, Clock } from "lucide-react";

interface HeaderProps {
  lastUpdated?: string;
}

export function Header({ lastUpdated }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour12: true,
        timeZone: 'UTC',
        hour: 'numeric',
        minute: '2-digit'
      }) + ' UTC');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatLastUpdated = (timestamp?: string) => {
    if (!timestamp) return "Active";
    
    const now = new Date();
    const updated = new Date(timestamp);
    const diff = Math.floor((now.getTime() - updated.getTime()) / 1000);
    
    if (diff < 60) return "Active";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <>
      <BaseMiniAppHeader />
      <header className="bg-based-surface border-b border-border sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3"> {/* Reduced padding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center"> {/* Slightly smaller */}
                <Zap className="w-5 h-5 text-white" /> {/* Reduced icon size */}
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Based Dashboard</h1> {/* Smaller title */}
                <p className="text-xs text-muted-foreground">Market Analytics</p> {/* Shorter subtitle */}
              </div>
            </div>
            
            <div className="flex items-center space-x-3"> {/* Reduced spacing */}
              <BaseSocialFeatures />
              
              <div className="hidden sm:flex items-center space-x-2 text-sm"> {/* Hide on mobile */}
                <span className="text-foreground">{formatLastUpdated(lastUpdated)}</span>
              </div>
              
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground"> {/* Hide on mobile */}
                <Clock className="w-4 h-4" />
                <span>{currentTime}</span>
              </div>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
