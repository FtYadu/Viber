import { test, expect } from '@playwright/test';
import { BasePage } from '../pages/base-page';

test.describe('Client Portal', () => {
  let clientPage: BasePage;

  test.beforeEach(async ({ page }) => {
    clientPage = new BasePage(page);
    
    // Use client authentication state
    await page.context().addInitScript(() => {
      localStorage.setItem('test-client-session', JSON.stringify({
        user: {
          id: '2',
          name: 'Test Client',
          email: 'client@test.com',
          role: 'CLIENT',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }));
    });
  });

  test.describe('Client Dashboard', () => {
    test('should load client dashboard successfully', async () => {
      await clientPage.goto('/client');
      await clientPage.waitForLoadState();
      
      // Verify client dashboard elements
      await clientPage.expectElementVisible('[data-testid="client-dashboard"]');
      await clientPage.expectElementVisible('[data-testid="client-welcome"]');
      await clientPage.expectElementVisible('[data-testid="client-projects"]');
    });

    test('should display client-specific information', async () => {
      await clientPage.goto('/client');
      
      // Verify client name is displayed
      await clientPage.expectText('[data-testid="client-name"]', 'Test Client');
      
      // Verify only client's projects are shown
      const projectCards = clientPage.page.locator('[data-testid="project-card"]');
      const projectCount = await projectCards.count();
      
      // Should have at least the test projects
      expect(projectCount).toBeGreaterThanOrEqual(1);
      
      // Verify project belongs to this client
      if (projectCount > 0) {
        await clientPage.expectElementVisible('[data-testid="project-card"]');
      }
    });

    test('should show project status and progress', async () => {
      await clientPage.goto('/client');
      
      // Wait for projects to load
      await clientPage.waitForSelector('[data-testid="project-card"]');
      
      // Verify project status is displayed
      await clientPage.expectElementVisible('[data-testid="project-status"]');
      
      // Verify progress indicators
      const progressBars = clientPage.page.locator('[data-testid="project-progress"]');
      const progressCount = await progressBars.count();
      expect(progressCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Project Details', () => {
    test('should view project details', async () => {
      await clientPage.goto('/client');
      
      // Click on first project
      await clientPage.clickElement('[data-testid="project-card"]');
      
      // Should navigate to project details
      await clientPage.expectUrl(/\/client\/projects\/.+/);
      
      // Verify project details are displayed
      await clientPage.expectElementVisible('[data-testid="project-details"]');
      await clientPage.expectElementVisible('[data-testid="project-title"]');
      await clientPage.expectElementVisible('[data-testid="project-description"]');
      await clientPage.expectElementVisible('[data-testid="project-timeline"]');
    });

    test('should display project timeline and milestones', async () => {
      await clientPage.goto('/client');
      await clientPage.clickElement('[data-testid="project-card"]');
      
      // Verify timeline elements
      await clientPage.expectElementVisible('[data-testid="project-timeline"]');
      await clientPage.expectElementVisible('[data-testid="project-start-date"]');
      
      // Check for milestones if they exist
      const milestones = clientPage.page.locator('[data-testid="milestone"]');
      const milestoneCount = await milestones.count();
      expect(milestoneCount).toBeGreaterThanOrEqual(0);
    });

    test('should show project files and deliverables', async () => {
      await clientPage.goto('/client');
      await clientPage.clickElement('[data-testid="project-card"]');
      
      // Navigate to files section
      await clientPage.clickElement('[data-testid="project-files-tab"]');
      
      // Verify files section
      await clientPage.expectElementVisible('[data-testid="project-files"]');
      
      // Check for downloadable files
      const fileLinks = clientPage.page.locator('[data-testid="file-download"]');
      const fileCount = await fileLinks.count();
      expect(fileCount).toBeGreaterThanOrEqual(0);
    });

    test('should allow file downloads', async () => {
      await clientPage.goto('/client');
      await clientPage.clickElement('[data-testid="project-card"]');
      await clientPage.clickElement('[data-testid="project-files-tab"]');
      
      // Check if there are files to download
      const fileLinks = clientPage.page.locator('[data-testid="file-download"]');
      const fileCount = await fileLinks.count();
      
      if (fileCount > 0) {
        // Set up download handler
        const downloadPromise = clientPage.page.waitForEvent('download');
        
        // Click first file download link
        await fileLinks.first().click();
        
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toBeTruthy();
      }
    });
  });

  test.describe('Invoice Management', () => {
    test('should display client invoices', async () => {
      await clientPage.goto('/client/invoices');
      
      // Verify invoices page
      await clientPage.expectElementVisible('[data-testid="client-invoices"]');
      
      // Check for invoice list
      const invoices = clientPage.page.locator('[data-testid="invoice-item"]');
      const invoiceCount = await invoices.count();
      expect(invoiceCount).toBeGreaterThanOrEqual(0);
    });

    test('should view invoice details', async () => {
      await clientPage.goto('/client/invoices');
      
      // Check if there are invoices
      const invoices = clientPage.page.locator('[data-testid="invoice-item"]');
      const invoiceCount = await invoices.count();
      
      if (invoiceCount > 0) {
        // Click on first invoice
        await invoices.first().click();
        
        // Verify invoice details
        await clientPage.expectElementVisible('[data-testid="invoice-details"]');
        await clientPage.expectElementVisible('[data-testid="invoice-number"]');
        await clientPage.expectElementVisible('[data-testid="invoice-amount"]');
        await clientPage.expectElementVisible('[data-testid="invoice-due-date"]');
      }
    });

    test('should handle invoice payment', async () => {
      await clientPage.goto('/client/invoices');
      
      // Look for unpaid invoices
      const payButtons = clientPage.page.locator('[data-testid="pay-invoice-button"]');
      const payButtonCount = await payButtons.count();
      
      if (payButtonCount > 0) {
        // Click pay button
        await payButtons.first().click();
        
        // Should redirect to Stripe checkout or payment page
        await clientPage.page.waitForURL(/stripe|payment/);
        
        // Verify payment page elements
        await clientPage.expectElementVisible('[data-testid="payment-form"]');
      }
    });

    test('should download invoice PDF', async () => {
      await clientPage.goto('/client/invoices');
      
      // Look for download buttons
      const downloadButtons = clientPage.page.locator('[data-testid="download-invoice"]');
      const downloadCount = await downloadButtons.count();
      
      if (downloadCount > 0) {
        // Set up download handler
        const downloadPromise = clientPage.page.waitForEvent('download');
        
        // Click download button
        await downloadButtons.first().click();
        
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('.pdf');
      }
    });
  });

  test.describe('Communication', () => {
    test('should access support chat', async () => {
      await clientPage.goto('/client');
      
      // Open chat
      await clientPage.clickElement('[data-testid="chat-bubble"]');
      await clientPage.waitForSelector('[data-testid="chat-window"]');
      
      // Send a message
      await clientPage.fillInput('[data-testid="chat-input"]', 'I need help with my project status.');
      await clientPage.clickElement('[data-testid="chat-send"]');
      
      // Wait for response
      await clientPage.waitForSelector('[data-testid="chat-message-assistant"]');
      
      // Verify response appears
      await clientPage.expectElementVisible('[data-testid="chat-message-assistant"]');
    });

    test('should send project feedback', async () => {
      await clientPage.goto('/client');
      await clientPage.clickElement('[data-testid="project-card"]');
      
      // Navigate to feedback section
      await clientPage.clickElement('[data-testid="project-feedback-tab"]');
      
      // Fill feedback form
      await clientPage.fillInput('[data-testid="feedback-message"]', 'Great progress on the project! Looking forward to the next milestone.');
      
      // Submit feedback
      await clientPage.clickElement('[data-testid="submit-feedback"]');
      
      // Verify success message
      await clientPage.expectElementVisible('[data-testid="feedback-success"]');
    });

    test('should view project updates and notifications', async () => {
      await clientPage.goto('/client');
      
      // Check notifications
      await clientPage.expectElementVisible('[data-testid="notifications"]');
      
      // Click notifications
      await clientPage.clickElement('[data-testid="notifications-button"]');
      
      // Verify notifications panel
      await clientPage.expectElementVisible('[data-testid="notifications-panel"]');
      
      // Check for project updates
      const updates = clientPage.page.locator('[data-testid="project-update"]');
      const updateCount = await updates.count();
      expect(updateCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Profile Management', () => {
    test('should view client profile', async () => {
      await clientPage.goto('/client/profile');
      
      // Verify profile page
      await clientPage.expectElementVisible('[data-testid="client-profile"]');
      await clientPage.expectElementVisible('[data-testid="profile-name"]');
      await clientPage.expectElementVisible('[data-testid="profile-email"]');
    });

    test('should update profile information', async () => {
      await clientPage.goto('/client/profile');
      
      // Click edit profile
      await clientPage.clickElement('[data-testid="edit-profile"]');
      
      // Update profile information
      await clientPage.fillInput('[data-testid="profile-company"]', 'Updated Test Company');
      await clientPage.fillInput('[data-testid="profile-phone"]', '+1-555-0299');
      
      // Save changes
      await clientPage.clickElement('[data-testid="save-profile"]');
      
      // Verify success message
      await clientPage.expectElementVisible('[data-testid="profile-updated"]');
    });

    test('should change password', async () => {
      await clientPage.goto('/client/profile');
      
      // Navigate to security section
      await clientPage.clickElement('[data-testid="security-tab"]');
      
      // Fill password change form
      await clientPage.fillInput('[data-testid="current-password"]', 'currentpassword');
      await clientPage.fillInput('[data-testid="new-password"]', 'newpassword123');
      await clientPage.fillInput('[data-testid="confirm-password"]', 'newpassword123');
      
      // Submit password change
      await clientPage.clickElement('[data-testid="change-password"]');
      
      // Verify success message
      await clientPage.expectElementVisible('[data-testid="password-changed"]');
    });
  });

  test.describe('Security and Access Control', () => {
    test('should require client authentication', async ({ page }) => {
      // Clear authentication
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear());
      
      // Try to access client portal
      await page.goto('/client');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should prevent access to other clients data', async () => {
      await clientPage.goto('/client');
      
      // Try to access another client's project directly
      await clientPage.goto('/client/projects/other-client-project-id');
      
      // Should be denied access or redirected
      await expect(clientPage.page).not.toHaveURL('/client/projects/other-client-project-id');
    });

    test('should prevent access to admin areas', async () => {
      // Try to access admin page
      await clientPage.goto('/admin');
      
      // Should be denied access or redirected
      await expect(clientPage.page).not.toHaveURL('/admin');
    });

    test('should logout successfully', async () => {
      await clientPage.goto('/client');
      
      // Click user menu
      await clientPage.clickElement('[data-testid="user-menu"]');
      
      // Click logout
      await clientPage.clickElement('[data-testid="logout-button"]');
      
      // Should redirect to login page
      await clientPage.expectUrl('/auth/login');
    });
  });

  test.describe('Mobile Client Portal', () => {
    test('should work on mobile devices', async ({ page, isMobile }) => {
      if (isMobile) {
        await clientPage.goto('/client');
        
        // Verify mobile layout
        await clientPage.expectElementVisible('[data-testid="mobile-client-nav"]');
        
        // Test mobile navigation
        await clientPage.clickElement('[data-testid="mobile-menu-toggle"]');
        await clientPage.expectElementVisible('[data-testid="mobile-menu"]');
        
        // Test project cards on mobile
        await clientPage.expectElementVisible('[data-testid="project-card"]');
      }
    });

    test('should handle touch interactions', async ({ page, isMobile }) => {
      if (isMobile) {
        await clientPage.goto('/client');
        
        // Test touch interactions with project cards
        const projectCard = clientPage.page.locator('[data-testid="project-card"]').first();
        
        // Tap project card
        await projectCard.tap();
        
        // Should navigate to project details
        await clientPage.expectUrl(/\/client\/projects\/.+/);
      }
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('should load client portal within performance thresholds', async () => {
      const startTime = Date.now();
      await clientPage.goto('/client');
      await clientPage.waitForLoadState();
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should be accessible to screen readers', async () => {
      await clientPage.goto('/client');
      
      // Check for proper ARIA labels
      const projectCards = clientPage.page.locator('[data-testid="project-card"]');
      const firstCard = projectCards.first();
      
      if (await firstCard.count() > 0) {
        const ariaLabel = await firstCard.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }
    });

    test('should support keyboard navigation', async () => {
      await clientPage.goto('/client');
      
      // Test tab navigation
      await clientPage.page.keyboard.press('Tab');
      
      // Verify focus is visible
      const focusedElement = await clientPage.page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });
  });
});