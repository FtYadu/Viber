import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { EmailService } from '@/lib/services/email-service';
import { EmailQueueService } from '@/lib/services/email-queue-service';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

// Schema for sending a custom email
const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1, 'Subject is required'),
  html: z.string().optional(),
  text: z.string().optional(),
  replyTo: z.string().email().optional(),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
});

// Schema for sending a template email
const sendTemplateEmailSchema = z.object({
  template: z.enum(['welcome', 'invoice', 'projectUpdate', 'passwordReset', 'contactForm']),
  to: z.union([z.string().email(), z.array(z.string().email())]),
  data: z.record(z.any()),
  options: z.object({
    replyTo: z.string().email().optional(),
    cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
    bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  }).optional(),
});

// Schema for queuing an email
const queueEmailSchema = z.object({
  type: z.enum(['welcome', 'invoice', 'project_update', 'password_reset', 'contact_form']),
  entityId: z.string().min(1, 'Entity ID is required'),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get action from query params
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // Parse request body
    const body = await request.json();
    
    // Handle different actions
    switch (action) {
      case 'send':
        // Send a custom email
        const sendData = sendEmailSchema.parse(body);
        
        const result = await EmailService.sendCustomEmail(
          sendData.to,
          sendData.subject,
          {
            html: sendData.html,
            text: sendData.text,
          },
          {
            replyTo: sendData.replyTo,
            cc: sendData.cc,
            bcc: sendData.bcc,
          }
        );
        
        return NextResponse.json(result);
        
      case 'send-template':
        // Send a template email
        const templateData = sendTemplateEmailSchema.parse(body);
        
        const templateResult = await EmailService.sendTemplateEmail(
          templateData.template as any,
          templateData.to,
          templateData.data,
          templateData.options
        );
        
        return NextResponse.json(templateResult);
        
      case 'queue':
        // Queue an email
        const queueData = queueEmailSchema.parse(body);
        
        let queueResult;
        
        switch (queueData.type) {
          case 'welcome':
            queueResult = await EmailQueueService.queueWelcomeEmail(queueData.entityId);
            break;
            
          case 'invoice':
            queueResult = await EmailQueueService.queueInvoiceEmail(queueData.entityId);
            break;
            
          case 'project_update':
            if (!queueData.message) {
              return NextResponse.json(
                { error: 'Message is required for project update emails' },
                { status: 400 }
              );
            }
            
            queueResult = await EmailQueueService.queueProjectUpdateEmail(
              queueData.entityId,
              queueData.message
            );
            break;
            
          case 'password_reset':
            // This would typically be handled by the auth system
            return NextResponse.json(
              { error: 'Password reset emails should be handled by the auth system' },
              { status: 400 }
            );
            
          case 'contact_form':
            // This would typically be handled by the contact form submission
            return NextResponse.json(
              { error: 'Contact form emails should be handled by the contact form submission' },
              { status: 400 }
            );
            
          default:
            return NextResponse.json(
              { error: 'Invalid email type' },
              { status: 400 }
            );
        }
        
        return NextResponse.json({ id: queueResult });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Error handling email request:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process email request' },
      { status: 500 }
    );
  }
}