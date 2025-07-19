import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AIService } from '@/lib/services/ai-service';
import { aiGenerateContentSchema } from '@/lib/validations';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { RATE_LIMITS } from '@/lib/constants';

// Rate limiting
const ipRateLimits = new Map<string, { count: number, lastReset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const oneMinute = 60 * 1000;
  const limit = RATE_LIMITS.API_DEFAULT || 10;
  
  // Get or initialize rate limit data for this IP
  let rateLimitData = ipRateLimits.get(ip);
  if (!rateLimitData) {
    rateLimitData = { count: 0, lastReset: now };
    ipRateLimits.set(ip, rateLimitData);
  }
  
  // Reset count if it's been more than a minute
  if (now - rateLimitData.lastReset > oneMinute) {
    rateLimitData.count = 0;
    rateLimitData.lastReset = now;
  }
  
  // Check if the IP has exceeded the rate limit
  if (rateLimitData.count >= limit) {
    return false;
  }
  
  // Increment the request count
  rateLimitData.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // Check rate limit
    if (!checkRateLimit(ip.split(',')[0])) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = aiGenerateContentSchema.parse(body);
    
    // Generate content
    const response = await AIService.generateContent(validatedData, ip);
    
    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error generating AI content:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}