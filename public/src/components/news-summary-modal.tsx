import { useState } from "react";
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
    if (article && !summary && !summarizeMutation.isPending) {
      const fullText = `${article.title}. ${article.description}`;
      summarizeMutation.mutate(fullText);
    }
  };

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
      <DialogContent className="max-w-2xl w-full bg-card border-border text-card-foreground">
        <DialogHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
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
                Click "Generate Summary" to get an AI-powered concise summary of this article.
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
              onClick={() => window.open(article.url, '_blank')}
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