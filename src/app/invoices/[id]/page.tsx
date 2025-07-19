import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { InvoiceDetail } from '@/components/invoices/invoice-detail';
import { InvoiceService } from '@/lib/services/invoice-service';
import { auth } from '@/lib/auth';

interface InvoicePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: InvoicePageProps): Promise<Metadata> {
  const invoice = await InvoiceService.getInvoiceById(params.id);
  
  if (!invoice) {
    return {
      title: 'Invoice Not Found | Yadu Krishnan',
    };
  }
  
  return {
    title: `Invoice ${invoice.invoiceNumber} | Yadu Krishnan`,
    description: `Invoice details for ${invoice.invoiceNumber}`,
  };
}

export default async function InvoicePage({ params }: InvoicePageProps) {
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
  
  // Check authorization - admin can view all invoices, clients can only view their own
  if (
    session.user.role !== 'ADMIN' &&
    invoice.client.email !== session.user.email
  ) {
    redirect('/dashboard');
  }
  
  return (
    <div className="container mx-auto py-10">
      <InvoiceDetail invoice={invoice} />
    </div>
  );
}