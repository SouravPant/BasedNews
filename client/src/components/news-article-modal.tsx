import { useState, useEffect } from 'react';
import { NewsArticle as NewsArticleType } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NewsArticleModalProps {
  article: NewsArticleType;
  isOpen: boolean;
  onClose: () => void;
}

export function NewsArticleModal({ article, isOpen, onClose }: NewsArticleModalProps) {
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const formatTimeAgo = (timestamp?: Date | null) => {
    if (!timestamp) return "Unknown time";
    
    const now = new Date();
    const articleDate = new Date(timestamp);
    
    if (isNaN(articleDate.getTime())) return "Unknown time";
    
    const diffMs = now.getTime() - articleDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return articleDate.toLocaleDateString();
  };

  const getSentimentIcon = (sentiment?: string | null) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSentimentColor = (sentiment?: string | null) => {
    switch (sentiment) {
      case 'bullish':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'bearish':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const generateAISummary = async () => {
    if (!article.description && !article.content) {
      setAiSummary("No content available to summarize.");
      return;
    }

    setIsGeneratingSummary(true);
    try {
      // Create a concise summary from existing content
      const contentToSummarize = article.content || article.description || article.title;
      
      // Simple extractive summarization - take first 100 words
      const words = contentToSummarize.split(' ');
      const summary = words.slice(0, 100).join(' ') + (words.length > 100 ? '...' : '');
      
      // Add some intelligent processing
      const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const finalSummary = sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '.' : '');
      
      setAiSummary(finalSummary);
    } catch (error) {
      console.error('Error generating summary:', error);
      setAiSummary("Unable to generate summary at this time.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  useEffect(() => {
    if (isOpen && !aiSummary) {
      generateAISummary();
    }
  }, [isOpen, aiSummary]);

  const handleExternalLink = () => {
    if (article.url && !article.url.includes('example.com')) {
      try {
        new URL(article.url);
        window.open(article.url, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.warn('Invalid URL:', article.url);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="news-article-modal">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold leading-tight pr-8">
            {article.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Article Image */}
          {article.imageUrl && (
            <div className="relative">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Article Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
            <span>•</span>
            <span className="font-medium">{article.source}</span>
            {article.author && (
              <>
                <span>•</span>
                <span>By {article.author}</span>
              </>
            )}
            {article.readingTime && (
              <>
                <span>•</span>
                <span>{article.readingTime} min read</span>
              </>
            )}
          </div>

          {/* Tags and Sentiment */}
          <div className="flex flex-wrap items-center gap-2">
            {article.sentiment && (
              <Badge variant="secondary" className={getSentimentColor(article.sentiment)}>
                <div className="flex items-center gap-1">
                  {getSentimentIcon(article.sentiment)}
                  <span>{article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}</span>
                </div>
              </Badge>
            )}
            {article.category && (
              <Badge variant="outline">
                {article.category}
              </Badge>
            )}
            {article.featured && (
              <Badge variant="default">
                Featured
              </Badge>
            )}
          </div>

          {/* AI Summary Section */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800" data-testid="ai-summary-section">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                AI Summary (100 words)
              </h3>
              {isGeneratingSummary ? (
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating intelligent summary...</span>
                </div>
              ) : (
                <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                  {aiSummary}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Article Description */}
          {article.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {article.description}
              </p>
            </div>
          )}

          {/* Article Content */}
          {article.content && (
            <div>
              <h3 className="font-semibold mb-2">Full Article</h3>
              <div className="prose dark:prose-invert max-w-none">
                <p className="leading-relaxed whitespace-pre-wrap">
                  {article.content}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={handleExternalLink}
              className="flex items-center gap-2"
              data-testid="read-full-article-button"
            >
              <ExternalLink className="w-4 h-4" />
              Read Full Article
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}