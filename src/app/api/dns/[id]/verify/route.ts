import { NextRequest, NextResponse } from 'next/server';
import { DNSService } from '@/lib/services/dns-service';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if DNS service is configured
    if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ZONE_ID) {
      return NextResponse.json(
        { error: 'DNS service not configured' },
        { status: 503 }
      );
    }
    
    // Initialize DNS service
    const dnsService = new DNSService(env.CLOUDFLARE_API_TOKEN!, env.CLOUDFLARE_ZONE_ID!);
    const record = await dnsService.verifyDNSRecord(params.id);
    
    return NextResponse.json(record);
  } catch (error) {
    logger.error('Error verifying DNS record:', error);
    return NextResponse.json(
      { error: 'Failed to verify DNS record' },
      { status: 500 }
    );
  }
}