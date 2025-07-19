import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { InvoiceService } from '@/lib/services/invoice-service';
import { PaymentForm } from '@/components/invoices/payment-form';

interface PaymentPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PaymentPageProps): Promise<Metadata> {
  const invoice = await InvoiceService.getInvoiceById(params.id);
  
  if (!invoice) {
    return {
      title: 'Invoice Not Found | Yadu Krishnan',
    };
  }
  
  return {
    title: `Pay Invoice ${invoice.invoiceNumber} | Yadu Krishnan`,
    description: `Payment page for invoice ${invoice.invoiceNumber}`,
  };
}

export default async function ClientPaymentPage({ params }: PaymentPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  // Fetch the invoice
  const invoice = await InvoiceService.getInvoiceById(params.id);
  
  if (!invoice) {
    notFound();
  }
  
  // Check if invoice is already paid
  if (invoice.status === 'PAID') {
    redirect(`/client/invoices/${params.id}`);
  }
  
  // Check authorization - clients can only pay their own invoices
  if (invoice.client.email !== session.user.email) {
    redirect('/unauthorized');
  }
  
  // Get Stripe publishable key
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  if (!stripePublishableKey) {
    throw new Error('Missing Stripe publishable key');
  }
  
  return (
    <div className="container mx-auto py-10">
      <PaymentForm invoice={invoice} stripePublishableKey={stripePublishableKey} />
    </div>
  );
}