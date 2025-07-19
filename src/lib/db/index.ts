// Main database client
export { db } from '../db';

// Repository classes and instances
export {
  ClientRepository,
  ProjectRepository,
  PortfolioRepository,
  DNSRepository,
  InvoiceRepository,
  clientRepository,
  projectRepository,
  portfolioRepository,
  dnsRepository,
  invoiceRepository,
} from './repositories';

// Query utilities
export {
  getDashboardStats,
  getRecentActivity,
  getProjectAnalytics,
  getRevenueAnalytics,
  globalSearch,
  getNotifications,
  executeTransaction,
  bulkCreateClients,
  bulkUpdateProjectStatus,
  exportClientsData,
  exportProjectsData,
} from './queries';

// Connection utilities
export {
  checkDatabaseHealth,
  getDatabaseMetrics,
  testDatabaseConnection,
  initializeDatabase,
  closeDatabaseConnection,
  withDatabaseConnection,
  withTransaction,
  withQueryMonitoring,
  getHealthCheckData,
} from './connection';

// Types
export type {
  DatabaseHealth,
  DatabaseMetrics,
} from './connection';

// Seeding utilities
export {
  isDatabaseSeeded,
  clearDatabase,
  seedDevelopmentData,
  seedProductionData,
  runSeeding,
  backupDatabase,
} from './seed-utils';

// Testing utilities
export {
  testDatabaseOperations,
  quickDatabaseCheck,
} from './test-connection';

// Re-export Prisma types for convenience
export type {
  Client,
  Project,
  PortfolioItem,
  DNSRecord,
  Invoice,
  User,
  Task,
  ProjectFile,
  ClientStatus,
  ProjectStatus,
  TaskStatus,
  Priority,
  InvoiceStatus,
  DNSRecordType,
  DNSStatus,
  UserRole,
} from '@prisma/client';