import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parse } from 'papaparse';
import { z } from 'zod';

// Validation schema for client CSV import
const clientImportSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT']).optional().default('PROSPECT'),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'Only CSV files are supported' },
        { status: 400 }
      );
    }

    // Parse CSV file
    const csvText = await file.text();
    const { data, errors } = parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse CSV file',
          details: errors,
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No data found in CSV file' },
        { status: 400 }
      );
    }

    // Validate and process each row
    const results = {
      success: 0,
      failed: 0,
      errors: [] as { row: number; error: string }[],
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;
      
      try {
        // Validate row data
        const validationResult = clientImportSchema.safeParse({
          name: row.name,
          email: row.email,
          company: row.company || null,
          phone: row.phone || null,
          address: row.address || null,
          status: row.status || 'PROSPECT',
        });

        if (!validationResult.success) {
          results.failed++;
          results.errors.push({
            row: i + 2, // +2 because of 0-indexing and header row
            error: `Validation failed: ${validationResult.error.issues.map(issue => issue.message).join(', ')}`,
          });
          continue;
        }

        const validData = validationResult.data;

        // Check if client with the same email already exists
        const existingClient = await db.client.findFirst({
          where: { email: validData.email },
        });

        if (existingClient) {
          // Update existing client
          await db.client.update({
            where: { id: existingClient.id },
            data: {
              name: validData.name,
              company: validData.company,
              phone: validData.phone,
              address: validData.address,
              status: validData.status,
            },
          });
        } else {
          // Create new client
          await db.client.create({
            data: validData,
          });
        }

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 2,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: `Imported ${results.success} clients successfully, ${results.failed} failed`,
    });
  } catch (error) {
    logger.error('Failed to import clients:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to import clients',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}