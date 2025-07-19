import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { InvoiceList } from '@/components/invoices/invoice-list';
import { InvoiceService } from '@/lib/services/invoice-service';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Invoices | Yadu Krishnan',
  description: 'Manage your invoices and payments',
};

export default async function InvoicesPage() {
  // Check authentication and authorization
  const session = await auth();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  // Only admin can access this page
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  
  // Fetch all invoices
  const invoices = await InvoiceService.getAllInvoices();
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Invoices</h1>
      <InvoiceList invoices={invoices} />
    </div>
  );
}