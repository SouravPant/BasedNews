import { RedditPost as RedditPostType } from "@shared/schema";

interface RedditPostProps {
  post: RedditPostType;
}

export function RedditPost({ post }: RedditPostProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="border-b border-border pb-4 last:border-b-0">
      <h4 className="font-medium text-foreground mb-2 text-sm hover:text-primary cursor-pointer transition-colors">
        <a href={post.url} target="_blank" rel="noopener noreferrer">
          {post.title}
        </a>
      </h4>
      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
        <span>u/{post.author}</span>
        <div className="flex items-center space-x-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l5-5 5 5" />
          </svg>
          <span>{formatNumber(post.upvotes || 0)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{formatNumber(post.comments || 0)}</span>
        </div>
      </div>
    </div>
  );
}
