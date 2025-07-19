import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for creating/updating clients
const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT']).optional(),
});

// GET all clients
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build the where clause based on filters
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get clients with pagination
    const [clients, totalCount] = await Promise.all([
      db.client.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          projects: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          invoices: {
            select: {
              id: true,
              amount: true,
              status: true,
            },
          },
        },
      }),
      db.client.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: clients,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    logger.error('Failed to fetch clients:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch clients',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST create a new client
export async function POST(request: Request) {
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
    const validationResult = clientSchema.safeParse(body);
    
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

    // Check if client with the same email already exists
    const existingClient = await db.client.findFirst({
      where: { email: body.email },
    });

    if (existingClient) {
      return NextResponse.json(
        {
          success: false,
          error: 'Client with this email already exists',
        },
        { status: 409 }
      );
    }

    // Create new client
    const client = await db.client.create({
      data: {
        name: body.name,
        email: body.email,
        company: body.company,
        phone: body.phone,
        address: body.address,
        status: body.status || 'PROSPECT',
      },
    });

    return NextResponse.json({
      success: true,
      data: client,
      message: 'Client created successfully',
    }, { status: 201 });
  } catch (error) {
    logger.error('Failed to create client:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create client',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}