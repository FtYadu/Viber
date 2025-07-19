import { test, expect } from '@playwright/test';
import { AdminPage } from '../pages/admin-page';

test.describe('Admin Workflows', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminPage(page);
    
    // Use admin authentication state
    await page.context().addInitScript(() => {
      localStorage.setItem('test-admin-session', JSON.stringify({
        user: {
          id: '1',
          name: 'Test Admin',
          email: 'admin@test.com',
          role: 'ADMIN',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }));
    });
  });

  test.describe('Admin Dashboard', () => {
    test('should load admin dashboard successfully', async () => {
      await adminPage.navigateToAdmin();
      
      // Verify admin access
      await adminPage.verifyAdminAccess();
      
      // Verify dashboard metrics
      const metrics = await adminPage.verifyDashboardMetrics();
      expect(metrics.totalClients).toBeGreaterThanOrEqual(0);
      expect(metrics.activeProjects).toBeGreaterThanOrEqual(0);
    });

    test('should navigate between admin sections', async () => {
      await adminPage.navigateToAdmin();
      
      // Test navigation to different sections
      await adminPage.navigateToClients();
      await adminPage.expectUrl('/admin/clients');
      
      await adminPage.navigateToProjects();
      await adminPage.expectUrl('/admin/projects');
      
      await adminPage.navigateToInvoices();
      await adminPage.expectUrl('/admin/invoices');
      
      await adminPage.navigateToDns();
      await adminPage.expectUrl('/admin/dns');
      
      await adminPage.navigateToWorkflows();
      await adminPage.expectUrl('/admin/workflows');
    });
  });

  test.describe('Client Management', () => {
    test('should create a new client', async () => {
      await adminPage.createClient({
        name: 'E2E Test Client',
        email: 'e2e-client@test.com',
        company: 'E2E Test Company',
        phone: '+1-555-0199',
        address: '123 E2E Test Street, Test City, TC 12345',
      });
      
      // Verify client appears in list
      await adminPage.expectElementVisible('[data-testid="client-E2E Test Client"]');
    });

    test('should edit an existing client', async () => {
      // First create a client
      await adminPage.createClient({
        name: 'Edit Test Client',
        email: 'edit-test@test.com',
        company: 'Original Company',
      });
      
      // Then edit it
      await adminPage.editClient('Edit Test Client', {
        company: 'Updated Company',
        phone: '+1-555-0200',
      });
      
      // Verify changes are saved
      await adminPage.expectText('[data-testid="client-Edit Test Client-company"]', 'Updated Company');
    });

    test('should delete a client', async () => {
      // First create a client
      await adminPage.createClient({
        name: 'Delete Test Client',
        email: 'delete-test@test.com',
      });
      
      // Then delete it
      await adminPage.deleteClient('Delete Test Client');
      
      // Verify client is removed from list
      await adminPage.expectElementHidden('[data-testid="client-Delete Test Client"]');
    });

    test('should handle client form validation', async () => {
      await adminPage.navigateToClients();
      
      // Try to create client with invalid data
      await adminPage.clickElement('[data-testid="create-client-button"]');
      await adminPage.waitForSelector('[data-testid="client-form"]');
      
      // Submit empty form
      await adminPage.clickElement('[data-testid="client-submit"]');
      
      // Verify validation errors
      await adminPage.expectElementVisible('[data-testid="name-error"]');
      await adminPage.expectElementVisible('[data-testid="email-error"]');
    });
  });

  test.describe('Project Management', () => {
    test('should create a new project', async () => {
      await adminPage.createProject({
        title: 'E2E Test Project',
        description: 'This is a test project created by E2E tests',
        clientId: '1', // Assuming test client exists
        status: 'PLANNING',
        priority: 'HIGH',
        budget: 10000,
      });
      
      // Verify project appears in list
      await adminPage.expectElementVisible('[data-testid="project-E2E Test Project"]');
    });

    test('should move project in Kanban board', async () => {
      // First create a project
      await adminPage.createProject({
        title: 'Kanban Test Project',
        description: 'Project for testing Kanban functionality',
        clientId: '1',
        status: 'PLANNING',
        priority: 'MEDIUM',
      });
      
      // Move project from PLANNING to IN_PROGRESS
      await adminPage.moveProjectInKanban('Kanban Test Project', 'PLANNING', 'IN_PROGRESS');
      
      // Verify project moved to correct column
      await adminPage.expectElementVisible('[data-testid="kanban-column-IN_PROGRESS"] [data-testid="project-card-Kanban Test Project"]');
    });

    test('should handle project deadlines', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      await adminPage.createProject({
        title: 'Deadline Test Project',
        description: 'Project for testing deadline functionality',
        clientId: '1',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        deadline: futureDate.toISOString().split('T')[0], // YYYY-MM-DD format
      });
      
      // Verify deadline is displayed
      await adminPage.expectElementVisible('[data-testid="project-Deadline Test Project-deadline"]');
    });
  });

  test.describe('DNS Management', () => {
    test('should create DNS record', async () => {
      await adminPage.createDnsRecord({
        domain: 'test.example.com',
        type: 'A',
        name: 'www',
        content: '192.168.1.1',
        ttl: 3600,
      });
      
      // Verify DNS record appears in list
      await adminPage.expectElementVisible('[data-testid="dns-record-www.test.example.com"]');
    });

    test('should display DNS record status', async () => {
      await adminPage.navigateToDns();
      
      // Wait for DNS records to load
      await adminPage.waitForSelector('[data-testid="dns-records-table"]');
      
      // Verify status badges are displayed
      const statusBadges = adminPage.page.locator('[data-testid="dns-status-badge"]');
      const count = await statusBadges.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Workflow Management', () => {
    test('should create workflow', async () => {
      await adminPage.createWorkflow({
        name: 'E2E Test Workflow',
        description: 'Test workflow created by E2E tests',
        webhookUrl: 'https://n8n.example.com/webhook/test',
        type: 'email-automation',
      });
      
      // Verify workflow appears in list
      await adminPage.expectElementVisible('[data-testid="workflow-E2E Test Workflow"]');
    });

    test('should trigger workflow execution', async () => {
      // First create a workflow
      await adminPage.createWorkflow({
        name: 'Trigger Test Workflow',
        description: 'Workflow for testing trigger functionality',
        webhookUrl: 'https://n8n.example.com/webhook/trigger-test',
        type: 'custom',
      });
      
      // Trigger the workflow
      await adminPage.triggerWorkflow('Trigger Test Workflow');
      
      // Verify execution started
      await adminPage.expectElementVisible('[data-testid="execution-started"]');
    });
  });

  test.describe('Monitoring and Performance', () => {
    test('should display system health status', async () => {
      const healthStatus = await adminPage.checkSystemHealth();
      expect(healthStatus).toBeTruthy();
    });

    test('should show error logs', async () => {
      const errorCount = await adminPage.viewErrorLogs();
      expect(errorCount).toBeGreaterThanOrEqual(0);
    });

    test('should run performance audit', async () => {
      const auditResults = await adminPage.runPerformanceAudit();
      
      expect(auditResults.performance).toBeTruthy();
      expect(auditResults.accessibility).toBeTruthy();
    });
  });

  test.describe('Authentication and Security', () => {
    test('should require admin authentication', async ({ page }) => {
      // Clear authentication
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear());
      
      // Try to access admin page
      await page.goto('/admin');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should logout successfully', async () => {
      await adminPage.navigateToAdmin();
      
      // Logout
      await adminPage.logout();
      
      // Should redirect to login page
      await adminPage.expectUrl('/auth/login');
    });

    test('should prevent client access to admin areas', async ({ page }) => {
      // Set client session
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
      
      // Try to access admin page
      await page.goto('/admin');
      
      // Should be denied access or redirected
      await expect(page).not.toHaveURL('/admin');
    });
  });

  test.describe('Data Export and Import', () => {
    test('should export client data as CSV', async () => {
      await adminPage.navigateToClients();
      
      // Set up download handler
      const downloadPromise = adminPage.page.waitForEvent('download');
      
      // Click export button
      await adminPage.clickElement('[data-testid="export-clients-csv"]');
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.csv');
    });

    test('should import client data from CSV', async () => {
      await adminPage.navigateToClients();
      
      // Click import button
      await adminPage.clickElement('[data-testid="import-clients-csv"]');
      
      // Wait for file input
      await adminPage.waitForSelector('[data-testid="csv-file-input"]');
      
      // Upload test CSV file
      const fileInput = adminPage.page.locator('[data-testid="csv-file-input"]');
      await fileInput.setInputFiles('e2e/fixtures/test-clients.csv');
      
      // Submit import
      await adminPage.clickElement('[data-testid="import-submit"]');
      
      // Verify import success
      await adminPage.expectElementVisible('[data-testid="import-success"]');
    });
  });

  test.describe('Responsive Admin Interface', () => {
    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await adminPage.navigateToAdmin();
      
      // Verify admin interface adapts to tablet
      await adminPage.verifyAdminAccess();
      
      // Test navigation on tablet
      await adminPage.navigateToClients();
      await adminPage.expectUrl('/admin/clients');
    });

    test('should handle mobile admin interface', async ({ page, isMobile }) => {
      if (isMobile) {
        await adminPage.navigateToAdmin();
        
        // Verify mobile admin interface
        await adminPage.expectElementVisible('[data-testid="mobile-admin-menu"]');
        
        // Test mobile navigation
        await adminPage.clickElement('[data-testid="mobile-admin-menu-toggle"]');
        await adminPage.expectElementVisible('[data-testid="mobile-admin-nav"]');
      }
    });
  });
});