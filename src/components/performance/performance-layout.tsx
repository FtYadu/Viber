"use client";

import { useEffect } from "react";
import { 
  addResourceHints, 
  measureWebVitals
} from "@/lib/performance";

interface PerformanceLayoutProps {
  children: React.ReactNode;
}

export function PerformanceLayout({ children }: PerformanceLayoutProps) {
  useEffect(() => {
    // Initialize performance optimizations
    addResourceHints();
    measureWebVitals();

    // Preload critical fonts
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    link.as = "style";
    link.onload = () => {
      link.rel = "stylesheet";
    };
    document.head.appendChild(link);

    // Add viewport meta tag if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement("meta");
      viewport.name = "viewport";
      viewport.content = "width=device-width, initial-scale=1, viewport-fit=cover";
      document.head.appendChild(viewport);
    }

    // Add theme-color meta tag
    if (!document.querySelector('meta[name="theme-color"]')) {
      const themeColor = document.createElement("meta");
      themeColor.name = "theme-color";
      themeColor.content = "#000000";
      document.head.appendChild(themeColor);
    }

    // Optimize third-party scripts loading
    const optimizeThirdPartyScripts = () => {
      // Defer non-critical scripts
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach((script) => {
        if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
          script.setAttribute('defer', '');
        }
      });
    };

    // Run optimization after initial load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', optimizeThirdPartyScripts);
    } else {
      optimizeThirdPartyScripts();
    }

    // Cleanup function
    return () => {
      document.removeEventListener('DOMContentLoaded', optimizeThirdPartyScripts);
    };
  }, []);

  return <>{children}</>;
}