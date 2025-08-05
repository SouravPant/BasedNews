import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Heart, Repeat2, Share } from "lucide-react";

interface TwitterPostProps {
  tweet: {
    id: string;
    text: string;
    author: string;
    likes: number;
    retweets: number;
    replies?: number;
    createdAt: string;
    engagement_rate?: number;
    sentiment?: 'bullish' | 'bearish' | 'neutral';
  };
  onClick?: (tweet: any) => void;
}

export function TwitterPost({ tweet, onClick }: TwitterPostProps) {
  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'bullish': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'bearish': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'neutral': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <Card 
      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer border-border bg-card"
      onClick={() => onClick?.(tweet)}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {tweet.author ? tweet.author.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <p className="font-medium text-foreground">@{tweet.author}</p>
              <p className="text-xs text-muted-foreground">{formatDate(tweet.createdAt)}</p>
            </div>
          </div>
          {tweet.sentiment && (
            <Badge className={getSentimentColor(tweet.sentiment)}>
              {tweet.sentiment}
            </Badge>
          )}
        </div>

        {/* Tweet Content */}
        <p className="text-sm text-foreground leading-relaxed">
          {tweet.text}
        </p>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{formatNumber(tweet.replies || 0)}</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Repeat2 className="w-4 h-4" />
              <span className="text-xs">{formatNumber(tweet.retweets)}</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Heart className="w-4 h-4" />
              <span className="text-xs">{formatNumber(tweet.likes)}</span>
            </div>
          </div>
          
          {tweet.engagement_rate && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>Engagement: {(tweet.engagement_rate * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}