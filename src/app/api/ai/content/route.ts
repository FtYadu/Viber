import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AIService } from '@/lib/services/ai-service';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

// Schema for general content generation
const contentSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(1000, 'Prompt too long'),
  context: z.string().max(2000, 'Context too long').optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // Parse and validate request body
    const body = await request.json();
    const { prompt, context } = contentSchema.parse(body);
    
    // Generate content
    const content = await AIService.generateGeneralContent(prompt, context, ip);
    
    return NextResponse.json({ content });
  } catch (error) {
    logger.error('Error generating content:', error);
    
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