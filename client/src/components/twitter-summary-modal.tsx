import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Brain, ExternalLink, Heart, Repeat2 } from "lucide-react";

interface Tweet {
  id: string;
  text: string;
  author: string;
  url: string;
  likes: number;
  retweets: number;
  createdAt: Date;
}

interface TwitterSummaryModalProps {
  tweet: Tweet | null;
  isOpen: boolean;
  onClose: () => void;
}

interface SummaryResponse {
  summary: string;
  word_count: number;
  url: string;
}

export function TwitterSummaryModal({ tweet, isOpen, onClose }: TwitterSummaryModalProps) {
  const [summary, setSummary] = useState<string | null>(null);

  const summarizeMutation = useMutation({
    mutationFn: async (text: string): Promise<SummaryResponse> => {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: `Tweet from @${tweet?.author}: ${text}`,
          url: tweet?.url
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setSummary(data.summary);
    },
    onError: (error) => {
      console.error("Failed to generate summary:", error);
      setSummary("Failed to generate summary. Please try again.");
    }
  });

  const handleSummarize = () => {
    if (tweet && !summary && !summarizeMutation.isPending) {
      summarizeMutation.mutate(tweet.text);
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(timestamp).getTime()) / 1000);
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (!tweet) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full bg-card border-border text-card-foreground">
        <DialogHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex-1 pr-4">
            <DialogTitle className="text-xl font-bold text-card-foreground leading-tight">
              Tweet from @{tweet.author}
            </DialogTitle>
            <DialogDescription className="sr-only">
              AI-powered Twitter post summary for tweet by @{tweet.author}
            </DialogDescription>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-sm font-medium text-blue-400">@{tweet.author}</span>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(tweet.createdAt)}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-card-foreground hover:bg-muted shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tweet Content */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-2">Tweet Content</h3>
            <div className="bg-muted/30 p-4 rounded-lg border-l-4 border-blue-400">
              <p className="text-sm text-card-foreground leading-relaxed">
                {tweet.text}
              </p>
            </div>
          </div>

          {/* Tweet Stats */}
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">{tweet.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <Repeat2 className="w-4 h-4 text-green-500" />
              <span className="text-sm">{tweet.retweets}</span>
            </div>
          </div>

          {/* AI Summary Section */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-card-foreground">AI Summary (50-100 words)</h3>
              </div>
              {!summary && !summarizeMutation.isPending && (
                <Button
                  onClick={handleSummarize}
                  size="sm"
                  className="text-xs"
                >
                  Generate Summary
                </Button>
              )}
            </div>

            {summarizeMutation.isPending && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}

            {summary && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-card-foreground leading-relaxed">
                  {summary}
                </p>
              </div>
            )}

            {!summary && !summarizeMutation.isPending && (
              <p className="text-xs text-muted-foreground italic">
                Click "Generate Summary" to get an AI-powered analysis of this tweet's crypto insights.
              </p>
            )}

            {summarizeMutation.isError && !summary && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                <p className="text-xs text-red-400">
                  Failed to generate summary. The AI service may be temporarily unavailable.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(tweet.url, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View on Twitter
            </Button>
            
            <Button onClick={onClose} variant="default" size="sm">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}