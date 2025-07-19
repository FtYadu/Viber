import * as React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
LoadingSpinner.displayName = 'LoadingSpinner';

interface LoadingDotsProps extends React.HTMLAttributes<HTMLDivElement> {}

const LoadingDots = React.forwardRef<HTMLDivElement, LoadingDotsProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex space-x-1', className)}
        {...props}
      >
        <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-current" />
      </div>
    );
  }
);
LoadingDots.displayName = 'LoadingDots';

interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('animate-pulse rounded-md bg-muted', className)}
        {...props}
      />
    );
  }
);
LoadingSkeleton.displayName = 'LoadingSkeleton';

export { LoadingSpinner, LoadingDots, LoadingSkeleton };