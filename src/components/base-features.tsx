import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Share2, 
  Bell, 
  Smartphone, 
  Globe, 
  Zap,
  Shield,
  TrendingUp,
  MessageCircle,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { useBaseSocial, useBaseApp } from '@/hooks/useMiniKit';

interface BaseFeaturesProps {
  userStats?: {
    watchlistCount: number;
    portfolioCount: number;
    alertsCount: number;
  };
}

export function BaseFeatures({ userStats }: BaseFeaturesProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const { 
    shareToFarcaster, 
    sharePortfolio, 
    shareWatchlist, 
    shareNewsArticle, 
    viewProfile, 
    openUrl 
  } = useBaseSocial();
  const { addToBaseApp, sendPriceAlert } = useBaseApp();

  const handleShareApp = () => {
    shareToFarcaster(
      "🚀 Just discovered BasedHub - the ultimate crypto tracker for Base ecosystem! Real-time prices, portfolio tracking, and Base-native tokens all in one place. 📊⚡",
      [window.location.origin]
    );
  };

  const handleAddToBaseApp = async () => {
    const result = await addToBaseApp();
    if (result.success) {
      console.log('Successfully added to Base App:', result);
    } else {
      console.error('Failed to add to Base App:', result.error);
    }
  };

  const copyAppUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const shareFeatures = [
    {
      icon: TrendingUp,
      title: "Share Portfolio Performance",
      description: "Share your crypto wins with the Farcaster community",
      action: () => sharePortfolio("🚀 +15.7% this week"),
      color: "text-green-500"
    },
    {
      icon: Users,
      title: "Share Watchlist",
      description: "Let others know what tokens you're watching",
      action: () => shareWatchlist(["ETH", "DEGEN", "BRETT", "AERO"]),
      color: "text-blue-500"
    },
    {
      icon: MessageCircle,
      title: "Share News",
      description: "Share interesting crypto news with your network",
      action: () => shareNewsArticle(
        "Base ecosystem hits new milestone!", 
        "https://based-news-eight.vercel.app"
      ),
      color: "text-purple-500"
    }
  ];

  const baseAppFeatures = [
    {
      icon: Bell,
      title: "Native Notifications",
      description: "Get price alerts directly in your Base app",
      action: () => sendPriceAlert(
        "🚨 Price Alert",
        "DEGEN just hit your target price of $0.05!"
      ),
      color: "text-orange-500"
    },
    {
      icon: Smartphone,
      title: "Add to Base App",
      description: "Install BasedHub as a Base mini app",
      action: handleAddToBaseApp,
      color: "text-indigo-500"
    },
    {
      icon: Globe,
      title: "Base Ecosystem",
      description: "Exclusive focus on Base chain tokens and DeFi",
      action: () => openUrl("https://base.org"),
      color: "text-cyan-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* App Sharing Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Share2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-foreground">Share BasedHub</h3>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
              Social
            </Badge>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Spread the word about the best Base ecosystem tracker!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleShareApp}
              className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
            >
              <Users className="w-4 h-4 mr-2" />
              Share on Farcaster
            </Button>
            <Button 
              variant="outline"
              onClick={copyAppUrl}
              className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Social Sharing Features */}
      <Card className="bg-based-surface border-border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-foreground">Social Features</h3>
            </div>
            <Badge variant="secondary">Farcaster</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shareFeatures.map((feature, index) => (
              <div 
                key={index}
                className="p-4 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  <h4 className="font-medium text-foreground">{feature.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {feature.description}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={feature.action}
                  className="w-full"
                >
                  Share
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Base App Integration */}
      <Card className="bg-based-surface border-border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-foreground">Base App Features</h3>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              Native
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {baseAppFeatures.map((feature, index) => (
              <div 
                key={index}
                className="p-4 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  <h4 className="font-medium text-foreground">{feature.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {feature.description}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={feature.action}
                  className="w-full"
                >
                  Try
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* User Stats */}
      {userStats && (
        <Card className="bg-based-surface border-border">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-foreground">Your BasedHub Stats</h3>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userStats.watchlistCount}
                </p>
                <p className="text-sm text-muted-foreground">Watchlist Items</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {userStats.portfolioCount}
                </p>
                <p className="text-sm text-muted-foreground">Portfolio Items</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {userStats.alertsCount}
                </p>
                <p className="text-sm text-muted-foreground">Price Alerts</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Base Ecosystem Badge */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Powered by Base Ecosystem
          </span>
          <ExternalLink className="w-3 h-3 text-blue-500" />
        </div>
      </div>
    </div>
  );
}