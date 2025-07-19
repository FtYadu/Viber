import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ClientSupport } from '@/components/client/client-support';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Support | Yadu Krishnan',
  description: 'Get help and support for your projects',
};

export default async function ClientSupportPage() {
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
  
  return <ClientSupport client={client} />;
}