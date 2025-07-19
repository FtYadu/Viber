import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { withErrorHandling } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/webhooks
 * Get all registered webhooks
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const webhooks = await prisma.webhookRegistration.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(webhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/webhooks
 * Register a new webhook
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type, endpoint, secret, description, active } = await req.json();
    
    // Validate required fields
    if (!type || !endpoint || !secret) {
      return NextResponse.json(
        { error: 'Missing required fields: type, endpoint, secret' },
        { status: 400 }
      );
    }
    
    // First, find or create a default workflow config
    let defaultWorkflowConfig = await prisma.workflowConfig.findFirst({
      where: { name: 'Default Workflow' }
    });
    
    if (!defaultWorkflowConfig) {
      defaultWorkflowConfig = await prisma.workflowConfig.create({
        data: {
          name: 'Default Workflow',
          description: 'Default workflow configuration',
          webhookUrl: 'https://example.com/webhook',
          type: 'DEFAULT',
        }
      });
    }
    
    // Create webhook registration
    const webhook = await prisma.webhookRegistration.create({
      data: {
        type,
        endpoint,
        secret,
        description,
        active: active ?? true,
        workflowConfigId: defaultWorkflowConfig.id,
      },
    });
    
    return NextResponse.json(webhook);
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
});