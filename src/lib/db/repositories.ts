import { db } from '../db';
import { Prisma, ClientStatus, ProjectStatus, DNSStatus, InvoiceStatus } from '@prisma/client';
import { NotFoundError, ValidationError } from '../errors';

// Base repository class with common operations
abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected abstract model: any;
  protected abstract entityName: string;

  async findById(id: string): Promise<T | null> {
    return await this.model.findUnique({
      where: { id },
    });
  }

  async findByIdOrThrow(id: string): Promise<T> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new NotFoundError(`${this.entityName} with id ${id} not found`);
    }
    return entity;
  }

  async create(data: CreateInput): Promise<T> {
    try {
      return await this.model.create({
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ValidationError(`${this.entityName} with this data already exists`);
        }
      }
      throw error;
    }
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    try {
      return await this.model.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError(`${this.entityName} with id ${id} not found`);
        }
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.model.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError(`${this.entityName} with id ${id} not found`);
        }
      }
      throw error;
    }
  }

  async findMany(options?: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
    include?: any;
  }): Promise<T[]> {
    return await this.model.findMany(options);
  }

  async count(where?: any): Promise<number> {
    return await this.model.count({ where });
  }
}

// Client Repository
export class ClientRepository extends BaseRepository<
  Prisma.ClientGetPayload<{}>,
  Prisma.ClientCreateInput,
  Prisma.ClientUpdateInput
> {
  protected model = db.client;
  protected entityName = 'Client';

  async findByEmail(email: string) {
    return await this.model.findFirst({
      where: { email },
    });
  }

  async findWithProjects(id: string) {
    return await this.model.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findByStatus(status: ClientStatus) {
    return await this.model.findMany({
      where: { status },
      orderBy: { name: 'asc' },
    });
  }

  async searchClients(query: string) {
    return await this.model.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { company: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
    });
  }
}

// Project Repository
export class ProjectRepository extends BaseRepository<
  Prisma.ProjectGetPayload<{}>,
  Prisma.ProjectCreateInput,
  Prisma.ProjectUpdateInput
> {
  protected model = db.project;
  protected entityName = 'Project';

  async findByClientId(clientId: string) {
    return await this.model.findMany({
      where: { clientId },
      include: {
        client: true,
        tasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: ProjectStatus) {
    return await this.model.findMany({
      where: { status },
      include: {
        client: true,
        tasks: true,
      },
      orderBy: { deadline: 'asc' },
    });
  }

  async findUpcomingDeadlines(days: number = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await this.model.findMany({
      where: {
        deadline: {
          lte: futureDate,
          gte: new Date(),
        },
        status: {
          not: 'COMPLETED',
        },
      },
      include: {
        client: true,
      },
      orderBy: { deadline: 'asc' },
    });
  }

  async updateStatus(id: string, status: ProjectStatus) {
    return await this.update(id, { status });
  }
}

// Portfolio Repository
export class PortfolioRepository extends BaseRepository<
  Prisma.PortfolioItemGetPayload<{}>,
  Prisma.PortfolioItemCreateInput,
  Prisma.PortfolioItemUpdateInput
> {
  protected model = db.portfolioItem;
  protected entityName = 'PortfolioItem';

  async findFeatured() {
    return await this.model.findMany({
      where: { featured: true },
      orderBy: { order: 'asc' },
    });
  }

  async findByCategory(category: string) {
    return await this.model.findMany({
      where: { category },
      orderBy: { order: 'asc' },
    });
  }

  async findByTags(tags: string[]) {
    return await this.model.findMany({
      where: {
        tags: {
          hasSome: tags,
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async getAllCategories() {
    const items = await this.model.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    return items.map(item => item.category);
  }

  async getAllTags() {
    const items = await this.model.findMany({
      select: { tags: true },
    });
    const allTags = items.flatMap(item => item.tags);
    return [...new Set(allTags)];
  }
}

// DNS Repository
export class DNSRepository extends BaseRepository<
  Prisma.DNSRecordGetPayload<{}>,
  Prisma.DNSRecordCreateInput,
  Prisma.DNSRecordUpdateInput
> {
  protected model = db.dNSRecord;
  protected entityName = 'DNSRecord';

  async findByDomain(domain: string) {
    return await this.model.findMany({
      where: { domain },
      orderBy: { type: 'asc' },
    });
  }

  async findByStatus(status: DNSStatus) {
    return await this.model.findMany({
      where: { status },
      orderBy: { lastChecked: 'asc' },
    });
  }

  async updateStatus(id: string, status: DNSStatus) {
    return await this.update(id, { 
      status,
      lastChecked: new Date(),
    });
  }

  async findByCloudflareId(cloudflareId: string) {
    return await this.model.findFirst({
      where: { cloudflareId },
    });
  }
}

// Invoice Repository
export class InvoiceRepository extends BaseRepository<
  Prisma.InvoiceGetPayload<{}>,
  Prisma.InvoiceCreateInput,
  Prisma.InvoiceUpdateInput
> {
  protected model = db.invoice;
  protected entityName = 'Invoice';

  async findByClientId(clientId: string) {
    return await this.model.findMany({
      where: { clientId },
      include: {
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: InvoiceStatus) {
    return await this.model.findMany({
      where: { status },
      include: {
        client: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOverdue() {
    return await this.model.findMany({
      where: {
        status: 'SENT',
        dueDate: {
          lt: new Date(),
        },
      },
      include: {
        client: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastInvoice = await this.model.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `INV-${year}-`,
        },
      },
      orderBy: {
        invoiceNumber: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `INV-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  async markAsPaid(id: string) {
    return await this.update(id, {
      status: 'PAID',
      paidDate: new Date(),
    });
  }
}

// Export repository instances
export const clientRepository = new ClientRepository();
export const projectRepository = new ProjectRepository();
export const portfolioRepository = new PortfolioRepository();
export const dnsRepository = new DNSRepository();
export const invoiceRepository = new InvoiceRepository();