import { DNSRecordType, DNSStatus } from '@prisma/client';
import { logger } from '@/lib/logger';

// Cloudflare API base URL
const API_BASE_URL = 'https://api.cloudflare.com/client/v4';

// Cloudflare DNS record types mapping
const DNS_RECORD_TYPES = {
  A: 'A',
  AAAA: 'AAAA',
  CNAME: 'CNAME',
  MX: 'MX',
  TXT: 'TXT',
  NS: 'NS',
};

// Cloudflare API response interfaces
interface CloudflareResponse<T> {
  result: T;
  success: boolean;
  errors: any[];
  messages: any[];
}

interface CloudflareDNSRecord {
  id: string;
  zone_id: string;
  zone_name: string;
  name: string;
  type: string;
  content: string;
  proxiable: boolean;
  proxied: boolean;
  ttl: number;
  locked: boolean;
  meta: {
    auto_added: boolean;
    managed_by_apps: boolean;
    managed_by_argo_tunnel: boolean;
    source: string;
  };
  created_on: string;
  modified_on: string;
  priority?: number;
}

// Convert Cloudflare DNS record to our app's DNS record format
export const mapCloudflareRecordToAppRecord = (record: CloudflareDNSRecord) => {
  return {
    cloudflareId: record.id,
    domain: record.zone_name,
    type: record.type as DNSRecordType,
    name: record.name,
    content: record.content,
    ttl: record.ttl,
    priority: record.priority,
    status: DNSStatus.ACTIVE,
  };
};

// Cloudflare API service
export class CloudflareService {
  private apiToken: string;
  private zoneId: string;

  constructor(apiToken: string, zoneId: string) {
    if (!apiToken || !zoneId) {
      throw new Error('Cloudflare API credentials not configured');
    }
    this.apiToken = apiToken;
    this.zoneId = zoneId;
  }

  // Helper method to make API requests to Cloudflare
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`,
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      
      const result = await response.json() as CloudflareResponse<T>;
      
      if (!result.success) {
        const errorMessage = result.errors.map(e => e.message).join(', ');
        throw new Error(`Cloudflare API error: ${errorMessage}`);
      }
      
      return result.result;
    } catch (error) {
      logger.error('Cloudflare API request failed:', error);
      throw error;
    }
  }

  // Get all DNS records for a zone
  async getDNSRecords(): Promise<CloudflareDNSRecord[]> {
    return this.makeRequest<CloudflareDNSRecord[]>(`/zones/${this.zoneId}/dns_records`);
  }

  // Get a specific DNS record
  async getDNSRecord(recordId: string): Promise<CloudflareDNSRecord> {
    return this.makeRequest<CloudflareDNSRecord>(`/zones/${this.zoneId}/dns_records/${recordId}`);
  }

  // Create a new DNS record
  async createDNSRecord(record: {
    type: DNSRecordType;
    name: string;
    content: string;
    ttl?: number;
    priority?: number;
    proxied?: boolean;
  }): Promise<CloudflareDNSRecord> {
    return this.makeRequest<CloudflareDNSRecord>(
      `/zones/${this.zoneId}/dns_records`,
      'POST',
      {
        type: record.type,
        name: record.name,
        content: record.content,
        ttl: record.ttl || 1, // 1 = Auto
        priority: record.priority,
        proxied: record.proxied || false,
      }
    );
  }

  // Update an existing DNS record
  async updateDNSRecord(
    recordId: string,
    record: {
      type: DNSRecordType;
      name: string;
      content: string;
      ttl?: number;
      priority?: number;
      proxied?: boolean;
    }
  ): Promise<CloudflareDNSRecord> {
    return this.makeRequest<CloudflareDNSRecord>(
      `/zones/${this.zoneId}/dns_records/${recordId}`,
      'PUT',
      {
        type: record.type,
        name: record.name,
        content: record.content,
        ttl: record.ttl || 1, // 1 = Auto
        priority: record.priority,
        proxied: record.proxied || false,
      }
    );
  }

  // Delete a DNS record
  async deleteDNSRecord(recordId: string): Promise<void> {
    await this.makeRequest<{ id: string }>(
      `/zones/${this.zoneId}/dns_records/${recordId}`,
      'DELETE'
    );
  }

  // Verify a DNS record (check if it's propagated)
  async verifyDNSRecord(recordId: string): Promise<boolean> {
    try {
      const record = await this.getDNSRecord(recordId);
      return !!record;
    } catch (error) {
      logger.error('Error verifying DNS record:', error);
      return false;
    }
  }
}