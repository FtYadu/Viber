import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { withErrorHandling } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/webhooks/[id]
 * Get details of a specific webhook
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
    const webhook = await prisma.webhookRegistration.findUnique({
      where: { id },
    });
    
    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }
    
    return NextResponse.json(webhook);
  } catch (error) {
    console.error(`Error fetching webhook ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch webhook details' },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/webhooks/[id]
 * Update a webhook registration
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
    const { type, endpoint, description, active } = await req.json();
    
    // Get existing webhook
    const existingWebhook = await prisma.webhookRegistration.findUnique({
      where: { id },
    });
    
    if (!existingWebhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }
    
    // Update webhook registration
    const updatedWebhook = await prisma.webhookRegistration.update({
      where: { id },
      data: {
        type: type !== undefined ? type : existingWebhook.type,
        endpoint: endpoint !== undefined ? endpoint : existingWebhook.endpoint,
        description: description !== undefined ? description : existingWebhook.description,
        active: active !== undefined ? active : existingWebhook.active,
      },
    });
    
    return NextResponse.json(updatedWebhook);
  } catch (error) {
    console.error(`Error updating webhook ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update webhook' },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/webhooks/[id]
 * Delete a webhook registration
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
    // Check if webhook exists
    const webhook = await prisma.webhookRegistration.findUnique({
      where: { id },
    });
    
    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }
    
    // Delete webhook
    await prisma.webhookRegistration.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting webhook ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    );
  }
});