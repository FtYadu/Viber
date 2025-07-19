import { Invoice, InvoiceStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { generateInvoiceNumber } from '@/lib/utils/invoice-utils';
import { createInvoicePdf } from '@/lib/utils/pdf-generator';
import Stripe from 'stripe';

// Initialize Stripe with the API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil',
});

export interface CreateInvoiceData {
  clientId: string;
  amount: number;
  currency?: string;
  dueDate: Date;
  items?: InvoiceItem[];
  notes?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceWithClient extends Invoice {
  client: {
    name: string;
    email: string;
    company?: string | null;
    address?: string | null;
  };
}

export class InvoiceService {
  /**
   * Create a new invoice
   */
  static async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    const invoiceNumber = await generateInvoiceNumber();
    
    const invoice = await db.invoice.create({
      data: {
        number: invoiceNumber,
        invoiceNumber,
        amount: data.amount,
        currency: data.currency || 'USD',
        issueDate: new Date(),
        dueDate: data.dueDate,
        status: InvoiceStatus.DRAFT,
        client: {
          connect: { id: data.clientId }
        }
      },
    });
    
    return invoice;
  }
  
  /**
   * Get invoice by ID with client information
   */
  static async getInvoiceById(id: string): Promise<InvoiceWithClient | null> {
    return db.invoice.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            name: true,
            email: true,
            company: true,
            address: true,
          }
        }
      }
    });
  }
  
  /**
   * Get all invoices with client information
   */
  static async getAllInvoices(): Promise<InvoiceWithClient[]> {
    return db.invoice.findMany({
      include: {
        client: {
          select: {
            name: true,
            email: true,
            company: true,
            address: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
  
  /**
   * Get invoices for a specific client
   */
  static async getClientInvoices(clientId: string): Promise<Invoice[]> {
    return db.invoice.findMany({
      where: {
        clientId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
  
  /**
   * Update invoice status
   */
  static async updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    return db.invoice.update({
      where: { id },
      data: { status }
    });
  }
  
  /**
   * Mark invoice as paid
   */
  static async markAsPaid(id: string): Promise<Invoice> {
    return db.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.PAID,
        paidDate: new Date()
      }
    });
  }
  
  /**
   * Generate PDF for an invoice
   */
  static async generatePdf(invoiceId: string): Promise<Buffer> {
    const invoice = await this.getInvoiceById(invoiceId);
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    return createInvoicePdf(invoice);
  }
  
  /**
   * Create a Stripe payment intent for an invoice
   */
  static async createPaymentIntent(invoiceId: string): Promise<{ clientSecret: string }> {
    const invoice = await this.getInvoiceById(invoiceId);
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(invoice.amount * 100), // Stripe requires amount in cents
      currency: invoice.currency.toLowerCase(),
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber
      }
    });
    
    // Update the invoice status
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        status: InvoiceStatus.SENT
      }
    });
    
    return {
      clientSecret: paymentIntent.client_secret as string
    };
  }
  
  /**
   * Delete an invoice
   */
  static async deleteInvoice(id: string): Promise<void> {
    await db.invoice.delete({
      where: { id }
    });
  }
}