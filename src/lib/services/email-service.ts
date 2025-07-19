import { EmailTemplate } from '@/types';
import { logger } from '@/lib/logger';

// Mock Resend API for development
// In production, this would be replaced with the actual Resend API client
class ResendClient {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
  }

  async sendEmail({
    from,
    to,
    subject,
    html,
    text,
    replyTo,
    cc,
    bcc,
    attachments,
  }: {
    from?: string;
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    replyTo?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: Array<{
      filename: string;
      content: Buffer;
      contentType?: string;
    }>;
  }) {
    // In development, log the email instead of sending it
    if (process.env.NODE_ENV === 'development') {
      logger.info('Email would be sent with the following details:');
      logger.info(`From: ${from || this.fromEmail}`);
      logger.info(`To: ${Array.isArray(to) ? to.join(', ') : to}`);
      logger.info(`Subject: ${subject}`);
      if (cc) logger.info(`CC: ${Array.isArray(cc) ? cc.join(', ') : cc}`);
      if (bcc) logger.info(`BCC: ${Array.isArray(bcc) ? bcc.join(', ') : bcc}`);
      if (replyTo) logger.info(`Reply-To: ${replyTo}`);
      if (html) logger.info(`HTML: ${html.substring(0, 100)}...`);
      if (text) logger.info(`Text: ${text.substring(0, 100)}...`);
      if (attachments) logger.info(`Attachments: ${attachments.length}`);
      
      return { id: 'mock-email-id', status: 'success' };
    }

    // In production, use the Resend API
    try {
      // This would be the actual API call in production
      // const { data, error } = await resend.emails.send({
      //   from: from || this.fromEmail,
      //   to,
      //   subject,
      //   html,
      //   text,
      //   reply_to: replyTo,
      //   cc,
      //   bcc,
      //   attachments,
      // });
      
      // if (error) {
      //   throw new Error(`Failed to send email: ${error.message}`);
      // }
      
      // return { id: data.id, status: 'success' };
      
      // For now, return a mock response
      return { id: 'mock-email-id', status: 'success' };
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }
}

// Initialize Resend client
const resendClient = new ResendClient(
  process.env.RESEND_API_KEY || '',
  process.env.FROM_EMAIL || 'noreply@yadukrishnan.com'
);

// Email templates
const templates: Record<string, (data: any) => { subject: string; html: string; text: string }> = {
  welcome: (data: { name: string }) => ({
    subject: 'Welcome to Yadu Krishnan Services',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome, ${data.name}!</h1>
        <p>Thank you for joining Yadu Krishnan Services. We're excited to work with you!</p>
        <p>You can now access your client portal to view your projects, invoices, and more.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/client" style="background-color: #0f172a; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
            Access Client Portal
          </a>
        </div>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Best regards,<br>Yadu Krishnan</p>
      </div>
    `,
    text: `Welcome, ${data.name}!\n\nThank you for joining Yadu Krishnan Services. We're excited to work with you!\n\nYou can now access your client portal to view your projects, invoices, and more at: ${process.env.NEXTAUTH_URL}/client\n\nIf you have any questions, feel free to reply to this email.\n\nBest regards,\nYadu Krishnan`,
  }),
  
  invoice: (data: { clientName: string; invoiceNumber: string; amount: string; dueDate: string; paymentLink: string }) => ({
    subject: `Invoice ${data.invoiceNumber} - Yadu Krishnan Services`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Invoice ${data.invoiceNumber}</h1>
        <p>Dear ${data.clientName},</p>
        <p>Your invoice ${data.invoiceNumber} for ${data.amount} has been created and is due on ${data.dueDate}.</p>
        <div style="margin: 30px 0;">
          <a href="${data.paymentLink}" style="background-color: #0f172a; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
            Pay Invoice
          </a>
        </div>
        <p>You can also view and download your invoice from your client portal.</p>
        <p>Thank you for your business!</p>
        <p>Best regards,<br>Yadu Krishnan</p>
      </div>
    `,
    text: `Invoice ${data.invoiceNumber}\n\nDear ${data.clientName},\n\nYour invoice ${data.invoiceNumber} for ${data.amount} has been created and is due on ${data.dueDate}.\n\nYou can pay your invoice at: ${data.paymentLink}\n\nYou can also view and download your invoice from your client portal.\n\nThank you for your business!\n\nBest regards,\nYadu Krishnan`,
  }),
  
  projectUpdate: (data: { clientName: string; projectName: string; status: string; message: string; projectLink: string }) => ({
    subject: `Project Update: ${data.projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Project Update: ${data.projectName}</h1>
        <p>Dear ${data.clientName},</p>
        <p>Your project "${data.projectName}" has been updated to status: <strong>${data.status}</strong></p>
        <p>${data.message}</p>
        <div style="margin: 30px 0;">
          <a href="${data.projectLink}" style="background-color: #0f172a; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
            View Project
          </a>
        </div>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Best regards,<br>Yadu Krishnan</p>
      </div>
    `,
    text: `Project Update: ${data.projectName}\n\nDear ${data.clientName},\n\nYour project "${data.projectName}" has been updated to status: ${data.status}\n\n${data.message}\n\nYou can view your project at: ${data.projectLink}\n\nIf you have any questions, feel free to reply to this email.\n\nBest regards,\nYadu Krishnan`,
  }),
  
  passwordReset: (data: { name: string; resetLink: string }) => ({
    subject: 'Password Reset - Yadu Krishnan Services',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset</h1>
        <p>Dear ${data.name},</p>
        <p>We received a request to reset your password. Click the button below to reset your password:</p>
        <div style="margin: 30px 0;">
          <a href="${data.resetLink}" style="background-color: #0f172a; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </div>
        <p>If you didn't request a password reset, you can ignore this email.</p>
        <p>Best regards,<br>Yadu Krishnan</p>
      </div>
    `,
    text: `Password Reset\n\nDear ${data.name},\n\nWe received a request to reset your password. Click the link below to reset your password:\n\n${data.resetLink}\n\nIf you didn't request a password reset, you can ignore this email.\n\nBest regards,\nYadu Krishnan`,
  }),
  
  contactForm: (data: { name: string; email: string; subject: string; message: string }) => ({
    subject: `Contact Form: ${data.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px;">
          ${data.message.replace(/\n/g, '<br>')}
        </div>
      </div>
    `,
    text: `New Contact Form Submission\n\nName: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}\n\nMessage:\n${data.message}`,
  }),
};

export class EmailService {
  /**
   * Send an email using a template
   */
  static async sendTemplateEmail<T extends keyof typeof templates>(
    template: T,
    to: string | string[],
    data: Parameters<typeof templates[T]>[0],
    options: {
      from?: string;
      replyTo?: string;
      cc?: string | string[];
      bcc?: string | string[];
      attachments?: Array<{
        filename: string;
        content: Buffer;
        contentType?: string;
      }>;
    } = {}
  ) {
    try {
      const templateFn = templates[template];
      if (!templateFn) {
        throw new Error(`Template "${template}" not found`);
      }
      
      const { subject, html, text } = templateFn(data);
      
      return await resendClient.sendEmail({
        to,
        subject,
        html,
        text,
        ...options,
      });
    } catch (error) {
      logger.error(`Error sending ${template} email:`, error);
      throw error;
    }
  }
  
  /**
   * Send a custom email
   */
  static async sendCustomEmail(
    to: string | string[],
    subject: string,
    content: { html?: string; text?: string },
    options: {
      from?: string;
      replyTo?: string;
      cc?: string | string[];
      bcc?: string | string[];
      attachments?: Array<{
        filename: string;
        content: Buffer;
        contentType?: string;
      }>;
    } = {}
  ) {
    try {
      return await resendClient.sendEmail({
        to,
        subject,
        html: content.html,
        text: content.text,
        ...options,
      });
    } catch (error) {
      logger.error('Error sending custom email:', error);
      throw error;
    }
  }
  
  /**
   * Send a welcome email to a new client
   */
  static async sendWelcomeEmail(to: string, name: string) {
    return this.sendTemplateEmail('welcome', to, { name });
  }
  
  /**
   * Send an invoice email to a client
   */
  static async sendInvoiceEmail(
    to: string,
    data: {
      clientName: string;
      invoiceNumber: string;
      amount: string;
      dueDate: string;
      paymentLink: string;
    }
  ) {
    return this.sendTemplateEmail('invoice', to, data);
  }
  
  /**
   * Send a project update email to a client
   */
  static async sendProjectUpdateEmail(
    to: string,
    data: {
      clientName: string;
      projectName: string;
      status: string;
      message: string;
      projectLink: string;
    }
  ) {
    return this.sendTemplateEmail('projectUpdate', to, data);
  }
  
  /**
   * Send a password reset email
   */
  static async sendPasswordResetEmail(
    to: string,
    data: {
      name: string;
      resetLink: string;
    }
  ) {
    return this.sendTemplateEmail('passwordReset', to, data);
  }
  
  /**
   * Forward contact form submissions
   */
  static async forwardContactForm(
    data: {
      name: string;
      email: string;
      subject: string;
      message: string;
    }
  ) {
    // Forward to admin email
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@yadukrishnan.com';
    
    return this.sendTemplateEmail('contactForm', adminEmail, data, {
      replyTo: data.email,
    });
  }
}