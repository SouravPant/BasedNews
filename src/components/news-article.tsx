import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useRelativeTime } from '@/lib/timeUtils';

interface NewsArticleProps {
  article: any;
  onClick?: (article: any) => void;
}

export function NewsArticle({ article, onClick }: NewsArticleProps) {
  // Use the centralized auto-updating time hook
  const relativeTime = useRelativeTime(article.publishedAt);

  const getSentimentIcon = (sentiment?: string | null) => {
    switch (sentiment) {
      case 'bullish':
        return <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l5-5 5 5" />
        </svg>;
      case 'bearish':
        return <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-5 5-5-5" />
        </svg>;
      default:
        return <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
        </svg>;
    }
  };

  const getSentimentColor = (sentiment?: string | null) => {
    switch (sentiment) {
      case 'bullish':
        return 'text-green-500';
      case 'bearish':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  const getSentimentBadgeColor = (sentiment?: string | null) => {
    switch (sentiment) {
      case 'bullish':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'bearish':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    }
  };

  return (
    <Card 
      className="mb-4 hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500 hover:border-l-blue-600"
      onClick={() => onClick?.(article)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900 dark:text-gray-100">
              {article.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
              {article.description || article.content?.slice(0, 150) + '...'}
            </p>
            
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">{article.source}</span>
                <span>{relativeTime}</span>
              </div>
              
              {article.sentiment && (
                <Badge 
                  className={`${getSentimentBadgeColor(article.sentiment)} border-0 flex items-center gap-1`}
                >
                  {getSentimentIcon(article.sentiment)}
                  <span className="capitalize">{article.sentiment}</span>
                </Badge>
              )}
            </div>
          </div>
          
          {article.urlToImage && (
            <div className="flex-shrink-0">
              <img 
                src={article.urlToImage} 
                alt={article.title}
                className="w-24 h-24 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
