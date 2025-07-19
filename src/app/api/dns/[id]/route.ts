import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DNSService } from '@/lib/services/dns-service';
import { updateDNSRecordSchema } from '@/lib/validations';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

export async function GET(
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
    const record = await dnsService.getDNSRecordById(params.id);
    
    if (!record) {
      return NextResponse.json({ error: 'DNS record not found' }, { status: 404 });
    }
    
    return NextResponse.json(record);
  } catch (error) {
    logger.error('Error fetching DNS record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DNS record' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateDNSRecordSchema.parse(body);
    
    // Initialize DNS service and update the record
    const dnsService = new DNSService(env.CLOUDFLARE_API_TOKEN!, env.CLOUDFLARE_ZONE_ID!);
    const updatedRecord = await dnsService.updateDNSRecord(params.id, validatedData);
    
    return NextResponse.json(updatedRecord);
  } catch (error) {
    logger.error('Error updating DNS record:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update DNS record' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    await dnsService.deleteDNSRecord(params.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting DNS record:', error);
    return NextResponse.json(
      { error: 'Failed to delete DNS record' },
      { status: 500 }
    );
  }
}