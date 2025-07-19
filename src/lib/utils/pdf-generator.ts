import PDFDocument from 'pdfkit';
import { InvoiceWithClient } from '@/lib/services/invoice-service';
import { formatCurrency } from './invoice-utils';
import { format } from 'date-fns';

/**
 * Create a PDF invoice document
 */
export async function createInvoicePdf(invoice: InvoiceWithClient): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Collect the PDF data chunks
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Add company information
      doc.fontSize(20).text('Yadu Krishnan', { align: 'right' });
      doc.fontSize(10)
        .text('Web Development & Design Services', { align: 'right' })
        .text('contact@yadukrishnan.com', { align: 'right' })
        .text('San Francisco, CA', { align: 'right' })
        .moveDown(2);
      
      // Add invoice header
      doc.fontSize(24).text('INVOICE', { align: 'center' }).moveDown(0.5);
      doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'center' });
      doc.text(`Date: ${format(invoice.createdAt, 'MMMM dd, yyyy')}`, { align: 'center' });
      doc.text(`Due Date: ${format(invoice.dueDate, 'MMMM dd, yyyy')}`, { align: 'center' }).moveDown(2);
      
      // Add client information
      doc.fontSize(14).text('Bill To:').moveDown(0.5);
      doc.fontSize(12)
        .text(invoice.client.name)
        .text(invoice.client.email);
      
      if (invoice.client.company) {
        doc.text(invoice.client.company);
      }
      
      if (invoice.client.address) {
        doc.text(invoice.client.address);
      }
      
      doc.moveDown(2);
      
      // Add invoice details
      const invoiceTableTop = doc.y;
      
      // Add table headers
      doc.fontSize(12)
        .text('Description', 50, invoiceTableTop, { width: 250 })
        .text('Amount', 300, invoiceTableTop, { width: 90, align: 'right' })
        .moveDown(0.5);
      
      // Add separator line
      doc.moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(0.5);
      
      // Add invoice amount
      doc.text('Services Rendered', 50, doc.y, { width: 250 })
        .text(formatCurrency(invoice.amount, invoice.currency), 300, doc.y, { width: 90, align: 'right' })
        .moveDown(0.5);
      
      // Add separator line
      doc.moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(0.5);
      
      // Add total
      doc.fontSize(12)
        .text('Total:', 300, doc.y, { width: 90, align: 'right' })
        .text(formatCurrency(invoice.amount, invoice.currency), 400, doc.y, { width: 90, align: 'right' })
        .moveDown(2);
      
      // Add payment instructions
      doc.fontSize(12)
        .text('Payment Instructions:', { underline: true })
        .moveDown(0.5)
        .text('Please use the secure payment link provided in the email to make your payment.')
        .moveDown(0.5)
        .text('Thank you for your business!', { align: 'center' })
        .moveDown(2);
      
      // Add footer
      const footerTop = doc.page.height - 100;
      doc.fontSize(10)
        .text('This is an electronically generated invoice and does not require a signature.', 50, footerTop, { align: 'center' });
      
      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}