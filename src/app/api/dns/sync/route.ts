import { NextRequest, NextResponse } from 'next/server';
import { DNSService } from '@/lib/services/dns-service';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if DNS service is configured
    if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ZONE_ID) {
      return NextResponse.json(
        { error: 'DNS service not configured. Please configure Cloudflare credentials in setup.' },
        { status: 400 }
      );
    }
    
    // Initialize DNS service only when needed and configured
    const dnsService = new DNSService(env.CLOUDFLARE_API_TOKEN!, env.CLOUDFLARE_ZONE_ID!);
    await dnsService.syncWithCloudflare();
    
    // Get all records after sync
    const records = await dnsService.getAllDNSRecords();
    
    return NextResponse.json({
      success: true,
      message: 'DNS records synced successfully',
      records,
    });
  } catch (error) {
    logger.error('Error syncing DNS records:', error);
    return NextResponse.json(
      { error: 'Failed to sync DNS records' },
      { status: 500 }
    );
  }
}