import { NextResponse } from 'next/server';
import { portfolioRepository } from '@/lib/db';
import { logger } from '@/lib/logger';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '0');

    let portfolioItems;

    if (category && category !== 'all') {
      portfolioItems = await portfolioRepository.findByCategory(category);
    } else if (tags.length > 0) {
      portfolioItems = await portfolioRepository.findByTags(tags);
    } else if (featured) {
      portfolioItems = await portfolioRepository.findFeatured();
    } else {
      portfolioItems = await portfolioRepository.findMany({
        orderBy: [
          { featured: 'desc' },
          { order: 'asc' },
          { createdAt: 'desc' }
        ]
      });
    }

    // Apply limit if specified
    if (limit > 0) {
      portfolioItems = portfolioItems.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      data: portfolioItems,
      count: portfolioItems.length,
    });
  } catch (error) {
    logger.error('Failed to fetch portfolio items:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch portfolio items',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Get portfolio categories and tags for filtering
export async function OPTIONS() {
  try {
    const [categories, tags] = await Promise.all([
      portfolioRepository.getAllCategories(),
      portfolioRepository.getAllTags(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        categories,
        tags,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch portfolio metadata:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch portfolio metadata',
      },
      { status: 500 }
    );
  }
}