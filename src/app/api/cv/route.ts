import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch the CV sections from the database
    const cvSections = await db.cVSection.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    if (!cvSections || cvSections.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'CV data not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cvSections,
    });
  } catch (error) {
    logger.error('Failed to fetch CV data:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch CV data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.sections || !Array.isArray(data.sections)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sections array is required',
        },
        { status: 400 }
      );
    }

    // Update CV sections in the database
    const updatedSections = [];
    
    for (const section of data.sections) {
      if (section.id) {
        // Update existing section
        const updated = await db.cVSection.update({
          where: { id: section.id },
          data: {
            title: section.title,
            content: section.content,
            order: section.order,
          },
        });
        updatedSections.push(updated);
      } else {
        // Create new section
        const created = await db.cVSection.create({
          data: {
            title: section.title,
            content: section.content,
            order: section.order,
          },
        });
        updatedSections.push(created);
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedSections,
      message: 'CV data updated successfully',
    });
  } catch (error) {
    logger.error('Failed to update CV data:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update CV data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}