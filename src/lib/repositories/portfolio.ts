import { db } from '@/lib/db';
import { Prisma, PortfolioItem } from '@prisma/client';
import { logger } from '@/lib/logger';

export const portfolioRepository = {
  /**
   * Find all portfolio items with optional filtering and sorting
   */
  async findMany(options?: {
    orderBy?: Prisma.PortfolioItemOrderByWithRelationInput | Prisma.PortfolioItemOrderByWithRelationInput[];
    take?: number;
    skip?: number;
  }): Promise<PortfolioItem[]> {
    try {
      return await db.portfolioItem.findMany({
        orderBy: options?.orderBy || [
          { featured: 'desc' },
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        take: options?.take,
        skip: options?.skip,
      });
    } catch (error) {
      logger.error('Error fetching portfolio items:', error);
      throw error;
    }
  },

  /**
   * Find portfolio items by category
   */
  async findByCategory(category: string): Promise<PortfolioItem[]> {
    try {
      return await db.portfolioItem.findMany({
        where: {
          category: {
            equals: category,
            mode: 'insensitive'
          }
        },
        orderBy: [
          { featured: 'desc' },
          { order: 'asc' },
          { createdAt: 'desc' }
        ]
      });
    } catch (error) {
      logger.error(`Error fetching portfolio items by category ${category}:`, error);
      throw error;
    }
  },

  /**
   * Find portfolio items by tags
   */
  async findByTags(tags: string[]): Promise<PortfolioItem[]> {
    try {
      return await db.portfolioItem.findMany({
        where: {
          tags: {
            hasSome: tags
          }
        },
        orderBy: [
          { featured: 'desc' },
          { order: 'asc' },
          { createdAt: 'desc' }
        ]
      });
    } catch (error) {
      logger.error(`Error fetching portfolio items by tags ${tags.join(', ')}:`, error);
      throw error;
    }
  },

  /**
   * Find featured portfolio items
   */
  async findFeatured(): Promise<PortfolioItem[]> {
    try {
      return await db.portfolioItem.findMany({
        where: {
          featured: true
        },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' }
        ]
      });
    } catch (error) {
      logger.error('Error fetching featured portfolio items:', error);
      throw error;
    }
  },

  /**
   * Find a portfolio item by ID
   */
  async findById(id: string): Promise<PortfolioItem | null> {
    try {
      return await db.portfolioItem.findUnique({
        where: { id }
      });
    } catch (error) {
      logger.error(`Error fetching portfolio item with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all unique categories from portfolio items
   */
  async getAllCategories(): Promise<string[]> {
    try {
      const result = await db.portfolioItem.groupBy({
        by: ['category'],
        _count: {
          category: true
        },
        orderBy: {
          _count: {
            category: 'desc'
          }
        }
      });
      
      return result.map(item => item.category);
    } catch (error) {
      logger.error('Error fetching portfolio categories:', error);
      throw error;
    }
  },

  /**
   * Get all unique tags from portfolio items
   */
  async getAllTags(): Promise<string[]> {
    try {
      const items = await db.portfolioItem.findMany({
        select: {
          tags: true
        }
      });
      
      // Extract and flatten all tags
      const allTags = items.flatMap(item => item.tags);
      
      // Get unique tags
      return [...new Set(allTags)];
    } catch (error) {
      logger.error('Error fetching portfolio tags:', error);
      throw error;
    }
  },

  /**
   * Create a new portfolio item
   */
  async create(data: Prisma.PortfolioItemCreateInput): Promise<PortfolioItem> {
    try {
      return await db.portfolioItem.create({
        data
      });
    } catch (error) {
      logger.error('Error creating portfolio item:', error);
      throw error;
    }
  },

  /**
   * Update an existing portfolio item
   */
  async update(id: string, data: Prisma.PortfolioItemUpdateInput): Promise<PortfolioItem> {
    try {
      return await db.portfolioItem.update({
        where: { id },
        data
      });
    } catch (error) {
      logger.error(`Error updating portfolio item with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a portfolio item
   */
  async delete(id: string): Promise<PortfolioItem> {
    try {
      return await db.portfolioItem.delete({
        where: { id }
      });
    } catch (error) {
      logger.error(`Error deleting portfolio item with ID ${id}:`, error);
      throw error;
    }
  }
};