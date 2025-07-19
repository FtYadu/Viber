import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { unparse } from 'papaparse';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Build the where clause based on filters
    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    // Get all clients
    const clients = await db.client.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        name: true,
        email: true,
        company: true,
        phone: true,
        address: true,
        status: true,
      },
    });

    // Convert to CSV
    const csv = unparse(clients, {
      header: true,
    });

    // Return CSV as a downloadable file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="clients_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    logger.error('Failed to export clients:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export clients',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}