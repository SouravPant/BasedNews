import { useState, useEffect } from 'react';

/**
 * Centralized time formatting utility for consistent time display across all components
 * Calculates relative time from original timestamp in real-time
 */

export const formatRelativeTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'Unknown time';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    // Validate the date
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // Handle future dates or invalid dates
    if (diffInMs < 0 || date.getFullYear() < 2000) {
      // For invalid dates, return a consistent fallback
      return 'Recently';
    }

    // Return relative time
    if (diffInSeconds < 60) {
      return diffInSeconds <= 5 ? 'Just now' : `${diffInSeconds}s ago`;
    } else if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? '1m ago' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return diffInHours === 1 ? '1h ago' : `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return diffInDays === 1 ? '1d ago' : `${diffInDays}d ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? '1w ago' : `${weeks}w ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  } catch (error) {
    console.warn('Error formatting relative time:', error);
    return 'Unknown time';
  }
};

/**
 * React hook for auto-updating relative time
 * Updates every minute to keep time current (5h → 6h → 7h automatically)
 */
export const useRelativeTime = (dateString: string | Date | null | undefined): string => {
  const [relativeTime, setRelativeTime] = useState(() => formatRelativeTime(dateString));

  useEffect(() => {
    // Update immediately
    setRelativeTime(formatRelativeTime(dateString));

    // Set up interval to update every minute
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(dateString));
    }, 60000); // Update every 60 seconds

    return () => clearInterval(interval);
  }, [dateString]);

  return relativeTime;
};

/**
 * Hook for batch updating multiple timestamps
 * Useful for lists of articles that all need consistent timing
 */
export const useBatchRelativeTime = (timestamps: (string | Date | null | undefined)[]): string[] => {
  const [relativeTimes, setRelativeTimes] = useState(() => 
    timestamps.map(ts => formatRelativeTime(ts))
  );

  useEffect(() => {
    // Update all times immediately
    const updateTimes = () => {
      setRelativeTimes(timestamps.map(ts => formatRelativeTime(ts)));
    };

    updateTimes();

    // Set up interval to update all times every minute
    const interval = setInterval(updateTimes, 60000);

    return () => clearInterval(interval);
  }, [timestamps]);

  return relativeTimes;
};

/**
 * Utility to get exact time difference details
 * Useful for debugging or detailed displays
 */
export const getTimeDetails = (dateString: string | Date | null | undefined) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    if (isNaN(date.getTime())) return null;
    
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    return {
      originalDate: date,
      now: now,
      diffInMs,
      diffInSeconds,
      diffInMinutes,
      diffInHours,
      diffInDays,
      formatted: formatRelativeTime(dateString)
    };
  } catch (error) {
    return null;
  }
};