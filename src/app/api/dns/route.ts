import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DNSService } from '@/lib/services/dns-service';
import { createDNSRecordSchema } from '@/lib/validations';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

export async function GET(request: NextRequest) {
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
    
    // Get domain from query params if provided
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    
    let records;
    if (domain) {
      records = await dnsService.getDNSRecordsByDomain(domain);
    } else {
      records = await dnsService.getAllDNSRecords();
    }
    
    return NextResponse.json(records);
  } catch (error) {
    logger.error('Error fetching DNS records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DNS records' },
      { status: 500 }
    );
  }
}

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
        { error: 'DNS service not configured' },
        { status: 503 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = createDNSRecordSchema.parse(body);
    
    // Initialize DNS service and create the record
    const dnsService = new DNSService(env.CLOUDFLARE_API_TOKEN!, env.CLOUDFLARE_ZONE_ID!);
    const record = await dnsService.createDNSRecord(validatedData);
    
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    logger.error('Error creating DNS record:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create DNS record' },
      { status: 500 }
    );
  }
}