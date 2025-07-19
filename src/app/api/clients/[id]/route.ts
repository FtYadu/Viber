import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for updating clients
const clientUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT']).optional(),
});

// GET a specific client by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await db.client.findUnique({
      where: { id: params.id },
      include: {
        projects: {
          orderBy: { updatedAt: 'desc' },
          include: {
            tasks: true,
          },
        },
        invoices: {
          orderBy: { updatedAt: 'desc' },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: client,
    });
  } catch (error) {
    logger.error(`Failed to fetch client ${params.id}:`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch client',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT update a client
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = clientUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          issues: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    // Check if client exists
    const existingClient = await db.client.findUnique({
      where: { id: params.id },
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if email is already used by another client
    if (body.email !== existingClient.email) {
      const emailExists = await db.client.findFirst({
        where: { 
          email: body.email,
          id: { not: params.id }
        },
      });

      if (emailExists) {
        return NextResponse.json(
          {
            success: false,
            error: 'Email is already in use by another client',
          },
          { status: 409 }
        );
      }
    }

    // Update client
    const updatedClient = await db.client.update({
      where: { id: params.id },
      data: {
        name: body.name,
        email: body.email,
        company: body.company,
        phone: body.phone,
        address: body.address,
        status: body.status || existingClient.status,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedClient,
      message: 'Client updated successfully',
    });
  } catch (error) {
    logger.error(`Failed to update client ${params.id}:`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update client',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE a client
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if client exists
    const existingClient = await db.client.findUnique({
      where: { id: params.id },
      include: {
        projects: true,
        invoices: true,
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Delete client (cascade will delete related projects and invoices)
    await db.client.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    logger.error(`Failed to delete client ${params.id}:`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete client',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}