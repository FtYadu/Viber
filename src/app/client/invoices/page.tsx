import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ClientInvoices } from '@/components/client/client-invoices';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Invoices | Yadu Krishnan',
  description: 'View and manage your invoices',
};

export default async function ClientInvoicesPage() {
  const session = await auth();
  
  if (!session) {
    return null;
  }
  
  // Get client information with all invoices
  const client = await db.client.findFirst({
    where: {
      user: {
        email: session.user.email,
      },
    },
    include: {
      invoices: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
  
  if (!client) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Client Profile Not Found</h2>
          <p className="text-muted-foreground">
            Please contact support to set up your client profile.
          </p>
        </div>
      </div>
    );
  }
  
  return <ClientInvoices client={client} />;
}