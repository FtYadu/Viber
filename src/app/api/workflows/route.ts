import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { withErrorHandling } from '@/lib/api-utils';
import { n8nService } from '@/lib/services/n8n-service';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/workflows
 * Get all workflows with their configurations and status
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get workflows from n8n
    const n8nWorkflows = await n8nService.getWorkflows();
    
    // Get local workflow configurations from database
    const localWorkflows = await prisma.workflowConfig.findMany();
    
    // Merge n8n workflows with local configurations
    const mergedWorkflows = n8nWorkflows.map((workflow: any) => {
      const localConfig = localWorkflows.find(local => local.workflowId === workflow.id);
      
      return {
        ...workflow,
        enabled: localConfig?.enabled ?? false,
        webhookUrl: localConfig ? n8nService.getWebhookUrl(localConfig.type) : null,
        lastExecuted: localConfig?.lastExecuted ?? null,
        executionCount: localConfig?.executionCount ?? 0,
        type: localConfig?.type ?? 'unknown',
      };
    });
    
    return NextResponse.json(mergedWorkflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/workflows
 * Register a new workflow configuration
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { workflowId, name, type, enabled } = await req.json();
    
    // Validate required fields
    if (!workflowId || !name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: workflowId, name, type' },
        { status: 400 }
      );
    }
    
    // Create or update workflow configuration
    const workflowConfig = await prisma.workflowConfig.upsert({
      where: { workflowId },
      update: {
        name,
        type,
        enabled: enabled ?? false,
        updatedAt: new Date(),
      },
      create: {
        workflowId,
        name,
        type,
        webhookUrl: n8nService.getWebhookUrl(type),
        enabled: enabled ?? false,
        executionCount: 0,
      },
    });
    
    // If enabled, activate the workflow in n8n
    if (enabled) {
      await n8nService.setWorkflowActive(workflowId, true);
    }
    
    return NextResponse.json(workflowConfig);
  } catch (error) {
    console.error('Error creating workflow configuration:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow configuration' },
      { status: 500 }
    );
  }
});