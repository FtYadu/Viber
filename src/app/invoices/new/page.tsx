import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { InvoiceForm } from '@/components/invoices/invoice-form';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Create Invoice | Yadu Krishnan',
  description: 'Create a new invoice',
};

export default async function NewInvoicePage() {
  // Check authentication and authorization
  const session = await auth();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  // Only admin can access this page
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  
  // Fetch all clients
  const clients = await db.client.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Create New Invoice</h1>
      <InvoiceForm clients={clients} />
    </div>
  );
}