import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DNSManager } from '@/components/dns/dns-manager';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'DNS Management | Yadu Krishnan',
  description: 'Manage DNS records for your domains',
};

export default async function DNSManagementPage() {
  // Check authentication and authorization
  const session = await auth();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  // Only admin can access this page
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  
  // Fetch all DNS records
  const records = await db.dNSRecord.findMany({
    orderBy: [
      {
        domain: 'asc',
      },
      {
        name: 'asc',
      },
    ],
  });
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">DNS Management</h1>
      <DNSManager initialRecords={records} />
    </div>
  );
}