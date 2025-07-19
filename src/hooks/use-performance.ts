"use client";

import { useEffect, useState } from "react";
import { measureWebVitals, preloadCriticalResources, addResourceHints } from "@/lib/performance";

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize performance optimizations
    preloadCriticalResources();
    addResourceHints();

    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Measure Web Vitals
    measureWebVitals();

    // Set loading to false after initialization
    setIsLoading(false);
  }, []);

  // Function to manually trigger performance measurement
  const measurePerformance = () => {
    if (typeof window !== 'undefined') {
      // Measure navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics = {
          ttfb: navigation.responseStart - navigation.requestStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          loadComplete: navigation.loadEventEnd - navigation.fetchStart,
        };
        
        console.log('Performance Metrics:', metrics);
        return metrics;
      }
    }
    return null;
  };

  // Function to get resource timing
  const getResourceTiming = () => {
    if (typeof window !== 'undefined') {
      const resources = performance.getEntriesByType('resource');
      return resources.map((resource) => ({
        name: resource.name,
        duration: resource.duration,
        size: (resource as any).transferSize || 0,
        type: getResourceType(resource.name),
      }));
    }
    return [];
  };

  // Helper function to determine resource type
  const getResourceType = (url: string) => {
    if (url.match(/\.(css)$/)) return 'stylesheet';
    if (url.match(/\.(js)$/)) return 'script';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  };

  // Function to clear performance marks and measures
  const clearPerformanceData = () => {
    if (typeof window !== 'undefined') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  };

  // Function to create custom performance marks
  const mark = (name: string) => {
    if (typeof window !== 'undefined') {
      performance.mark(name);
    }
  };

  // Function to measure between marks
  const measure = (name: string, startMark: string, endMark?: string) => {
    if (typeof window !== 'undefined') {
      if (endMark) {
        performance.measure(name, startMark, endMark);
      } else {
        performance.measure(name, startMark);
      }
    }
  };

  return {
    metrics,
    isLoading,
    measurePerformance,
    getResourceTiming,
    clearPerformanceData,
    mark,
    measure,
  };
}