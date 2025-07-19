import { db } from '@/lib/db';
import { DNSRecord, DNSStatus, DNSRecordType } from '@prisma/client';
import { CloudflareService, mapCloudflareRecordToAppRecord } from './cloudflare-service';
import { logger } from '@/lib/logger';

export interface CreateDNSRecordData {
  domain: string;
  type: DNSRecordType;
  name: string;
  content: string;
  ttl?: number;
  priority?: number;
}

export interface UpdateDNSRecordData {
  type?: DNSRecordType;
  name?: string;
  content?: string;
  ttl?: number;
  priority?: number;
}

export class DNSService {
  private cloudflareService: CloudflareService;

  constructor(apiToken: string, zoneId: string) {
    this.cloudflareService = new CloudflareService(apiToken, zoneId);
  }

  /**
   * Get all DNS records
   */
  async getAllDNSRecords(): Promise<DNSRecord[]> {
    return db.dNSRecord.findMany({
      orderBy: {
        domain: 'asc',
      },
    });
  }

  /**
   * Get DNS records for a specific domain
   */
  async getDNSRecordsByDomain(domain: string): Promise<DNSRecord[]> {
    return db.dNSRecord.findMany({
      where: {
        domain,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get a DNS record by ID
   */
  async getDNSRecordById(id: string): Promise<DNSRecord | null> {
    return db.dNSRecord.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * Create a new DNS record
   */
  async createDNSRecord(data: CreateDNSRecordData): Promise<DNSRecord> {
    try {
      // Create record in Cloudflare
      const cloudflareRecord = await this.cloudflareService.createDNSRecord({
        type: data.type,
        name: data.name,
        content: data.content,
        ttl: data.ttl,
        priority: data.priority,
      });

      // Create record in our database
      const dnsRecord = await db.dNSRecord.create({
        data: {
          domain: data.domain,
          type: data.type,
          name: data.name,
          content: data.content,
          ttl: data.ttl || 3600,
          priority: data.priority,
          status: DNSStatus.ACTIVE,
          cloudflareId: cloudflareRecord.id,
          lastChecked: new Date(),
        },
      });

      return dnsRecord;
    } catch (error) {
      logger.error('Error creating DNS record:', error);
      
      // Create record in our database with PENDING status
      const dnsRecord = await db.dNSRecord.create({
        data: {
          domain: data.domain,
          type: data.type,
          name: data.name,
          content: data.content,
          ttl: data.ttl || 3600,
          priority: data.priority,
          status: DNSStatus.ERROR,
          lastChecked: new Date(),
        },
      });

      return dnsRecord;
    }
  }

  /**
   * Update an existing DNS record
   */
  async updateDNSRecord(id: string, data: UpdateDNSRecordData): Promise<DNSRecord> {
    const existingRecord = await this.getDNSRecordById(id);

    if (!existingRecord) {
      throw new Error('DNS record not found');
    }

    try {
      // Update record in Cloudflare if we have a Cloudflare ID
      if (existingRecord.cloudflareId) {
        await this.cloudflareService.updateDNSRecord(existingRecord.cloudflareId, {
          type: data.type || existingRecord.type,
          name: data.name || existingRecord.name,
          content: data.content || existingRecord.content,
          ttl: data.ttl || existingRecord.ttl,
          priority: data.priority ?? existingRecord.priority ?? undefined,
        });
      }

      // Update record in our database
      const updatedRecord = await db.dNSRecord.update({
        where: {
          id,
        },
        data: {
          type: data.type,
          name: data.name,
          content: data.content,
          ttl: data.ttl,
          priority: data.priority,
          status: DNSStatus.ACTIVE,
          lastChecked: new Date(),
        },
      });

      return updatedRecord;
    } catch (error) {
      logger.error('Error updating DNS record:', error);
      
      // Update record in our database with ERROR status
      const updatedRecord = await db.dNSRecord.update({
        where: {
          id,
        },
        data: {
          type: data.type,
          name: data.name,
          content: data.content,
          ttl: data.ttl,
          priority: data.priority,
          status: DNSStatus.ERROR,
          lastChecked: new Date(),
        },
      });

      return updatedRecord;
    }
  }

  /**
   * Delete a DNS record
   */
  async deleteDNSRecord(id: string): Promise<void> {
    const existingRecord = await this.getDNSRecordById(id);

    if (!existingRecord) {
      throw new Error('DNS record not found');
    }

    try {
      // Delete record from Cloudflare if we have a Cloudflare ID
      if (existingRecord.cloudflareId) {
        await this.cloudflareService.deleteDNSRecord(existingRecord.cloudflareId);
      }

      // Delete record from our database
      await db.dNSRecord.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      logger.error('Error deleting DNS record:', error);
      throw error;
    }
  }

  /**
   * Verify a DNS record
   */
  async verifyDNSRecord(id: string): Promise<DNSRecord> {
    const existingRecord = await this.getDNSRecordById(id);

    if (!existingRecord) {
      throw new Error('DNS record not found');
    }

    try {
      let status: DNSStatus = DNSStatus.PENDING;

      // Verify record in Cloudflare if we have a Cloudflare ID
      if (existingRecord.cloudflareId) {
        const isVerified = await this.cloudflareService.verifyDNSRecord(existingRecord.cloudflareId);
        status = isVerified ? DNSStatus.ACTIVE : DNSStatus.ERROR;
      }

      // Update record status in our database
      const updatedRecord = await db.dNSRecord.update({
        where: {
          id,
        },
        data: {
          status,
          lastChecked: new Date(),
        },
      });

      return updatedRecord;
    } catch (error) {
      logger.error('Error verifying DNS record:', error);
      
      // Update record status to ERROR in our database
      const updatedRecord = await db.dNSRecord.update({
        where: {
          id,
        },
        data: {
          status: DNSStatus.ERROR,
          lastChecked: new Date(),
        },
      });

      return updatedRecord;
    }
  }

  /**
   * Sync DNS records with Cloudflare
   */
  async syncWithCloudflare(): Promise<void> {
    try {
      // Get all records from Cloudflare
      const cloudflareRecords = await this.cloudflareService.getDNSRecords();
      
      // Get all records from our database
      const dbRecords = await this.getAllDNSRecords();
      
      // Map of Cloudflare record IDs to our database record IDs
      const cloudflareIdMap = new Map<string, string>();
      dbRecords.forEach(record => {
        if (record.cloudflareId) {
          cloudflareIdMap.set(record.cloudflareId, record.id);
        }
      });
      
      // Update existing records and add new ones
      for (const cfRecord of cloudflareRecords) {
        const mappedRecord = mapCloudflareRecordToAppRecord(cfRecord);
        
        if (cloudflareIdMap.has(cfRecord.id)) {
          // Update existing record
          const dbRecordId = cloudflareIdMap.get(cfRecord.id)!;
          await db.dNSRecord.update({
            where: {
              id: dbRecordId,
            },
            data: {
              ...mappedRecord,
              lastChecked: new Date(),
            },
          });
        } else {
          // Create new record
          await db.dNSRecord.create({
            data: {
              ...mappedRecord,
              lastChecked: new Date(),
            },
          });
        }
      }
      
      // Mark records that no longer exist in Cloudflare as ERROR
      for (const dbRecord of dbRecords) {
        if (dbRecord.cloudflareId && !cloudflareRecords.some(r => r.id === dbRecord.cloudflareId)) {
          await db.dNSRecord.update({
            where: {
              id: dbRecord.id,
            },
            data: {
              status: DNSStatus.ERROR,
              lastChecked: new Date(),
            },
          });
        }
      }
    } catch (error) {
      logger.error('Error syncing DNS records with Cloudflare:', error);
      throw error;
    }
  }
}