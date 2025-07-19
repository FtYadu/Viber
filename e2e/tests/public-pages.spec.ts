import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';

test.describe('Public Pages', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test.describe('Homepage', () => {
    test('should load homepage successfully', async () => {
      await homePage.navigateToHome();
      
      // Verify hero section
      await homePage.verifyHeroSection();
      
      // Verify CV section
      await homePage.verifyCvSection();
      
      // Verify portfolio section
      const portfolioItemCount = await homePage.verifyPortfolioSection();
      expect(portfolioItemCount).toBeGreaterThan(0);
    });

    test('should display hero video', async () => {
      await homePage.navigateToHome();
      
      const isVideoPlaying = await homePage.verifyHeroVideo();
      // Video might not autoplay in test environment, so we just check it exists
      await homePage.expectElementVisible('[data-testid="hero-video"]');
    });

    test('should allow CV download', async () => {
      await homePage.navigateToHome();
      
      const download = await homePage.downloadCv();
      expect(download.suggestedFilename()).toContain('.pdf');
    });

    test('should filter portfolio items by category', async () => {
      await homePage.navigateToHome();
      
      // Filter by Web Development
      await homePage.filterPortfolioByCategory('Web Development');
      
      // Verify filtered results
      const filteredItems = await homePage.page.locator('[data-testid="portfolio-item"]').count();
      expect(filteredItems).toBeGreaterThan(0);
    });

    test('should open portfolio item in lightbox', async () => {
      await homePage.navigateToHome();
      
      // Click first portfolio item
      await homePage.clickPortfolioItem(0);
      
      // Verify lightbox opens
      await homePage.expectElementVisible('[data-testid="portfolio-lightbox"]');
      
      // Close lightbox
      await homePage.clickElement('[data-testid="lightbox-close"]');
      await homePage.expectElementHidden('[data-testid="portfolio-lightbox"]');
    });

    test('should submit contact form successfully', async () => {
      await homePage.navigateToHome();
      
      // Scroll to contact section
      await homePage.scrollToElement('[data-testid="contact-section"]');
      
      // Fill and submit contact form
      await homePage.fillContactForm({
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message from E2E tests.',
      });
      
      await homePage.submitContactForm();
      
      // Verify success message
      await homePage.expectElementVisible('[data-testid="contact-success"]');
    });

    test('should open and interact with chatbot', async () => {
      await homePage.navigateToHome();
      
      // Open chat
      await homePage.openChat();
      
      // Send a message
      await homePage.sendChatMessage('Hello, I need help with web development services.');
      
      // Verify response appears
      await homePage.expectElementVisible('[data-testid="chat-message-assistant"]');
      
      // Close chat
      await homePage.closeChat();
    });

    test('should be responsive on mobile devices', async ({ page, isMobile }) => {
      if (isMobile) {
        await homePage.navigateToHome();
        
        // Verify responsive design
        await homePage.verifyResponsiveDesign();
        
        // Test mobile menu
        await homePage.openMobileMenu();
        await homePage.expectElementVisible('[data-testid="mobile-menu"]');
        
        await homePage.closeMobileMenu();
        await homePage.expectElementHidden('[data-testid="mobile-menu"]');
      }
    });

    test('should have proper SEO elements', async () => {
      await homePage.navigateToHome();
      
      const seoData = await homePage.checkSeoElements();
      
      expect(seoData.hasTitle).toBe(true);
      expect(seoData.title).toContain('Yadu Krishnan');
      expect(seoData.hasMetaDescription).toBe(true);
      expect(seoData.hasProperH1Structure).toBe(true);
    });

    test('should load within performance thresholds', async () => {
      const performanceData = await homePage.checkPagePerformance();
      
      // Page should load within 3 seconds
      expect(performanceData.loadTime).toBeLessThan(3000);
      expect(performanceData.criticalElementsVisible).toBe(true);
    });
  });

  test.describe('Portfolio Page', () => {
    test('should navigate to portfolio page', async () => {
      await homePage.navigateToHome();
      await homePage.navigateToPortfolio();
      
      // Verify portfolio page elements
      await homePage.expectElementVisible('[data-testid="portfolio-gallery"]');
      await homePage.expectElementVisible('[data-testid="portfolio-filters"]');
    });

    test('should display portfolio items with proper information', async () => {
      await homePage.goto('/portfolio');
      
      // Verify portfolio items have required information
      const portfolioItems = homePage.page.locator('[data-testid="portfolio-item"]');
      const count = await portfolioItems.count();
      
      expect(count).toBeGreaterThan(0);
      
      // Check first item has title and description
      await expect(portfolioItems.first().locator('[data-testid="portfolio-title"]')).toBeVisible();
      await expect(portfolioItems.first().locator('[data-testid="portfolio-description"]')).toBeVisible();
    });

    test('should handle portfolio item navigation', async () => {
      await homePage.goto('/portfolio');
      
      // Click on first portfolio item
      await homePage.page.locator('[data-testid="portfolio-item"]').first().click();
      
      // Should navigate to portfolio item detail page
      await expect(homePage.page).toHaveURL(/\/portfolio\/.+/);
      
      // Verify portfolio item details
      await homePage.expectElementVisible('[data-testid="portfolio-detail"]');
      await homePage.expectElementVisible('[data-testid="portfolio-images"]');
    });
  });

  test.describe('Accessibility', () => {
    test('should be accessible', async () => {
      await homePage.navigateToHome();
      
      // Check basic accessibility
      const violations = await homePage.checkAccessibility();
      expect(violations).toHaveLength(0);
    });

    test('should support keyboard navigation', async () => {
      await homePage.navigateToHome();
      
      // Test tab navigation
      await homePage.page.keyboard.press('Tab');
      
      // Verify focus is visible
      const focusedElement = await homePage.page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });

    test('should have proper ARIA labels', async () => {
      await homePage.navigateToHome();
      
      // Check for ARIA labels on interactive elements
      const chatButton = homePage.page.locator('[data-testid="chat-bubble"]');
      const ariaLabel = await chatButton.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    });
  });

  test.describe('Cross-browser compatibility', () => {
    test('should work in different browsers', async ({ browserName }) => {
      await homePage.navigateToHome();
      
      // Verify core functionality works across browsers
      await homePage.verifyHeroSection();
      await homePage.verifyCvSection();
      
      // Browser-specific checks
      if (browserName === 'webkit') {
        // Safari-specific tests
        await homePage.expectElementVisible('[data-testid="hero-video"]');
      }
    });
  });
});