import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { PaymentConfirmation } from '@/components/invoices/payment-confirmation';
import { InvoiceService } from '@/lib/services/invoice-service';
import { auth } from '@/lib/auth';

interface ConfirmationPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ConfirmationPageProps): Promise<Metadata> {
  const invoice = await InvoiceService.getInvoiceById(params.id);
  
  if (!invoice) {
    return {
      title: 'Invoice Not Found | Yadu Krishnan',
    };
  }
  
  return {
    title: `Payment Confirmation | Yadu Krishnan`,
    description: `Payment confirmation for invoice ${invoice.invoiceNumber}`,
  };
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  // Check authentication
  const session = await auth();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  // Fetch the invoice
  const invoice = await InvoiceService.getInvoiceById(params.id);
  
  if (!invoice) {
    notFound();
  }
  
  // Check authorization - admin can access all invoices, clients can only access their own
  if (
    session.user.role !== 'ADMIN' &&
    invoice.client.email !== session.user.email
  ) {
    redirect('/dashboard');
  }
  
  return (
    <div className="container mx-auto py-10">
      <PaymentConfirmation invoice={invoice} />
    </div>
  );
}