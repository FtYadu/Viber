import { NextResponse } from 'next/server';
import { getHealthCheckData } from '@/lib/db/connection';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const healthData = await getHealthCheckData();
    
    if (healthData.database.connected) {
      return NextResponse.json(healthData, { status: 200 });
    } else {
      return NextResponse.json(
        {
          ...healthData,
          message: 'Database connection failed',
        },
        { status: 503 }
      );
    }
  } catch (error) {
    logger.error('Health check endpoint failed:', error);
    
    return NextResponse.json(
      {
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
        },
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}