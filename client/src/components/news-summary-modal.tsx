import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Brain, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: Date;
  sentiment: string;
}

interface NewsSummaryModalProps {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

interface SummaryResponse {
  summary: string;
  word_count: number;
  url: string;
}

export function NewsSummaryModal({ article, isOpen, onClose }: NewsSummaryModalProps) {
  const [summary, setSummary] = useState<string | null>(null);

  const summarizeMutation = useMutation({
    mutationFn: async (text: string): Promise<SummaryResponse> => {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: text,
          url: article?.url
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
    if (article && !summarizeMutation.isPending) {
      const fullText = `${article.title}. ${article.description}`;
      summarizeMutation.mutate(fullText);
    }
  };

  // Auto-generate summary when modal opens
  useEffect(() => {
    if (isOpen && article && !summary && !summarizeMutation.isPending) {
      handleSummarize();
    }
  }, [isOpen, article]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-500';
      case 'bearish': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'bg-green-500/10';
      case 'bearish': return 'bg-red-500/10';
      default: return 'bg-muted';
    }
  };

  if (!article) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-full bg-card border-border text-card-foreground">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <DialogTitle className="text-xl font-bold text-card-foreground leading-tight">
                {article.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                AI-powered news summary for {article.title}
              </DialogDescription>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm font-medium text-primary">{article.source}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getSentimentBg(article.sentiment)} ${getSentimentColor(article.sentiment)}`}>
                  {article.sentiment}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Article Image */}
          <div className="w-full h-48 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-border">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">Cryptocurrency Market Analysis</p>
            </div>
          </div>

          {/* Original Description */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-2">Article Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {article.description}
            </p>
          </div>

          {/* AI Summary Section */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-card-foreground">AI Summary (150-200 words)</h3>
              </div>
              {!summary && !summarizeMutation.isPending && (
                <Button
                  onClick={handleSummarize}
                  size="sm"
                  className="text-xs"
                >
                  Regenerate Summary
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
                Summary generation failed. Click "Regenerate Summary" to try again.
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
              onClick={() => {
                if (article.url && article.url !== "https://example.com/btc-etf-ath" && article.url !== "https://example.com/eth-staking-rewards" && article.url !== "https://example.com/defi-security-audit") {
                  window.open(article.url, '_blank', 'noopener,noreferrer');
                } else {
                  // For demo articles, show a message
                  alert('This is a demo article. In a live environment, this would open the full article.');
                }
              }}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Read Full Article
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