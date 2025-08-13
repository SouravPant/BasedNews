import React from 'react';
import { X, ExternalLink, ArrowUp, MessageSquare } from 'lucide-react';
import { useRelativeTime } from '@/lib/timeUtils';

interface RedditSummaryModalProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
}

export function RedditSummaryModal({ post, isOpen, onClose }: RedditSummaryModalProps) {
  // Use the centralized auto-updating time hook
  const relativeTime = useRelativeTime(post?.createdAt);

  if (!post) return null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reddit Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Post Info */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">r/</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                r/{post.subreddit || 'cryptocurrency'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                u/{post.author || 'unknown'} • {relativeTime}
              </p>
            </div>
          </div>

          {/* Post Title */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
              {post.title}
            </h3>
          </div>

          {/* Post Content */}
          {post.content && (
            <div className="mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                  {post.content.length > 500 
                    ? `${post.content.slice(0, 500)}...`
                    : post.content
                  }
                </p>
              </div>
            </div>
          )}

          {/* Post Image */}
          {post.imageUrl && (
            <div className="mb-6">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-auto max-h-96 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Engagement Stats */}
          <div className="flex items-center space-x-6 mb-6 text-gray-500 dark:text-gray-400">
            {post.upvotes && (
              <div className="flex items-center space-x-2">
                <ArrowUp className="w-5 h-5" />
                <span>{post.upvotes.toLocaleString()} upvotes</span>
              </div>
            )}
            {post.comments && (
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>{post.comments.toLocaleString()} comments</span>
              </div>
            )}
          </div>

          {/* Sentiment */}
          {post.sentiment && (
            <div className="mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                post.sentiment === 'bullish' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : post.sentiment === 'bearish'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
              }`}>
                {post.sentiment.charAt(0).toUpperCase() + post.sentiment.slice(1)} Sentiment
              </span>
            </div>
          )}

          {/* External Link */}
          {post.url && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Reddit</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}