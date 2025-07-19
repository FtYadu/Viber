import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { EmailManager } from '@/components/email/email-manager';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Email Management | Yadu Krishnan',
  description: 'Manage email templates and automation',
};

export default async function EmailManagementPage() {
  // Check authentication and authorization
  const session = await auth();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  // Only admin can access this page
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Email Management</h1>
      <EmailManager />
    </div>
  );
}