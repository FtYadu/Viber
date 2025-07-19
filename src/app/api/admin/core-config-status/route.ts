import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check core environment variables
    const coreConfig = {
      database: !!process.env.DATABASE_URL,
      auth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      nextauth: !!(process.env.NEXTAUTH_URL && process.env.NEXTAUTH_SECRET),
    };

    return NextResponse.json(coreConfig);
  } catch (error) {
    console.error('Failed to check core config status:', error);
    return NextResponse.json(
      { error: 'Failed to check core configuration status' },
      { status: 500 }
    );
  }
}
