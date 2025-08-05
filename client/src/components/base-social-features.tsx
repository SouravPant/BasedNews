import React from 'react';
import { Button } from "@/components/ui/button";
import { useBaseSocial, useMiniKit } from "@/hooks/useMiniKit";
import { Share2, User, MessageCircle } from "lucide-react";

interface BaseSocialFeaturesProps {
  className?: string;
}

export function BaseSocialFeatures({ className }: BaseSocialFeaturesProps) {
  const { isInBaseApp } = useMiniKit();
  const { shareToFarcaster, viewProfile } = useBaseSocial();

  if (!isInBaseApp) {
    return null; // Only show in Base App environment
  }

  const handleShareDashboard = () => {
    shareToFarcaster(
      "📊 Tracking my crypto portfolio with BasedHub! Real-time prices, news, and market insights all in one place. 🚀",
      [window.location.origin]
    );
  };

  const handleViewProfile = () => {
    viewProfile();
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleShareDashboard}
        className="flex items-center gap-1"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleViewProfile}
        className="flex items-center gap-1"
      >
        <User className="h-4 w-4" />
        Profile
      </Button>
    </div>
  );
}

interface ShareableItemProps {
  type: 'portfolio' | 'news' | 'watchlist' | 'alert';
  data: any;
  children: React.ReactNode;
}

export function ShareableItem({ type, data, children }: ShareableItemProps) {
  const { isInBaseApp } = useMiniKit();
  const { sharePortfolio, shareNewsArticle, shareWatchlist } = useBaseSocial();

  if (!isInBaseApp) {
    return <>{children}</>;
  }

  const handleShare = () => {
    switch (type) {
      case 'portfolio':
        sharePortfolio(data.performance);
        break;
      case 'news':
        shareNewsArticle(data.title, data.url);
        break;
      case 'watchlist':
        shareWatchlist(data.cryptos);
        break;
      default:
        break;
    }
  };

  return (
    <div className="group relative">
      {children}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
}