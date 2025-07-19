import { logger } from '@/lib/logger';

// n8n webhook URL from environment variables
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

/**
 * Service for interacting with n8n workflows
 */
export class WorkflowService {
  /**
   * Trigger an n8n workflow via webhook
   */
  static async triggerWorkflow(
    workflowName: string,
    payload: Record<string, any>
  ): Promise<any> {
    try {
      if (!N8N_WEBHOOK_URL) {
        logger.warn(`N8N_WEBHOOK_URL not configured. Workflow "${workflowName}" not triggered.`);
        return { success: false, message: 'N8N webhook URL not configured' };
      }
      
      // In development, log the workflow trigger instead of actually triggering it
      if (process.env.NODE_ENV === 'development') {
        logger.info(`Would trigger n8n workflow "${workflowName}" with payload:`, payload);
        return { success: true, message: 'Workflow trigger simulated in development' };
      }
      
      // In production, trigger the actual n8n webhook
      const response = await fetch(`${N8N_WEBHOOK_URL}/${workflowName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to trigger workflow: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      logger.error(`Error triggering n8n workflow "${workflowName}":`, error);
      throw error;
    }
  }
  
  /**
   * Trigger invoice follow-up workflow
   */
  static async triggerInvoiceFollowUp(invoiceId: string, clientId: string): Promise<any> {
    return this.triggerWorkflow('invoice-follow-up', {
      invoiceId,
      clientId,
      timestamp: new Date().toISOString(),
    });
  }
  
  /**
   * Trigger project status update workflow
   */
  static async triggerProjectStatusUpdate(
    projectId: string,
    status: string,
    clientId: string
  ): Promise<any> {
    return this.triggerWorkflow('project-status-update', {
      projectId,
      status,
      clientId,
      timestamp: new Date().toISOString(),
    });
  }
  
  /**
   * Trigger deadline notification workflow
   */
  static async triggerDeadlineNotification(
    projectId: string,
    clientId: string,
    daysRemaining: number
  ): Promise<any> {
    return this.triggerWorkflow('deadline-notification', {
      projectId,
      clientId,
      daysRemaining,
      timestamp: new Date().toISOString(),
    });
  }
  
  /**
   * Trigger welcome email workflow
   */
  static async triggerWelcomeEmail(clientId: string): Promise<any> {
    return this.triggerWorkflow('welcome-email', {
      clientId,
      timestamp: new Date().toISOString(),
    });
  }
  
  /**
   * Trigger AI chatbot workflow
   */
  static async triggerChatbotQuery(
    message: string,
    sessionId: string
  ): Promise<any> {
    return this.triggerWorkflow('chatbot-query', {
      message,
      sessionId,
      timestamp: new Date().toISOString(),
    });
  }
}