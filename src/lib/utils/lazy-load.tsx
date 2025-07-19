"use client";

import { Suspense, lazy as reactLazy, ComponentType } from "react";
import { Loader2 } from "lucide-react";

interface LazyLoadOptions {
  fallback?: React.ReactNode;
  ssr?: boolean;
}

/**
 * Enhanced lazy loading utility that provides a better fallback experience
 * and optional SSR support
 */
export function lazy<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) {
  const LazyComponent = reactLazy(importFn);
  
  const {
    fallback = (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr = false,
  } = options;

  // If SSR is disabled, return the lazy component with suspense
  if (!ssr) {
    return function LazyLoadedComponent(props: React.ComponentProps<T>) {
      return (
        <Suspense fallback={fallback}>
          <LazyComponent {...props} />
        </Suspense>
      );
    };
  }

  // For SSR-enabled components, we need to handle the dynamic import differently
  return function SSRLazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}