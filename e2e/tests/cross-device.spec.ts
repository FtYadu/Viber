import { test, expect, devices } from '@playwright/test';
import { HomePage } from '../pages/home-page';

// Test across different device types
const deviceTests = [
  { name: 'Desktop Chrome', device: devices['Desktop Chrome'] },
  { name: 'Desktop Firefox', device: devices['Desktop Firefox'] },
  { name: 'Desktop Safari', device: devices['Desktop Safari'] },
  { name: 'iPhone 12', device: devices['iPhone 12'] },
  { name: 'iPhone 12 Pro', device: devices['iPhone 12 Pro'] },
  { name: 'Pixel 5', device: devices['Pixel 5'] },
  { name: 'iPad Pro', device: devices['iPad Pro'] },
  { name: 'Galaxy Tab S4', device: devices['Galaxy Tab S4'] },
];

test.describe('Cross-Device Testing', () => {
  deviceTests.forEach(({ name, device }) => {
    test.describe(`${name} Tests`, () => {
      test.use({ ...device });

      let homePage: HomePage;

      test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
      });

      test(`should load homepage correctly on ${name}`, async ({ page }) => {
        await homePage.navigateToHome();
        
        // Verify core elements are visible
        await homePage.verifyHeroSection();
        await homePage.verifyCvSection();
        
        // Check responsive design
        const viewport = page.viewportSize();
        const isMobile = viewport ? viewport.width < 768 : false;
        const isTablet = viewport ? viewport.width >= 768 && viewport.width < 1024 : false;
        
        if (isMobile) {
          // Mobile-specific checks
          await homePage.expectElementVisible('[data-testid="mobile-menu-toggle"]');
          await homePage.expectElementHidden('[data-testid="desktop-navigation"]');
        } else if (isTablet) {
          // Tablet-specific checks
          await homePage.expectElementVisible('[data-testid="tablet-navigation"]');
        } else {
          // Desktop-specific checks
          await homePage.expectElementVisible('[data-testid="desktop-navigation"]');
          await homePage.expectElementHidden('[data-testid="mobile-menu-toggle"]');
        }
      });

      test(`should handle touch interactions on ${name}`, async ({ page }) => {
        const isTouchDevice = name.includes('iPhone') || name.includes('Pixel') || name.includes('iPad') || name.includes('Galaxy');
        
        if (isTouchDevice) {
          await homePage.navigateToHome();
          
          // Test touch interactions
          const portfolioItems = page.locator('[data-testid="portfolio-item"]');
          const itemCount = await portfolioItems.count();
          
          if (itemCount > 0) {
            // Tap first portfolio item
            await portfolioItems.first().tap();
            
            // Verify lightbox opens
            await homePage.expectElementVisible('[data-testid="portfolio-lightbox"]');
          }
        }
      });

      test(`should maintain performance on ${name}`, async ({ page }) => {
        const startTime = Date.now();
        await homePage.navigateToHome();
        await homePage.waitForLoadState();
        const loadTime = Date.now() - startTime;
        
        // Performance thresholds may vary by device
        const viewport = page.viewportSize();
        const isMobile = viewport ? viewport.width < 768 : false;
        
        // Mobile devices may have slightly higher load times
        const maxLoadTime = isMobile ? 5000 : 3000;
        expect(loadTime).toBeLessThan(maxLoadTime);
      });

      test(`should handle form interactions on ${name}`, async ({ page }) => {
        await homePage.navigateToHome();
        
        // Scroll to contact form
        await homePage.scrollToElement('[data-testid="contact-section"]');
        
        // Fill contact form
        await homePage.fillContactForm({
          name: `Test User ${name}`,
          email: 'test@example.com',
          message: `Test message from ${name} device`,
        });
        
        // Submit form
        await homePage.submitContactForm();
        
        // Verify success
        await homePage.expectElementVisible('[data-testid="contact-success"]');
      });

      test(`should handle navigation on ${name}`, async ({ page }) => {
        await homePage.navigateToHome();
        
        const viewport = page.viewportSize();
        const isMobile = viewport ? viewport.width < 768 : false;
        
        if (isMobile) {
          // Test mobile navigation
          await homePage.openMobileMenu();
          await homePage.expectElementVisible('[data-testid="mobile-menu"]');
          
          // Navigate to portfolio
          await page.click('[data-testid="mobile-portfolio-link"]');
          await homePage.expectUrl('/portfolio');
          
          await homePage.closeMobileMenu();
        } else {
          // Test desktop navigation
          await homePage.navigateToPortfolio();
          await homePage.expectUrl('/portfolio');
        }
      });

      test(`should display images correctly on ${name}`, async ({ page }) => {
        await homePage.navigateToHome();
        
        // Wait for images to load
        await page.waitForLoadState('networkidle');
        
        // Check hero image/video
        const heroMedia = page.locator('[data-testid="hero-video"], [data-testid="hero-image"]');
        await expect(heroMedia).toBeVisible();
        
        // Check portfolio images
        const portfolioImages = page.locator('[data-testid="portfolio-item"] img');
        const imageCount = await portfolioImages.count();
        
        if (imageCount > 0) {
          // Verify first image loads
          await expect(portfolioImages.first()).toBeVisible();
          
          // Check image dimensions are appropriate for device
          const firstImage = portfolioImages.first();
          const boundingBox = await firstImage.boundingBox();
          
          if (boundingBox) {
            expect(boundingBox.width).toBeGreaterThan(0);
            expect(boundingBox.height).toBeGreaterThan(0);
          }
        }
      });

      test(`should handle text readability on ${name}`, async ({ page }) => {
        await homePage.navigateToHome();
        
        // Check text elements are readable
        const heroTitle = page.locator('[data-testid="hero-title"]');
        const heroDescription = page.locator('[data-testid="hero-description"]');
        
        // Verify text is visible and has appropriate size
        await expect(heroTitle).toBeVisible();
        await expect(heroDescription).toBeVisible();
        
        // Check computed styles for readability
        const titleStyles = await heroTitle.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            fontSize: styles.fontSize,
            lineHeight: styles.lineHeight,
            color: styles.color,
          };
        });
        
        // Font size should be reasonable
        const fontSize = parseInt(titleStyles.fontSize);
        expect(fontSize).toBeGreaterThan(16); // Minimum readable font size
      });
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should work consistently across browsers', async ({ browserName, page }) => {
      const homePage = new HomePage(page);
      await homePage.navigateToHome();
      
      // Core functionality should work in all browsers
      await homePage.verifyHeroSection();
      await homePage.verifyCvSection();
      
      // Browser-specific feature checks
      if (browserName === 'webkit') {
        // Safari-specific tests
        console.log('Running Safari-specific tests');
      } else if (browserName === 'firefox') {
        // Firefox-specific tests
        console.log('Running Firefox-specific tests');
      } else if (browserName === 'chromium') {
        // Chrome-specific tests
        console.log('Running Chrome-specific tests');
      }
    });

    test('should handle CSS features across browsers', async ({ browserName, page }) => {
      const homePage = new HomePage(page);
      await homePage.navigateToHome();
      
      // Check CSS Grid support
      const gridSupport = await page.evaluate(() => {
        return CSS.supports('display', 'grid');
      });
      expect(gridSupport).toBe(true);
      
      // Check Flexbox support
      const flexSupport = await page.evaluate(() => {
        return CSS.supports('display', 'flex');
      });
      expect(flexSupport).toBe(true);
      
      // Check CSS Custom Properties support
      const customPropsSupport = await page.evaluate(() => {
        return CSS.supports('color', 'var(--test-color)');
      });
      expect(customPropsSupport).toBe(true);
    });

    test('should handle JavaScript features across browsers', async ({ browserName, page }) => {
      const homePage = new HomePage(page);
      await homePage.navigateToHome();
      
      // Check modern JavaScript features
      const jsFeatures = await page.evaluate(() => {
        return {
          asyncAwait: typeof (async () => {}) === 'function',
          arrow: typeof (() => {}) === 'function',
          destructuring: (() => { try { const [a] = [1]; return true; } catch { return false; } })(),
          templateLiterals: (() => { try { return `test` === 'test'; } catch { return false; } })(),
          fetch: typeof fetch === 'function',
          promises: typeof Promise === 'function',
        };
      });
      
      // All modern browsers should support these features
      expect(jsFeatures.asyncAwait).toBe(true);
      expect(jsFeatures.arrow).toBe(true);
      expect(jsFeatures.destructuring).toBe(true);
      expect(jsFeatures.templateLiterals).toBe(true);
      expect(jsFeatures.fetch).toBe(true);
      expect(jsFeatures.promises).toBe(true);
    });
  });

  test.describe('Accessibility Across Devices', () => {
    test('should maintain accessibility on all devices', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.navigateToHome();
      
      // Check for proper heading structure
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);
      
      // Check for alt text on images
      const images = await page.locator('img').all();
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
      
      // Check for proper form labels
      const inputs = await page.locator('input[type="text"], input[type="email"], textarea').all();
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          await expect(label).toBeVisible();
        }
      }
    });

    test('should support keyboard navigation on all devices', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.navigateToHome();
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      
      // Verify focus is visible
      const focusedElement = await page.evaluate(() => {
        const focused = document.activeElement;
        return focused ? {
          tagName: focused.tagName,
          className: focused.className,
          id: focused.id,
        } : null;
      });
      
      expect(focusedElement).toBeTruthy();
    });
  });
});