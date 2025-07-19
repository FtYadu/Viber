import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { withErrorHandling } from '@/lib/api-utils';
import { n8nService } from '@/lib/services/n8n-service';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/workflows/[id]
 * Get details of a specific workflow
 */
export const GET = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    // Get local workflow configuration
    const localConfig = await prisma.workflowConfig.findFirst({
      where: { workflowId: id },
    });
    
    if (!localConfig) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    
    // Get recent executions
    const recentExecutions = await prisma.workflowExecution.findMany({
      where: { workflowId: id },
      orderBy: { executedAt: 'desc' },
      take: 10,
    });
    
    // Return combined data
    return NextResponse.json({
      ...localConfig,
      webhookUrl: n8nService.getWebhookUrl(localConfig.type),
      recentExecutions,
    });
  } catch (error) {
    console.error(`Error fetching workflow ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow details' },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/workflows/[id]
 * Update a workflow configuration
 */
export const PATCH = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  
  try {
    const { name, type, enabled } = await req.json();
    
    // Get existing workflow
    const existingWorkflow = await prisma.workflowConfig.findFirst({
      where: { workflowId: id },
    });
    
    if (!existingWorkflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    
    // Update workflow configuration
    const updatedWorkflow = await prisma.workflowConfig.update({
      where: { id: existingWorkflow.id },
      data: {
        name: name !== undefined ? name : existingWorkflow.name,
        type: type !== undefined ? type : existingWorkflow.type,
        enabled: enabled !== undefined ? enabled : existingWorkflow.enabled,
        updatedAt: new Date(),
      },
    });
    
    // Update workflow status in n8n if enabled status changed
    if (enabled !== undefined && enabled !== existingWorkflow.enabled) {
      await n8nService.setWorkflowActive(id, enabled);
    }
    
    return NextResponse.json(updatedWorkflow);
  } catch (error) {
    console.error(`Error updating workflow ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update workflow configuration' },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/workflows/[id]
 * Delete a workflow configuration
 */
export const DELETE = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  
  try {
    // Get existing workflow
    const existingWorkflow = await prisma.workflowConfig.findFirst({
      where: { workflowId: id },
    });
    
    if (!existingWorkflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    
    // Delete workflow configuration
    await prisma.workflowConfig.delete({
      where: { id: existingWorkflow.id },
    });
    
    // Deactivate workflow in n8n
    await n8nService.setWorkflowActive(id, false);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting workflow ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete workflow configuration' },
      { status: 500 }
    );
  }
});