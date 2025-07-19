import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { unlink } from 'fs/promises';
import { join } from 'path';

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

    // Check if file exists
    const file = await db.projectFile.findUnique({
      where: { id: params.id },
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // In a real implementation, you would delete the file from your storage service
    // For this example, we'll delete the file from the local filesystem
    try {
      const filePath = join(process.cwd(), 'public', file.url);
      await unlink(filePath);
    } catch (error) {
      logger.error(`Failed to delete file from filesystem: ${file.name}`, error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete file record from database
    await db.projectFile.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    logger.error(`Failed to delete file ${params.id}:`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete file',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}