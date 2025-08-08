import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { BaseMiniAppHeader } from "./base-miniapp-header";
import { BaseSocialFeatures } from "./base-social-features";

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
      <header className="bg-based-surface border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Based Dashboard</h1>
                <p className="text-xs text-muted-foreground">Market Data & Analytics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <BaseSocialFeatures />
              
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-foreground">{formatLastUpdated(lastUpdated)}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
