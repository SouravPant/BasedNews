import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react';

// Enhanced loading skeleton for crypto cards
export function CryptoCardSkeleton() {
  return (
    <Card className="bg-based-surface border-border p-4 animate-pulse">
      <div className="flex items-center space-x-3 mb-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-16" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </Card>
  );
}

// Enhanced loading skeleton for news articles
export function NewsCardSkeleton() {
  return (
    <Card className="bg-based-surface border-border p-4 animate-pulse">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </Card>
  );
}

// Loading spinner with message
export function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// Error state component
export function ErrorState({ 
  title = "Something went wrong", 
  message = "We're having trouble loading this data. Please try again.",
  onRetry 
}: { 
  title?: string; 
  message?: string; 
  onRetry?: () => void;
}) {
  return (
    <Card className="bg-based-surface border-border p-8 text-center">
      <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </Card>
  );
}

// Empty state component
export function EmptyState({ 
  icon: Icon = TrendingUp,
  title = "No data available", 
  message = "There's no data to display at the moment."
}: { 
  icon?: React.ComponentType<any>;
  title?: string; 
  message?: string; 
}) {
  return (
    <Card className="bg-based-surface border-border p-8 text-center">
      <Icon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{message}</p>
    </Card>
  );
}

// Grid loading state
export function GridLoadingState({ 
  count = 10, 
  Component = CryptoCardSkeleton 
}: { 
  count?: number; 
  Component?: React.ComponentType;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}