import { NextRequest, NextResponse } from 'next/server';
import { EmailQueueService } from '@/lib/services/email-queue-service';
import { WorkflowService } from '@/lib/services/workflow-service';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Get webhook type from path
    const { pathname } = new URL(request.url);
    const webhookType = pathname.split('/').pop();
    
    // Parse request body
    const body = await request.json();
    
    // Handle different webhook types
    switch (webhookType) {
      case 'invoice-follow-up':
        // Handle invoice follow-up webhook
        if (!body.invoiceId) {
          return NextResponse.json(
            { error: 'Invoice ID is required' },
            { status: 400 }
          );
        }
        
        // Queue invoice email
        const invoiceEmailId = await EmailQueueService.queueInvoiceEmail(body.invoiceId);
        
        return NextResponse.json({
          success: true,
          message: 'Invoice follow-up email queued',
          emailId: invoiceEmailId,
        });
        
      case 'project-status-update':
        // Handle project status update webhook
        if (!body.projectId || !body.message) {
          return NextResponse.json(
            { error: 'Project ID and message are required' },
            { status: 400 }
          );
        }
        
        // Queue project update email
        const projectEmailId = await EmailQueueService.queueProjectUpdateEmail(
          body.projectId,
          body.message
        );
        
        return NextResponse.json({
          success: true,
          message: 'Project status update email queued',
          emailId: projectEmailId,
        });
        
      case 'deadline-notification':
        // Handle deadline notification webhook
        if (!body.projectId) {
          return NextResponse.json(
            { error: 'Project ID is required' },
            { status: 400 }
          );
        }
        
        // Queue project update email with deadline notification
        const deadlineEmailId = await EmailQueueService.queueProjectUpdateEmail(
          body.projectId,
          `This is a reminder that your project deadline is approaching. ${
            body.daysRemaining === 0
              ? 'The deadline is today!'
              : `There are ${body.daysRemaining} days remaining.`
          }`
        );
        
        return NextResponse.json({
          success: true,
          message: 'Deadline notification email queued',
          emailId: deadlineEmailId,
        });
        
      case 'welcome-email':
        // Handle welcome email webhook
        if (!body.clientId) {
          return NextResponse.json(
            { error: 'Client ID is required' },
            { status: 400 }
          );
        }
        
        // Queue welcome email
        const welcomeEmailId = await EmailQueueService.queueWelcomeEmail(body.clientId);
        
        return NextResponse.json({
          success: true,
          message: 'Welcome email queued',
          emailId: welcomeEmailId,
        });
        
      case 'chatbot-query':
        // Handle chatbot query webhook
        // This would typically forward the query to Langflow
        // For now, we'll just return a mock response
        
        return NextResponse.json({
          success: true,
          message: 'Chatbot query processed',
          response: 'This is a mock response from the chatbot.',
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid webhook type' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Error handling n8n webhook:', error);
    
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}