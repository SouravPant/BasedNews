import { NewsArticle as NewsArticleType } from "@shared/schema";

interface NewsArticleProps {
  article: NewsArticleType;
  onClick?: () => void;
}

export function NewsArticle({ article, onClick }: NewsArticleProps) {
  const formatTimeAgo = (timestamp?: Date | null) => {
    if (!timestamp) return "Unknown time";
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(timestamp).getTime()) / 1000);
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} hours ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

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
        return <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
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
        return 'text-muted-foreground';
    }
  };

  return (
    <article className="border-b border-border pb-4 last:border-b-0 cursor-pointer hover:bg-muted/50 p-3 rounded-lg transition-colors" onClick={onClick}>
      <div className="flex items-start space-x-4">
        {article.imageUrl ? (
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-20 h-15 rounded-lg object-cover flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-20 h-15 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-2 hover:text-primary cursor-pointer transition-colors">
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>
          </h3>
          {article.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {article.description}
            </p>
          )}
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>{article.source}</span>
            <span>{formatTimeAgo(article.publishedAt)}</span>
            {article.sentiment && (
              <div className="flex items-center space-x-1">
                {getSentimentIcon(article.sentiment)}
                <span className={getSentimentColor(article.sentiment)}>
                  {article.sentiment ? article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1) : 'Neutral'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
