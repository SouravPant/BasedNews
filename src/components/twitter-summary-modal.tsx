import React from 'react';
import { X, ExternalLink, Heart, MessageCircle, Repeat2 } from 'lucide-react';
import { useRelativeTime } from '@/lib/timeUtils';

interface TwitterSummaryModalProps {
  tweet: any;
  isOpen: boolean;
  onClose: () => void;
}

export function TwitterSummaryModal({ tweet, isOpen, onClose }: TwitterSummaryModalProps) {
  // Use the centralized auto-updating time hook
  const relativeTime = useRelativeTime(tweet?.createdAt);

  if (!tweet) return null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tweet Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Author Info */}
          <div className="flex items-center space-x-3 mb-4">
            {tweet.author?.profileImageUrl && (
              <img
                src={tweet.author.profileImageUrl}
                alt={tweet.author.username}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {tweet.author?.displayName || tweet.author?.username || 'Unknown User'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                @{tweet.author?.username || 'unknown'} • {relativeTime}
              </p>
            </div>
          </div>

          {/* Tweet Content */}
          <div className="mb-6">
            <p className="text-gray-900 dark:text-white text-lg leading-relaxed whitespace-pre-wrap">
              {tweet.text}
            </p>
          </div>

          {/* Media */}
          {tweet.media && tweet.media.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 gap-3">
                {tweet.media.map((media: any, index: number) => (
                  <div key={index} className="rounded-lg overflow-hidden">
                    {media.type === 'photo' && (
                      <img
                        src={media.url}
                        alt="Tweet media"
                        className="w-full h-auto max-h-96 object-cover"
                      />
                    )}
                    {media.type === 'video' && (
                      <video
                        src={media.url}
                        controls
                        className="w-full h-auto max-h-96"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Engagement Stats */}
          {(tweet.replyCount || tweet.retweetCount || tweet.likeCount) && (
            <div className="flex items-center space-x-6 mb-6 text-gray-500 dark:text-gray-400">
              {tweet.replyCount && (
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>{tweet.replyCount.toLocaleString()}</span>
                </div>
              )}
              {tweet.retweetCount && (
                <div className="flex items-center space-x-2">
                  <Repeat2 className="w-5 h-5" />
                  <span>{tweet.retweetCount.toLocaleString()}</span>
                </div>
              )}
              {tweet.likeCount && (
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <span>{tweet.likeCount.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Sentiment */}
          {tweet.sentiment && (
            <div className="mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                tweet.sentiment === 'bullish' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : tweet.sentiment === 'bearish'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
              }`}>
                {tweet.sentiment.charAt(0).toUpperCase() + tweet.sentiment.slice(1)} Sentiment
              </span>
            </div>
          )}

          {/* External Link */}
          {tweet.url && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <a
                href={tweet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Twitter</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}