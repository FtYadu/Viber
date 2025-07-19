import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ClientProjects } from '@/components/client/client-projects';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Projects | Yadu Krishnan',
  description: 'View and manage your projects',
};

export default async function ClientProjectsPage() {
  const session = await auth();
  
  if (!session) {
    return null;
  }
  
  // Get client information with all projects
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
  
  return <ClientProjects client={client} />;
}