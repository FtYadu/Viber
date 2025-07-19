import { db } from '../db';
import { logger } from '../logger';
import { hash } from 'bcryptjs';

/**
 * Check if database is already seeded
 */
export async function isDatabaseSeeded(): Promise<boolean> {
  try {
    const userCount = await db.user.count();
    const clientCount = await db.client.count();
    
    return userCount > 0 && clientCount > 0;
  } catch (error) {
    logger.error('Error checking if database is seeded:', error);
    return false;
  }
}

/**
 * Clear all data from database (use with caution!)
 */
export async function clearDatabase(): Promise<void> {
  try {
    logger.info('Clearing database...');
    
    // Delete in correct order to respect foreign key constraints
    await db.task.deleteMany();
    await db.projectFile.deleteMany();
    await db.invoice.deleteMany();
    await db.project.deleteMany();
    await db.client.deleteMany();
    await db.portfolioItem.deleteMany();
    await db.dNSRecord.deleteMany();
    await db.session.deleteMany();
    await db.account.deleteMany();
    await db.verificationToken.deleteMany();
    await db.user.deleteMany();
    
    logger.info('Database cleared successfully');
  } catch (error) {
    logger.error('Error clearing database:', error);
    throw error;
  }
}

/**
 * Seed development data
 */
export async function seedDevelopmentData(): Promise<void> {
  try {
    logger.info('Seeding development data...');
    
    // Check if already seeded
    if (await isDatabaseSeeded()) {
      logger.info('Database already seeded, skipping...');
      return;
    }
    
    // Create admin user
    const adminUser = await db.user.create({
      data: {
        email: 'yadu@yadukrishnan.dev',
        name: 'Yadu Krishnan',
        role: 'ADMIN',
        image: 'https://avatars.githubusercontent.com/u/yadukrishnan',
      },
    });
    
    logger.info('Admin user created');
    
    // Create sample clients
    const clients = await Promise.all([
      db.client.create({
        data: {
          name: 'John Smith',
          email: 'john@techcorp.com',
          company: 'TechCorp Solutions',
          phone: '+1-555-0123',
          address: '123 Business Ave, San Francisco, CA 94105',
          status: 'ACTIVE',
        },
      }),
      db.client.create({
        data: {
          name: 'Sarah Johnson',
          email: 'sarah@startup.io',
          company: 'Startup Innovations',
          phone: '+1-555-0456',
          address: '456 Innovation Blvd, Austin, TX 78701',
          status: 'ACTIVE',
        },
      }),
      db.client.create({
        data: {
          name: 'Mike Chen',
          email: 'mike@ecommerce.com',
          company: 'E-Commerce Plus',
          phone: '+1-555-0789',
          address: '789 Commerce St, New York, NY 10001',
          status: 'PROSPECT',
        },
      }),
    ]);
    
    logger.info(`Created ${clients.length} sample clients`);
    
    // Create sample projects
    const projects = await Promise.all([
      db.project.create({
        data: {
          title: 'E-Commerce Platform Redesign',
          description: 'Complete redesign and development of the company e-commerce platform with modern UI/UX and improved performance.',
          clientId: clients[0].id,
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          startDate: new Date('2024-01-15'),
          deadline: new Date('2024-03-15'),
          budget: 15000,
          tags: ['React', 'Next.js', 'TypeScript', 'Stripe', 'PostgreSQL'],
        },
      }),
      db.project.create({
        data: {
          title: 'Mobile App Development',
          description: 'Native mobile application for iOS and Android with real-time features and offline capabilities.',
          clientId: clients[1].id,
          status: 'PLANNING',
          priority: 'MEDIUM',
          startDate: new Date('2024-02-01'),
          deadline: new Date('2024-05-01'),
          budget: 25000,
          tags: ['React Native', 'Firebase', 'Push Notifications', 'Offline-first'],
        },
      }),
      db.project.create({
        data: {
          title: 'API Integration & Automation',
          description: 'Integration of third-party APIs and automation of business processes using n8n workflows.',
          clientId: clients[2].id,
          status: 'COMPLETED',
          priority: 'LOW',
          startDate: new Date('2023-11-01'),
          deadline: new Date('2023-12-15'),
          budget: 8000,
          tags: ['Node.js', 'REST API', 'n8n', 'Automation', 'Webhooks'],
        },
      }),
    ]);
    
    logger.info(`Created ${projects.length} sample projects`);
    
    // Create sample portfolio items
    const portfolioItems = await Promise.all([
      db.portfolioItem.create({
        data: {
          title: 'SaaS Dashboard Platform',
          description: 'A comprehensive dashboard platform for SaaS applications with real-time analytics, user management, and billing integration.',
          category: 'SaaS',
          tags: ['React', 'Next.js', 'TypeScript', 'Prisma', 'Stripe', 'Charts'],
          images: [
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
          ],
          liveUrl: 'https://saas-dashboard-demo.vercel.app',
          githubUrl: 'https://github.com/yadukrishnan/saas-dashboard',
          featured: true,
          order: 1,
        },
      }),
      db.portfolioItem.create({
        data: {
          title: 'E-Commerce Marketplace',
          description: 'Multi-vendor e-commerce marketplace with advanced search, real-time chat, and integrated payment processing.',
          category: 'E-commerce',
          tags: ['Next.js', 'PostgreSQL', 'Stripe', 'Socket.io', 'Cloudinary'],
          images: [
            'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
            'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
          ],
          liveUrl: 'https://marketplace-demo.vercel.app',
          githubUrl: 'https://github.com/yadukrishnan/ecommerce-marketplace',
          featured: true,
          order: 2,
        },
      }),
    ]);
    
    logger.info(`Created ${portfolioItems.length} portfolio items`);
    
    // Create sample invoices
    const invoices = await Promise.all([
      db.invoice.create({
        data: {
          number: 'INV-2024-001',
          invoiceNumber: 'INV-2024-001',
          clientId: clients[0].id,
          amount: 5000,
          currency: 'USD',
          status: 'PAID',
          issueDate: new Date('2024-02-01'),
          dueDate: new Date('2024-02-15'),
          paidDate: new Date('2024-02-10'),
        },
      }),
      db.invoice.create({
        data: {
          number: 'INV-2024-002',
          invoiceNumber: 'INV-2024-002',
          clientId: clients[1].id,
          amount: 7500,
          currency: 'USD',
          status: 'SENT',
          issueDate: new Date('2024-02-15'),
          dueDate: new Date('2024-03-01'),
        },
      }),
    ]);
    
    logger.info(`Created ${invoices.length} sample invoices`);
    
    // Create sample DNS records
    const dnsRecords = await Promise.all([
      db.dNSRecord.create({
        data: {
          domain: 'yadukrishnan.dev',
          type: 'A',
          name: '@',
          content: '192.168.1.1',
          ttl: 3600,
          status: 'ACTIVE',
        },
      }),
      db.dNSRecord.create({
        data: {
          domain: 'yadukrishnan.dev',
          type: 'CNAME',
          name: 'www',
          content: 'yadukrishnan.dev',
          ttl: 3600,
          status: 'ACTIVE',
        },
      }),
    ]);
    
    logger.info(`Created ${dnsRecords.length} DNS records`);
    
    logger.info('Development data seeding completed successfully!');
  } catch (error) {
    logger.error('Error seeding development data:', error);
    throw error;
  }
}

/**
 * Seed production data (minimal)
 */
export async function seedProductionData(): Promise<void> {
  try {
    logger.info('Seeding production data...');
    
    // Only create admin user in production
    const existingAdmin = await db.user.findUnique({
      where: { email: 'yadu@yadukrishnan.dev' },
    });
    
    if (!existingAdmin) {
      await db.user.create({
        data: {
          email: 'yadu@yadukrishnan.dev',
          name: 'Yadu Krishnan',
          role: 'ADMIN',
          image: 'https://avatars.githubusercontent.com/u/yadukrishnan',
        },
      });
      
      logger.info('Admin user created for production');
    } else {
      logger.info('Admin user already exists');
    }
    
    logger.info('Production data seeding completed successfully!');
  } catch (error) {
    logger.error('Error seeding production data:', error);
    throw error;
  }
}

/**
 * Run appropriate seeding based on environment
 */
export async function runSeeding(): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    await seedProductionData();
  } else {
    await seedDevelopmentData();
  }
}

/**
 * Backup database data to JSON
 */
export async function backupDatabase(): Promise<{
  users: any[];
  clients: any[];
  projects: any[];
  portfolioItems: any[];
  invoices: any[];
  dnsRecords: any[];
}> {
  try {
    logger.info('Creating database backup...');
    
    const [users, clients, projects, portfolioItems, invoices, dnsRecords] = await Promise.all([
      db.user.findMany(),
      db.client.findMany(),
      db.project.findMany(),
      db.portfolioItem.findMany(),
      db.invoice.findMany(),
      db.dNSRecord.findMany(),
    ]);
    
    const backup = {
      users,
      clients,
      projects,
      portfolioItems,
      invoices,
      dnsRecords,
    };
    
    logger.info('Database backup created successfully');
    return backup;
  } catch (error) {
    logger.error('Error creating database backup:', error);
    throw error;
  }
}