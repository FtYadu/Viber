import { db } from '@/lib/db';
import { format } from 'date-fns';

/**
 * Generate a unique invoice number with format INV-YYYYMMDD-XXXX
 * where XXXX is a sequential number
 */
export async function generateInvoiceNumber(): Promise<string> {
  const today = new Date();
  const dateStr = format(today, 'yyyyMMdd');
  
  // Get the count of invoices created today to generate a sequential number
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));
  
  const invoiceCount = await db.invoice.count({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd
      }
    }
  });
  
  // Generate a 4-digit sequential number with leading zeros
  const sequentialNumber = String(invoiceCount + 1).padStart(4, '0');
  
  return `INV-${dateStr}-${sequentialNumber}`;
}

/**
 * Calculate if an invoice is overdue
 */
export function isInvoiceOverdue(dueDate: Date): boolean {
  const today = new Date();
  return dueDate < today;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Calculate days until due or days overdue
 */
export function calculateDueDays(dueDate: Date): { days: number; overdue: boolean } {
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    days: Math.abs(diffDays),
    overdue: diffDays < 0
  };
}

/**
 * Get status badge color based on invoice status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-200 text-gray-800';
    case 'SENT':
      return 'bg-blue-100 text-blue-800';
    case 'PAID':
      return 'bg-green-100 text-green-800';
    case 'OVERDUE':
      return 'bg-red-100 text-red-800';
    case 'CANCELLED':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}