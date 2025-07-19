import { EmailService } from './email-service';
import { WorkflowService } from './workflow-service';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

// Email queue types
export interface QueuedEmail {
  id: string;
  type: 'welcome' | 'invoice' | 'project_update' | 'password_reset' | 'contact_form' | 'custom';
  recipient: string;
  data: Record<string, any>;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  createdAt: Date;
  processedAt?: Date;
  error?: string;
}

/**
 * Service for managing email queue
 */
export class EmailQueueService {
  /**
   * Add an email to the queue
   */
  static async addToQueue(
    type: QueuedEmail['type'],
    recipient: string,
    data: Record<string, any>
  ): Promise<string> {
    try {
      // In a real implementation, we would store this in the database
      // For now, we'll simulate it by directly processing the email
      
      logger.info(`Adding email to queue: ${type} to ${recipient}`);
      
      // Generate a unique ID for the email
      const id = `email_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Process the email immediately (in production, this would be done by a background job)
      await this.processEmail({
        id,
        type,
        recipient,
        data,
        status: 'pending',
        attempts: 0,
        createdAt: new Date(),
      });
      
      return id;
    } catch (error) {
      logger.error('Error adding email to queue:', error);
      throw error;
    }
  }
  
  /**
   * Process an email from the queue
   */
  static async processEmail(queuedEmail: QueuedEmail): Promise<void> {
    try {
      logger.info(`Processing email: ${queuedEmail.id} (${queuedEmail.type})`);
      
      // Update status to processing
      queuedEmail.status = 'pending';
      queuedEmail.attempts += 1;
      
      // Process based on email type
      switch (queuedEmail.type) {
        case 'welcome':
          await EmailService.sendWelcomeEmail(
            queuedEmail.recipient,
            queuedEmail.data.name
          );
          break;
          
        case 'invoice':
          await EmailService.sendInvoiceEmail(
            queuedEmail.recipient,
            queuedEmail.data as any
          );
          break;
          
        case 'project_update':
          await EmailService.sendProjectUpdateEmail(
            queuedEmail.recipient,
            queuedEmail.data as any
          );
          break;
          
        case 'password_reset':
          await EmailService.sendPasswordResetEmail(
            queuedEmail.recipient,
            queuedEmail.data as any
          );
          break;
          
        case 'contact_form':
          await EmailService.forwardContactForm(queuedEmail.data as any);
          break;
          
        case 'custom':
          await EmailService.sendCustomEmail(
            queuedEmail.recipient,
            queuedEmail.data.subject,
            {
              html: queuedEmail.data.html,
              text: queuedEmail.data.text,
            },
            queuedEmail.data.options
          );
          break;
          
        default:
          throw new Error(`Unknown email type: ${queuedEmail.type}`);
      }
      
      // Update status to sent
      queuedEmail.status = 'sent';
      queuedEmail.processedAt = new Date();
      
      logger.info(`Email processed successfully: ${queuedEmail.id}`);
    } catch (error) {
      logger.error(`Error processing email ${queuedEmail.id}:`, error);
      
      // Update status to failed
      queuedEmail.status = 'failed';
      queuedEmail.error = error instanceof Error ? error.message : String(error);
      
      // If we've tried less than 3 times, requeue the email
      if (queuedEmail.attempts < 3) {
        logger.info(`Requeuing email ${queuedEmail.id} (attempt ${queuedEmail.attempts + 1})`);
        
        // In a real implementation, we would update the database record
        // and have a background job that retries failed emails
        
        // For now, we'll simulate it by waiting and retrying
        setTimeout(() => {
          this.processEmail(queuedEmail).catch(err => {
            logger.error(`Error reprocessing email ${queuedEmail.id}:`, err);
          });
        }, 5000); // Wait 5 seconds before retrying
      }
    }
  }
  
  /**
   * Queue a welcome email
   */
  static async queueWelcomeEmail(clientId: string): Promise<string> {
    try {
      // Get client information
      const client = await db.client.findUnique({
        where: { id: clientId },
      });
      
      if (!client) {
        throw new Error(`Client not found: ${clientId}`);
      }
      
      // Queue the email
      return this.addToQueue('welcome', client.email, {
        name: client.name,
      });
    } catch (error) {
      logger.error('Error queuing welcome email:', error);
      throw error;
    }
  }
  
  /**
   * Queue an invoice email
   */
  static async queueInvoiceEmail(invoiceId: string): Promise<string> {
    try {
      // Get invoice information with client
      const invoice = await db.invoice.findUnique({
        where: { id: invoiceId },
        include: { client: true },
      });
      
      if (!invoice) {
        throw new Error(`Invoice not found: ${invoiceId}`);
      }
      
      // Generate payment link
      const paymentLink = `${process.env.NEXTAUTH_URL}/client/invoices/${invoice.id}/payment`;
      
      // Format amount and due date
      const amount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: invoice.currency,
      }).format(invoice.amount);
      
      const dueDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(invoice.dueDate);
      
      // Queue the email
      return this.addToQueue('invoice', invoice.client.email, {
        clientName: invoice.client.name,
        invoiceNumber: invoice.invoiceNumber,
        amount,
        dueDate,
        paymentLink,
      });
    } catch (error) {
      logger.error('Error queuing invoice email:', error);
      throw error;
    }
  }
  
  /**
   * Queue a project update email
   */
  static async queueProjectUpdateEmail(
    projectId: string,
    message: string
  ): Promise<string> {
    try {
      // Get project information with client
      const project = await db.project.findUnique({
        where: { id: projectId },
        include: { client: true },
      });
      
      if (!project) {
        throw new Error(`Project not found: ${projectId}`);
      }
      
      // Generate project link
      const projectLink = `${process.env.NEXTAUTH_URL}/client/projects/${project.id}`;
      
      // Queue the email
      return this.addToQueue('project_update', project.client.email, {
        clientName: project.client.name,
        projectName: project.title,
        status: project.status,
        message,
        projectLink,
      });
    } catch (error) {
      logger.error('Error queuing project update email:', error);
      throw error;
    }
  }
  
  /**
   * Queue a password reset email
   */
  static async queuePasswordResetEmail(
    userId: string,
    resetToken: string
  ): Promise<string> {
    try {
      // Get user information
      const user = await db.user.findUnique({
        where: { id: userId },
      });
      
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }
      
      // Generate reset link
      const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
      
      // Queue the email
      return this.addToQueue('password_reset', user.email!, {
        name: user.name || user.email || 'User',
        resetLink,
      });
    } catch (error) {
      logger.error('Error queuing password reset email:', error);
      throw error;
    }
  }
  
  /**
   * Queue a contact form email
   */
  static async queueContactFormEmail(
    name: string,
    email: string,
    subject: string,
    message: string
  ): Promise<string> {
    try {
      // Queue the email
      return this.addToQueue('contact_form', '', {
        name,
        email,
        subject,
        message,
      });
    } catch (error) {
      logger.error('Error queuing contact form email:', error);
      throw error;
    }
  }
}