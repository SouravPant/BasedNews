import { NewsArticle as NewsArticleType } from "@shared/schema";

interface NewsArticleProps {
  article: NewsArticleType;
  onClick?: () => void;
}

export function NewsArticle({ article, onClick }: NewsArticleProps) {
  const formatTimeAgo = (timestamp?: Date | null) => {
    if (!timestamp) return "Unknown time";
    
    const now = new Date();
    const articleDate = new Date(timestamp);
    
    // Validate the date
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

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <article className="group border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
      {/* Make the entire card clickable as a link to the source article */}
      <a 
        href={article.url && !article.url.includes('example.com') ? article.url : '#'}
        target={article.url && !article.url.includes('example.com') ? '_blank' : '_self'}
        rel="noopener noreferrer"
        className="block p-4 h-full"
        onClick={(e) => {
          if (!article.url || article.url.includes('example.com')) {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        <div className="flex flex-col h-full">
          {/* Article Image */}
          {article.imageUrl ? (
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full h-48 rounded-lg object-cover mb-4"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTEyLjVMMjAwIDg3LjVMMjI1IDExMi41TDI1MCA4Ny41TDI3NSAxNzUuNUgxMjVMMTc1IDExMi41WiIgZmlsbD0iIzlDQTNBRiIvPgo8Y2lyY2xlIGN4PSIxNTAiIGN5PSIxMDAiIHI9IjEyLjUiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
              }}
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
          )}
          
          {/* Article Content */}
          <div className="flex-1 flex flex-col">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-3">
              {article.title}
            </h3>
            
            {article.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-1 line-clamp-3">
                {article.description}
              </p>
            )}
            
            {/* Article Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-3">
                <span className="font-medium">{article.source}</span>
                <span>{formatTimeAgo(article.publishedAt)}</span>
              </div>
              
              {article.sentiment && (
                <div className="flex items-center space-x-1">
                  {getSentimentIcon(article.sentiment)}
                  <span className={getSentimentColor(article.sentiment)}>
                    {article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </a>
    </article>
  );
}
