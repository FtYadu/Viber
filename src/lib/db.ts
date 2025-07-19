import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Use a single instance of Prisma Client in development
// to prevent multiple instances during hot reloading
export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}

// Export prisma as an alias for db for compatibility
export const prisma = db;

// Repository pattern for portfolio items
export const portfolioRepository = {
  findMany: async (options: any = {}) => {
    return db.portfolioItem.findMany(options);
  },
  findByCategory: async (category: string) => {
    return db.portfolioItem.findMany({
      where: {
        category: {
          equals: category,
          mode: 'insensitive',
        },
      },
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  },
  findByTags: async (tags: string[]) => {
    return db.portfolioItem.findMany({
      where: {
        tags: {
          hasSome: tags,
        },
      },
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  },
  findFeatured: async () => {
    return db.portfolioItem.findMany({
      where: {
        featured: true,
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  },
  getAllCategories: async () => {
    const items = await db.portfolioItem.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
    });
    return items.map(item => item.category);
  },
  getAllTags: async () => {
    const items = await db.portfolioItem.findMany({
      select: {
        tags: true,
      },
    });
    
    // Flatten and deduplicate tags
    const allTags = items.flatMap(item => item.tags);
    return [...new Set(allTags)];
  },
};

// Repository pattern for clients
export const clientRepository = {
  findMany: async (options: any = {}) => {
    return db.client.findMany(options);
  },
  findById: async (id: string, include: any = {}) => {
    return db.client.findUnique({
      where: { id },
      include,
    });
  },
  create: async (data: any) => {
    return db.client.create({
      data,
    });
  },
  update: async (id: string, data: any) => {
    return db.client.update({
      where: { id },
      data,
    });
  },
  delete: async (id: string) => {
    return db.client.delete({
      where: { id },
    });
  },
  count: async (where: any = {}) => {
    return db.client.count({ where });
  },
};