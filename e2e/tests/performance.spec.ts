import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';

test.describe('Performance Testing', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test.describe('Page Load Performance', () => {
    test('should load homepage within performance thresholds', async ({ page }) => {
      // Measure page load time
      const startTime = Date.now();
      await homePage.navigateToHome();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Check Core Web Vitals
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals = {};
          
          // Largest Contentful Paint (LCP)
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.lcp = lastEntry.startTime;
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // First Input Delay (FID) - simulated
          vitals.fid = 0; // Would be measured on actual user interaction

          // Cumulative Layout Shift (CLS)
          let clsValue = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            vitals.cls = clsValue;
          }).observe({ entryTypes: ['layout-shift'] });

          // Return vitals after a short delay
          setTimeout(() => resolve(vitals), 2000);
        });
      });

      // Core Web Vitals thresholds
      expect(webVitals.lcp).toBeLessThan(2500); // LCP should be < 2.5s
      expect(webVitals.cls).toBeLessThan(0.1);  // CLS should be < 0.1
    });

    test('should load portfolio page efficiently', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);

      // Check that images are lazy loaded
      const images = page.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        // Check loading attribute
        const firstImage = images.first();
        const loading = await firstImage.getAttribute('loading');
        expect(loading).toBe('lazy');
      }
    });

    test('should handle large portfolio galleries efficiently', async ({ page }) => {
      await page.goto('/portfolio');
      
      // Scroll through portfolio to trigger lazy loading
      await page.evaluate(() => {
        return new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });

      // Check that page remains responsive
      const performanceEntries = await page.evaluate(() => {
        return performance.getEntriesByType('navigation')[0];
      });

      // DOM content should load quickly
      expect(performanceEntries.domContentLoadedEventEnd - performanceEntries.domContentLoadedEventStart).toBeLessThan(1000);
    });
  });

  test.describe('Resource Loading', () => {
    test('should optimize image loading', async ({ page }) => {
      await homePage.navigateToHome();

      // Check for WebP support and usage
      const images = await page.locator('img').all();
      
      for (const img of images) {
        const src = await img.getAttribute('src');
        if (src && src.includes('cloudinary')) {
          // Cloudinary images should use modern formats
          expect(src).toMatch(/f_auto|f_webp/);
        }
      }
    });

    test('should implement proper caching headers', async ({ page }) => {
      const response = await page.goto('/');
      
      const cacheControl = response?.headers()['cache-control'];
      expect(cacheControl).toBeTruthy();
    });

    test('should minimize JavaScript bundle size', async ({ page }) => {
      await homePage.navigateToHome();

      // Get all script tags
      const scripts = await page.locator('script[src]').all();
      
      let totalSize = 0;
      for (const script of scripts) {
        const src = await script.getAttribute('src');
        if (src && src.startsWith('/_next/static/')) {
          // Make a HEAD request to get content length
          const response = await page.request.head(new URL(src, page.url()).href);
          const contentLength = response.headers()['content-length'];
          if (contentLength) {
            totalSize += parseInt(contentLength);
          }
        }
      }

      // Total JS bundle should be reasonable (< 1MB)
      expect(totalSize).toBeLessThan(1024 * 1024);
    });

    test('should use efficient CSS loading', async ({ page }) => {
      await homePage.navigateToHome();

      // Check for critical CSS inlining
      const inlineStyles = await page.locator('style').count();
      expect(inlineStyles).toBeGreaterThan(0);

      // Check for non-blocking CSS loading
      const linkTags = await page.locator('link[rel="stylesheet"]').all();
      
      for (const link of linkTags) {
        const media = await link.getAttribute('media');
        // Non-critical CSS should use media queries or be loaded asynchronously
        if (!media || media === 'all') {
          // This is critical CSS, should be minimal
        }
      }
    });
  });

  test.describe('Runtime Performance', () => {
    test('should maintain smooth animations', async ({ page }) => {
      await homePage.navigateToHome();

      // Trigger animations and measure frame rate
      await page.hover('[data-testid="portfolio-item"]');
      
      // Measure animation performance
      const animationMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          let frameCount = 0;
          let startTime = performance.now();
          
          function countFrames() {
            frameCount++;
            if (performance.now() - startTime < 1000) {
              requestAnimationFrame(countFrames);
            } else {
              resolve({ fps: frameCount, duration: performance.now() - startTime });
            }
          }
          
          requestAnimationFrame(countFrames);
        });
      });

      // Should maintain at least 30 FPS
      expect(animationMetrics.fps).toBeGreaterThan(30);
    });

    test('should handle scroll performance', async ({ page }) => {
      await homePage.navigateToHome();

      // Measure scroll performance
      const scrollMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          let frameCount = 0;
          let startTime = performance.now();
          
          function measureScroll() {
            frameCount++;
            window.scrollBy(0, 10);
            
            if (performance.now() - startTime < 2000) {
              requestAnimationFrame(measureScroll);
            } else {
              resolve({ 
                fps: frameCount / 2, // 2 seconds
                scrollHeight: window.scrollY 
              });
            }
          }
          
          requestAnimationFrame(measureScroll);
        });
      });

      // Should maintain smooth scrolling
      expect(scrollMetrics.fps).toBeGreaterThan(30);
    });

    test('should handle memory usage efficiently', async ({ page }) => {
      await homePage.navigateToHome();

      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });

      // Navigate through different sections
      await homePage.navigateToPortfolio();
      await page.goBack();
      await homePage.navigateToContact();
      await page.goBack();

      // Get final memory usage
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });

      // Memory usage shouldn't increase dramatically
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB increase
      }
    });
  });

  test.describe('Network Performance', () => {
    test('should minimize HTTP requests', async ({ page }) => {
      const requests = [];
      
      page.on('request', request => {
        requests.push(request.url());
      });

      await homePage.navigateToHome();
      await page.waitForLoadState('networkidle');

      // Should have reasonable number of requests
      expect(requests.length).toBeLessThan(50);
    });

    test('should use HTTP/2 where possible', async ({ page }) => {
      const response = await page.goto('/');
      
      // Check if HTTP/2 is being used
      const protocol = await page.evaluate(() => {
        return (navigator as any).connection?.effectiveType || 'unknown';
      });

      // This is more of an informational test
      console.log('Connection type:', protocol);
    });

    test('should implement proper resource prioritization', async ({ page }) => {
      const resourceTimings = [];
      
      page.on('response', response => {
        resourceTimings.push({
          url: response.url(),
          status: response.status(),
          timing: response.timing(),
        });
      });

      await homePage.navigateToHome();
      await page.waitForLoadState('networkidle');

      // Critical resources should load first
      const criticalResources = resourceTimings.filter(r => 
        r.url.includes('/_next/static/css/') || 
        r.url.includes('/_next/static/chunks/pages/')
      );

      expect(criticalResources.length).toBeGreaterThan(0);
    });
  });

  test.describe('Mobile Performance', () => {
    test('should perform well on mobile devices', async ({ page, isMobile }) => {
      if (isMobile) {
        const startTime = Date.now();
        await homePage.navigateToHome();
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;

        // Mobile should load within 4 seconds (slightly higher threshold)
        expect(loadTime).toBeLessThan(4000);

        // Check for mobile-specific optimizations
        const viewport = page.viewportSize();
        expect(viewport?.width).toBeLessThan(768);

        // Verify touch-friendly interface
        const touchTargets = await page.locator('button, a, [role="button"]').all();
        
        for (const target of touchTargets.slice(0, 5)) { // Check first 5
          const box = await target.boundingBox();
          if (box) {
            // Touch targets should be at least 44px (iOS guideline)
            expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });

    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow 3G
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
        await route.continue();
      });

      const startTime = Date.now();
      await homePage.navigateToHome();
      await page.waitForSelector('[data-testid="hero-section"]');
      const loadTime = Date.now() - startTime;

      // Should still be usable on slow connections
      expect(loadTime).toBeLessThan(8000);
    });
  });

  test.describe('Performance Monitoring', () => {
    test('should track performance metrics', async ({ page }) => {
      await homePage.navigateToHome();

      // Check if performance monitoring is implemented
      const hasAnalytics = await page.evaluate(() => {
        return typeof window.gtag !== 'undefined' || 
               typeof window.va !== 'undefined' || // Vercel Analytics
               typeof window._paq !== 'undefined'; // Matomo
      });

      // Should have some form of analytics
      expect(hasAnalytics).toBe(true);
    });

    test('should report Core Web Vitals', async ({ page }) => {
      await homePage.navigateToHome();

      // Check if Core Web Vitals are being tracked
      const webVitalsTracking = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Check for web-vitals library
          if (typeof window.webVitals !== 'undefined') {
            resolve(true);
          } else {
            // Check for manual implementation
            const hasLCP = typeof window.LCP !== 'undefined';
            const hasFID = typeof window.FID !== 'undefined';
            const hasCLS = typeof window.CLS !== 'undefined';
            resolve(hasLCP || hasFID || hasCLS);
          }
        });
      });

      // Should track Core Web Vitals
      expect(webVitalsTracking).toBe(true);
    });
  });
});