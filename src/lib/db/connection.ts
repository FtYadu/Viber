import { db } from '../db';
import { logger } from '../logger';

export interface DatabaseHealth {
  connected: boolean;
  latency?: number;
  error?: string;
  timestamp: Date;
}

export interface DatabaseMetrics {
  activeConnections?: number;
  totalQueries?: number;
  avgQueryTime?: number;
  slowQueries?: number;
}

/**
 * Check database connection health
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const startTime = Date.now();
  
  try {
    // Simple query to test connection
    await db.$queryRaw`SELECT 1 as test`;
    
    const latency = Date.now() - startTime;
    
    return {
      connected: true,
      latency,
      timestamp: new Date(),
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    };
  }
}

/**
 * Get database metrics (PostgreSQL specific)
 */
export async function getDatabaseMetrics(): Promise<DatabaseMetrics> {
  try {
    // Get connection count
    const connectionResult = await db.$queryRaw<Array<{ count: number }>>`
      SELECT count(*) as count 
      FROM pg_stat_activity 
      WHERE state = 'active'
    `;

    // Get query statistics
    const queryStatsResult = await db.$queryRaw<Array<{
      calls: number;
      mean_exec_time: number;
      total_exec_time: number;
    }>>`
      SELECT 
        sum(calls)::int as calls,
        avg(mean_exec_time)::float as mean_exec_time,
        sum(total_exec_time)::float as total_exec_time
      FROM pg_stat_statements 
      WHERE query NOT LIKE '%pg_stat_%'
      LIMIT 1
    `;

    // Get slow queries count (queries taking more than 1 second)
    const slowQueriesResult = await db.$queryRaw<Array<{ count: number }>>`
      SELECT count(*)::int as count
      FROM pg_stat_statements 
      WHERE mean_exec_time > 1000
      AND query NOT LIKE '%pg_stat_%'
    `;

    return {
      activeConnections: connectionResult[0]?.count || 0,
      totalQueries: queryStatsResult[0]?.calls || 0,
      avgQueryTime: queryStatsResult[0]?.mean_exec_time || 0,
      slowQueries: slowQueriesResult[0]?.count || 0,
    };
  } catch (error) {
    logger.warn('Could not retrieve database metrics:', error);
    return {};
  }
}

/**
 * Test database connection with retry logic
 */
export async function testDatabaseConnection(
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const health = await checkDatabaseHealth();
      
      if (health.connected) {
        logger.info(`Database connection successful on attempt ${attempt}`);
        return true;
      }
      
      if (attempt < maxRetries) {
        logger.warn(`Database connection failed on attempt ${attempt}, retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    } catch (error) {
      logger.error(`Database connection attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  logger.error(`Database connection failed after ${maxRetries} attempts`);
  return false;
}

/**
 * Initialize database connection and run migrations if needed
 */
export async function initializeDatabase(): Promise<void> {
  try {
    logger.info('Initializing database connection...');
    
    // Test connection
    const isConnected = await testDatabaseConnection();
    
    if (!isConnected) {
      throw new Error('Failed to establish database connection');
    }
    
    // Check if database is properly migrated
    try {
      await db.$queryRaw`SELECT 1 FROM users LIMIT 1`;
      logger.info('Database schema is ready');
    } catch (error) {
      logger.warn('Database schema might not be initialized. Please run migrations.');
      throw new Error('Database schema not found. Run: npm run db:migrate');
    }
    
    logger.info('Database initialization completed successfully');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

/**
 * Gracefully close database connections
 */
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await db.$disconnect();
    logger.info('Database connection closed successfully');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
}

/**
 * Database connection middleware for API routes
 */
export function withDatabaseConnection<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      // Check if database is connected
      const health = await checkDatabaseHealth();
      
      if (!health.connected) {
        throw new Error(`Database connection failed: ${health.error}`);
      }
      
      // Execute the handler
      return await handler(...args);
    } catch (error) {
      logger.error('Database operation failed:', error);
      throw error;
    }
  };
}

/**
 * Database transaction wrapper with error handling
 */
export async function withTransaction<T>(
  callback: (tx: any) => Promise<T>
): Promise<T> {
  try {
    return await db.$transaction(callback);
  } catch (error) {
    logger.error('Database transaction failed:', error);
    throw error;
  }
}

/**
 * Database query performance monitoring
 */
export function withQueryMonitoring<T extends any[], R>(
  queryName: string,
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    
    try {
      const result = await handler(...args);
      const duration = Date.now() - startTime;
      
      if (duration > 1000) {
        logger.warn(`Slow query detected: ${queryName} took ${duration}ms`);
      } else {
        logger.debug(`Query ${queryName} completed in ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Query ${queryName} failed after ${duration}ms:`, error);
      throw error;
    }
  };
}

// Export health check endpoint data
export async function getHealthCheckData() {
  const [health, metrics] = await Promise.all([
    checkDatabaseHealth(),
    getDatabaseMetrics(),
  ]);
  
  return {
    database: {
      ...health,
      metrics,
    },
    timestamp: new Date().toISOString(),
  };
}