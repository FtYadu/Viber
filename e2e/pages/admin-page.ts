import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class AdminPage extends BasePage {
  // Locators
  readonly sidebar: Locator;
  readonly dashboardLink: Locator;
  readonly clientsLink: Locator;
  readonly projectsLink: Locator;
  readonly invoicesLink: Locator;
  readonly dnsLink: Locator;
  readonly workflowsLink: Locator;
  readonly aiToolsLink: Locator;
  readonly monitoringLink: Locator;
  readonly performanceLink: Locator;
  readonly settingsLink: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.sidebar = page.locator('[data-testid="admin-sidebar"]');
    this.dashboardLink = page.locator('[data-testid="nav-dashboard"]');
    this.clientsLink = page.locator('[data-testid="nav-clients"]');
    this.projectsLink = page.locator('[data-testid="nav-projects"]');
    this.invoicesLink = page.locator('[data-testid="nav-invoices"]');
    this.dnsLink = page.locator('[data-testid="nav-dns"]');
    this.workflowsLink = page.locator('[data-testid="nav-workflows"]');
    this.aiToolsLink = page.locator('[data-testid="nav-ai-tools"]');
    this.monitoringLink = page.locator('[data-testid="nav-monitoring"]');
    this.performanceLink = page.locator('[data-testid="nav-performance"]');
    this.settingsLink = page.locator('[data-testid="nav-settings"]');
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.logoutButton = page.locator('[data-testid="logout-button"]');
  }

  // Navigation methods
  async navigateToAdmin() {
    await this.goto('/admin');
    await this.waitForLoadState();
    await this.expectElementVisible('[data-testid="admin-sidebar"]');
  }

  async navigateToDashboard() {
    await this.clickElement('[data-testid="nav-dashboard"]');
    await this.expectUrl('/admin');
  }

  async navigateToClients() {
    await this.clickElement('[data-testid="nav-clients"]');
    await this.expectUrl('/admin/clients');
  }

  async navigateToProjects() {
    await this.clickElement('[data-testid="nav-projects"]');
    await this.expectUrl('/admin/projects');
  }

  async navigateToInvoices() {
    await this.clickElement('[data-testid="nav-invoices"]');
    await this.expectUrl('/admin/invoices');
  }

  async navigateToDns() {
    await this.clickElement('[data-testid="nav-dns"]');
    await this.expectUrl('/admin/dns');
  }

  async navigateToWorkflows() {
    await this.clickElement('[data-testid="nav-workflows"]');
    await this.expectUrl('/admin/workflows');
  }

  async navigateToAiTools() {
    await this.clickElement('[data-testid="nav-ai-tools"]');
    await this.expectUrl('/admin/ai');
  }

  async navigateToMonitoring() {
    await this.clickElement('[data-testid="nav-monitoring"]');
    await this.expectUrl('/admin/monitoring');
  }

  async navigateToPerformance() {
    await this.clickElement('[data-testid="nav-performance"]');
    await this.expectUrl('/admin/performance');
  }

  // Client management methods
  async createClient(clientData: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    address?: string;
  }) {
    await this.navigateToClients();
    
    // Click create client button
    await this.clickElement('[data-testid="create-client-button"]');
    await this.waitForSelector('[data-testid="client-form"]');
    
    // Fill form
    await this.fillInput('[data-testid="client-name"]', clientData.name);
    await this.fillInput('[data-testid="client-email"]', clientData.email);
    
    if (clientData.company) {
      await this.fillInput('[data-testid="client-company"]', clientData.company);
    }
    
    if (clientData.phone) {
      await this.fillInput('[data-testid="client-phone"]', clientData.phone);
    }
    
    if (clientData.address) {
      await this.fillInput('[data-testid="client-address"]', clientData.address);
    }
    
    // Submit form
    await this.clickElement('[data-testid="client-submit"]');
    
    // Wait for success message
    await this.waitForSelector('[data-testid="success-message"]');
  }

  async editClient(clientName: string, updates: any) {
    await this.navigateToClients();
    
    // Find and click edit button for specific client
    await this.clickElement(`[data-testid="edit-client-${clientName}"]`);
    await this.waitForSelector('[data-testid="client-form"]');
    
    // Update fields
    for (const [field, value] of Object.entries(updates)) {
      await this.fillInput(`[data-testid="client-${field}"]`, value as string);
    }
    
    // Submit form
    await this.clickElement('[data-testid="client-submit"]');
    await this.waitForSelector('[data-testid="success-message"]');
  }

  async deleteClient(clientName: string) {
    await this.navigateToClients();
    
    // Find and click delete button
    await this.clickElement(`[data-testid="delete-client-${clientName}"]`);
    
    // Confirm deletion
    await this.waitForSelector('[data-testid="confirm-dialog"]');
    await this.clickElement('[data-testid="confirm-delete"]');
    
    // Wait for success message
    await this.waitForSelector('[data-testid="success-message"]');
  }

  // Project management methods
  async createProject(projectData: {
    title: string;
    description: string;
    clientId: string;
    status?: string;
    priority?: string;
    deadline?: string;
    budget?: number;
  }) {
    await this.navigateToProjects();
    
    await this.clickElement('[data-testid="create-project-button"]');
    await this.waitForSelector('[data-testid="project-form"]');
    
    // Fill form
    await this.fillInput('[data-testid="project-title"]', projectData.title);
    await this.fillInput('[data-testid="project-description"]', projectData.description);
    await this.selectOption('[data-testid="project-client"]', projectData.clientId);
    
    if (projectData.status) {
      await this.selectOption('[data-testid="project-status"]', projectData.status);
    }
    
    if (projectData.priority) {
      await this.selectOption('[data-testid="project-priority"]', projectData.priority);
    }
    
    if (projectData.deadline) {
      await this.fillInput('[data-testid="project-deadline"]', projectData.deadline);
    }
    
    if (projectData.budget) {
      await this.fillInput('[data-testid="project-budget"]', projectData.budget.toString());
    }
    
    // Submit form
    await this.clickElement('[data-testid="project-submit"]');
    await this.waitForSelector('[data-testid="success-message"]');
  }

  async moveProjectInKanban(projectTitle: string, fromStatus: string, toStatus: string) {
    await this.navigateToProjects();
    
    // Wait for Kanban board to load
    await this.waitForSelector('[data-testid="kanban-board"]');
    
    // Find the project card
    const projectCard = this.page.locator(`[data-testid="project-card-${projectTitle}"]`);
    
    // Find the target column
    const targetColumn = this.page.locator(`[data-testid="kanban-column-${toStatus}"]`);
    
    // Perform drag and drop
    await projectCard.dragTo(targetColumn);
    
    // Wait for update to complete
    await this.waitForResponse(/\/api\/projects\/.*\/status/);
  }

  // DNS management methods
  async createDnsRecord(recordData: {
    domain: string;
    type: string;
    name: string;
    content: string;
    ttl?: number;
  }) {
    await this.navigateToDns();
    
    await this.clickElement('[data-testid="create-dns-record"]');
    await this.waitForSelector('[data-testid="dns-form"]');
    
    // Fill form
    await this.fillInput('[data-testid="dns-domain"]', recordData.domain);
    await this.selectOption('[data-testid="dns-type"]', recordData.type);
    await this.fillInput('[data-testid="dns-name"]', recordData.name);
    await this.fillInput('[data-testid="dns-content"]', recordData.content);
    
    if (recordData.ttl) {
      await this.fillInput('[data-testid="dns-ttl"]', recordData.ttl.toString());
    }
    
    // Submit form
    await this.clickElement('[data-testid="dns-submit"]');
    await this.waitForSelector('[data-testid="success-message"]');
  }

  // Workflow management methods
  async createWorkflow(workflowData: {
    name: string;
    description: string;
    webhookUrl: string;
    type: string;
  }) {
    await this.navigateToWorkflows();
    
    await this.clickElement('[data-testid="create-workflow"]');
    await this.waitForSelector('[data-testid="workflow-form"]');
    
    // Fill form
    await this.fillInput('[data-testid="workflow-name"]', workflowData.name);
    await this.fillInput('[data-testid="workflow-description"]', workflowData.description);
    await this.fillInput('[data-testid="workflow-webhook-url"]', workflowData.webhookUrl);
    await this.selectOption('[data-testid="workflow-type"]', workflowData.type);
    
    // Submit form
    await this.clickElement('[data-testid="workflow-submit"]');
    await this.waitForSelector('[data-testid="success-message"]');
  }

  async triggerWorkflow(workflowName: string) {
    await this.navigateToWorkflows();
    
    // Find and click trigger button
    await this.clickElement(`[data-testid="trigger-workflow-${workflowName}"]`);
    
    // Wait for trigger dialog
    await this.waitForSelector('[data-testid="trigger-dialog"]');
    
    // Confirm trigger
    await this.clickElement('[data-testid="confirm-trigger"]');
    
    // Wait for execution to start
    await this.waitForSelector('[data-testid="execution-started"]');
  }

  // Monitoring methods
  async checkSystemHealth() {
    await this.navigateToMonitoring();
    
    // Wait for health status to load
    await this.waitForSelector('[data-testid="system-status"]');
    
    // Get health status
    const healthStatus = await this.page.textContent('[data-testid="health-status"]');
    
    return healthStatus;
  }

  async viewErrorLogs() {
    await this.navigateToMonitoring();
    
    // Switch to error logs tab
    await this.clickElement('[data-testid="error-logs-tab"]');
    
    // Wait for logs to load
    await this.waitForSelector('[data-testid="error-log-item"]');
    
    // Get error count
    const errorCount = await this.page.locator('[data-testid="error-log-item"]').count();
    
    return errorCount;
  }

  // Performance methods
  async runPerformanceAudit() {
    await this.navigateToPerformance();
    
    // Click run audit button
    await this.clickElement('[data-testid="run-audit"]');
    
    // Wait for audit to complete
    await this.waitForSelector('[data-testid="audit-complete"]', 30000);
    
    // Get performance scores
    const performanceScore = await this.page.textContent('[data-testid="performance-score"]');
    const accessibilityScore = await this.page.textContent('[data-testid="accessibility-score"]');
    
    return {
      performance: performanceScore,
      accessibility: accessibilityScore,
    };
  }

  // Authentication methods
  async logout() {
    await this.clickElement('[data-testid="user-menu"]');
    await this.waitForSelector('[data-testid="logout-button"]');
    await this.clickElement('[data-testid="logout-button"]');
    
    // Wait for redirect to login page
    await this.expectUrl('/auth/login');
  }

  // Verification methods
  async verifyAdminAccess() {
    await this.expectElementVisible('[data-testid="admin-sidebar"]');
    await this.expectElementVisible('[data-testid="nav-dashboard"]');
    await this.expectElementVisible('[data-testid="nav-clients"]');
    await this.expectElementVisible('[data-testid="nav-projects"]');
  }

  async verifyDashboardMetrics() {
    await this.navigateToDashboard();
    
    // Check for key metrics
    await this.expectElementVisible('[data-testid="total-clients"]');
    await this.expectElementVisible('[data-testid="active-projects"]');
    await this.expectElementVisible('[data-testid="pending-invoices"]');
    await this.expectElementVisible('[data-testid="system-health"]');
    
    // Get metric values
    const totalClients = await this.page.textContent('[data-testid="total-clients-value"]');
    const activeProjects = await this.page.textContent('[data-testid="active-projects-value"]');
    
    return {
      totalClients: parseInt(totalClients || '0'),
      activeProjects: parseInt(activeProjects || '0'),
    };
  }
}