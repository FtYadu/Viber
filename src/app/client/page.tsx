import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ClientDashboard } from '@/components/client/client-dashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Client Dashboard | Yadu Krishnan',
  description: 'View your projects, invoices, and support requests',
};

export default async function ClientDashboardPage() {
  const session = await auth();
  
  if (!session) {
    return null;
  }
  
  // Get client information
  const client = await db.client.findFirst({
    where: {
      user: {
        email: session.user.email,
      },
    },
    include: {
      projects: {
        orderBy: {
          updatedAt: 'desc',
        },
        take: 5,
      },
      invoices: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
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
  
  return <ClientDashboard client={client} />;
}