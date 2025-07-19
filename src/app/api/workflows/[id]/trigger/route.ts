import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { withErrorHandling } from '@/lib/api-utils';
import { n8nService } from '@/lib/services/n8n-service';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/workflows/[id]/trigger
 * Manually trigger a workflow with custom payload
 */
export const POST = withErrorHandling(async (
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
    // Get workflow configuration
    const workflowConfig = await prisma.workflowConfig.findFirst({
      where: { workflowId: id },
    });
    
    if (!workflowConfig) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    
    // Get payload from request
    const payload = await req.json();
    
    // Trigger workflow
    const result = await n8nService.triggerWorkflow(id, payload);
    
    // Record execution
    await prisma.workflowExecution.create({
      data: {
        workflowId: id,
        executedAt: new Date(),
        status: 'pending',
        executionId: result.executionId,
        payload: JSON.stringify(payload),
        workflowConfigId: workflowConfig.id,
      },
    });
    
    // Update execution count
    await prisma.workflowConfig.update({
      where: { id: workflowConfig.id },
      data: {
        executionCount: { increment: 1 },
        lastExecuted: new Date(),
      },
    });
    
    return NextResponse.json({
      success: true,
      executionId: result.executionId,
    });
  } catch (error) {
    console.error(`Error triggering workflow ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to trigger workflow' },
      { status: 500 }
    );
  }
});