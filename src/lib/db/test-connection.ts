import { db } from '../db';
import { logger } from '../logger';
import { clientRepository, projectRepository, portfolioRepository } from './repositories';
import { getDashboardStats, getRecentActivity } from './queries';
import { checkDatabaseHealth, testDatabaseConnection } from './connection';

/**
 * Test database connection and basic operations
 */
export async function testDatabaseOperations(): Promise<void> {
  try {
    logger.info('Starting database operations test...');

    // Test 1: Basic connection
    logger.info('Testing database connection...');
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database connection test failed');
    }
    logger.info('✅ Database connection test passed');

    // Test 2: Health check
    logger.info('Testing database health check...');
    const health = await checkDatabaseHealth();
    if (!health.connected) {
      throw new Error(`Database health check failed: ${health.error}`);
    }
    logger.info(`✅ Database health check passed (latency: ${health.latency}ms)`);

    // Test 3: Basic query
    logger.info('Testing basic database query...');
    const userCount = await db.user.count();
    logger.info(`✅ Basic query test passed (found ${userCount} users)`);

    // Test 4: Repository operations
    logger.info('Testing repository operations...');
    const clients = await clientRepository.findMany({ take: 5 });
    const projects = await projectRepository.findMany({ take: 5 });
    const portfolioItems = await portfolioRepository.findMany({ take: 5 });
    
    logger.info(`✅ Repository operations test passed`);
    logger.info(`  - Clients: ${clients.length}`);
    logger.info(`  - Projects: ${projects.length}`);
    logger.info(`  - Portfolio items: ${portfolioItems.length}`);

    // Test 5: Complex queries
    logger.info('Testing complex queries...');
    const dashboardStats = await getDashboardStats();
    const recentActivity = await getRecentActivity(3);
    
    logger.info(`✅ Complex queries test passed`);
    logger.info(`  - Total clients: ${dashboardStats.totalClients}`);
    logger.info(`  - Active projects: ${dashboardStats.activeProjects}`);
    logger.info(`  - Recent projects: ${recentActivity.recentProjects.length}`);

    logger.info('🎉 All database tests passed successfully!');
  } catch (error) {
    logger.error('❌ Database test failed:', error);
    throw error;
  }
}

/**
 * Quick database status check
 */
export async function quickDatabaseCheck(): Promise<{
  connected: boolean;
  recordCounts: {
    users: number;
    clients: number;
    projects: number;
    portfolioItems: number;
    invoices: number;
    dnsRecords: number;
  };
  latency: number;
}> {
  const startTime = Date.now();
  
  try {
    const [
      userCount,
      clientCount,
      projectCount,
      portfolioCount,
      invoiceCount,
      dnsCount,
    ] = await Promise.all([
      db.user.count(),
      db.client.count(),
      db.project.count(),
      db.portfolioItem.count(),
      db.invoice.count(),
      db.dNSRecord.count(),
    ]);

    const latency = Date.now() - startTime;

    return {
      connected: true,
      recordCounts: {
        users: userCount,
        clients: clientCount,
        projects: projectCount,
        portfolioItems: portfolioCount,
        invoices: invoiceCount,
        dnsRecords: dnsCount,
      },
      latency,
    };
  } catch (error) {
    logger.error('Quick database check failed:', error);
    throw error;
  }
}