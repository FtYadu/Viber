import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ClientSidebar } from '@/components/client/client-sidebar';
import { ClientHeader } from '@/components/client/client-header';

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication and authorization
  const session = await auth();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  // Only clients can access this section
  if (session.user.role !== 'CLIENT') {
    redirect('/unauthorized');
  }
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <ClientSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <ClientHeader />
        <main className="flex-1 p-6 overflow-auto bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}