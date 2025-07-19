import { db } from '../db';
import { Prisma, ProjectStatus } from '@prisma/client';

// Dashboard statistics queries
export async function getDashboardStats() {
  const [
    totalClients,
    activeProjects,
    completedProjects,
    pendingInvoices,
    totalRevenue,
    portfolioItems,
  ] = await Promise.all([
    db.client.count(),
    db.project.count({
      where: {
        status: {
          in: ['PLANNING', 'IN_PROGRESS', 'REVIEW'],
        },
      },
    }),
    db.project.count({
      where: { status: 'COMPLETED' },
    }),
    db.invoice.count({
      where: { status: 'SENT' },
    }),
    db.invoice.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    }),
    db.portfolioItem.count(),
  ]);

  return {
    totalClients,
    activeProjects,
    completedProjects,
    pendingInvoices,
    totalRevenue: totalRevenue._sum.amount || 0,
    portfolioItems,
  };
}

// Recent activity queries
export async function getRecentActivity(limit: number = 10) {
  const [recentProjects, recentClients, recentInvoices] = await Promise.all([
    db.project.findMany({
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        client: {
          select: { name: true, company: true },
        },
      },
    }),
    db.client.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        company: true,
        status: true,
        createdAt: true,
      },
    }),
    db.invoice.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: { name: true, company: true },
        },
      },
    }),
  ]);

  return {
    recentProjects,
    recentClients,
    recentInvoices,
  };
}

// Project analytics queries
export async function getProjectAnalytics() {
  const projectsByStatus = await db.project.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  });

  const projectsByPriority = await db.project.groupBy({
    by: ['priority'],
    _count: {
      priority: true,
    },
  });

  const monthlyProjects = await db.$queryRaw<
    Array<{ month: string; count: number }>
  >`
    SELECT 
      TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
      COUNT(*)::int as count
    FROM projects 
    WHERE "createdAt" >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month ASC
  `;

  return {
    projectsByStatus: projectsByStatus.map(item => ({
      status: item.status,
      count: item._count.status,
    })),
    projectsByPriority: projectsByPriority.map(item => ({
      priority: item.priority,
      count: item._count.priority,
    })),
    monthlyProjects,
  };
}

// Revenue analytics queries
export async function getRevenueAnalytics() {
  const monthlyRevenue = await db.$queryRaw<
    Array<{ month: string; revenue: number }>
  >`
    SELECT 
      TO_CHAR(DATE_TRUNC('month', "paidAt"), 'YYYY-MM') as month,
      SUM(amount)::float as revenue
    FROM invoices 
    WHERE status = 'PAID' AND "paidAt" >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', "paidAt")
    ORDER BY month ASC
  `;

  const revenueByClient = await db.invoice.groupBy({
    by: ['clientId'],
    where: { status: 'PAID' },
    _sum: { amount: true },
    orderBy: {
      _sum: {
        amount: 'desc',
      },
    },
    take: 10,
  });

  // Get client names for the revenue by client data
  const clientIds = revenueByClient.map(item => item.clientId);
  const clients = await db.client.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, name: true, company: true },
  });

  const revenueByClientWithNames = revenueByClient.map(item => {
    const client = clients.find(c => c.id === item.clientId);
    return {
      clientId: item.clientId,
      clientName: client?.name || 'Unknown',
      company: client?.company,
      revenue: item._sum.amount || 0,
    };
  });

  return {
    monthlyRevenue,
    revenueByClient: revenueByClientWithNames,
  };
}

// Search queries
export async function globalSearch(query: string, limit: number = 5) {
  const searchTerm = query.toLowerCase();

  const [clients, projects, portfolioItems] = await Promise.all([
    db.client.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { company: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
      },
    }),
    db.project.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { tags: { hasSome: [searchTerm] } },
        ],
      },
      take: limit,
      select: {
        id: true,
        title: true,
        status: true,
        client: {
          select: { name: true },
        },
      },
    }),
    db.portfolioItem.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { category: { contains: searchTerm, mode: 'insensitive' } },
          { tags: { hasSome: [searchTerm] } },
        ],
      },
      take: limit,
      select: {
        id: true,
        title: true,
        category: true,
        images: true,
      },
    }),
  ]);

  return {
    clients,
    projects,
    portfolioItems,
  };
}

// Notification queries
export async function getNotifications() {
  const upcomingDeadlines = await db.project.findMany({
    where: {
      deadline: {
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        gte: new Date(),
      },
      status: {
        not: 'COMPLETED',
      },
    },
    include: {
      client: {
        select: { name: true },
      },
    },
    orderBy: { deadline: 'asc' },
  });

  const overdueInvoices = await db.invoice.findMany({
    where: {
      status: 'SENT',
      dueDate: {
        lt: new Date(),
      },
    },
    include: {
      client: {
        select: { name: true },
      },
    },
    orderBy: { dueDate: 'asc' },
  });

  const pendingDNSRecords = await db.dNSRecord.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
  });

  return {
    upcomingDeadlines,
    overdueInvoices,
    pendingDNSRecords,
  };
}

// Export utilities for complex queries
export async function executeTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return await db.$transaction(callback);
}

// Bulk operations
export async function bulkCreateClients(clients: Prisma.ClientCreateInput[]) {
  return await db.client.createMany({
    data: clients,
    skipDuplicates: true,
  });
}

export async function bulkUpdateProjectStatus(
  projectIds: string[],
  status: ProjectStatus
) {
  return await db.project.updateMany({
    where: {
      id: {
        in: projectIds,
      },
    },
    data: { status },
  });
}

// Data export queries
export async function exportClientsData() {
  return await db.client.findMany({
    include: {
      projects: {
        select: {
          title: true,
          status: true,
          budget: true,
        },
      },
      invoices: {
        select: {
          invoiceNumber: true,
          amount: true,
          status: true,
        },
      },
    },
  });
}

export async function exportProjectsData() {
  return await db.project.findMany({
    include: {
      client: {
        select: {
          name: true,
          company: true,
        },
      },
      tasks: {
        select: {
          title: true,
          status: true,
        },
      },
    },
  });
}