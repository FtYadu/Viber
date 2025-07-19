import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { InvoiceService } from '@/lib/services/invoice-service';
import { ClientInvoiceDetail } from '@/components/client/client-invoice-detail';

interface InvoiceDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: InvoiceDetailPageProps): Promise<Metadata> {
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

export default async function ClientInvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  // Fetch the invoice
  const invoice = await InvoiceService.getInvoiceById(params.id);
  
  if (!invoice) {
    notFound();
  }
  
  // Check authorization - clients can only view their own invoices
  if (invoice.client.email !== session.user.email) {
    redirect('/unauthorized');
  }
  
  return <ClientInvoiceDetail invoice={invoice} />;
}