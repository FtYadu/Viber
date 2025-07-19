'use client';

import { useState } from 'react';
import { DNSRecord } from '@prisma/client';
import { DNSType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Plus, 
  MoreHorizontal,
  Trash2,
  Edit,
  RefreshCw,
  Globe,
  ArrowUpDown,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DNSRecordsListProps {
  records: DNSRecord[];
  onAddRecord: () => void;
  onEditRecord: (record: DNSRecord) => void;
}

export function DNSRecordsList({ records: initialRecords, onAddRecord, onEditRecord }: DNSRecordsListProps) {
  const [records, setRecords] = useState<DNSRecord[]>(initialRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Filter records based on search term, type, and status
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.domain.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || record.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  // Handle record deletion
  const handleDeleteRecord = async (id: string) => {
    try {
      const response = await fetch(`/api/dns/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete DNS record');
      }
      
      // Remove the deleted record from the state
      setRecords(records.filter(record => record.id !== id));
      toast({
        title: 'Success',
        description: 'DNS record deleted successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting DNS record:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete DNS record',
        variant: 'destructive',
      });
    }
  };
  
  // Handle record verification
  const handleVerifyRecord = async (id: string) => {
    setIsVerifying(id);
    
    try {
      const response = await fetch(`/api/dns/${id}/verify`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify DNS record');
      }
      
      const updatedRecord = await response.json();
      
      // Update the record in the state
      setRecords(records.map(record => 
        record.id === id ? updatedRecord : record
      ));
      
      toast({
        title: 'Success',
        description: 'DNS record verified successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error verifying DNS record:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify DNS record',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(null);
    }
  };
  
  // Handle sync with Cloudflare
  const handleSyncWithCloudflare = async () => {
    setIsSyncing(true);
    
    try {
      const response = await fetch('/api/dns/sync', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync DNS records');
      }
      
      const data = await response.json();
      
      // Update the records in the state
      setRecords(data.records);
      
      toast({
        title: 'Success',
        description: 'DNS records synced successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error syncing DNS records:', error);
      toast({
        title: 'Error',
        description: 'Failed to sync DNS records',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>DNS Records</CardTitle>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleSyncWithCloudflare}
            disabled={isSyncing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync with Cloudflare'}
          </Button>
          <Button onClick={onAddRecord}>
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Type Filter */}
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="AAAA">AAAA</SelectItem>
              <SelectItem value="CNAME">CNAME</SelectItem>
              <SelectItem value="MX">MX</SelectItem>
              <SelectItem value="TXT">TXT</SelectItem>
              <SelectItem value="NS">NS</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ERROR">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>TTL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Checked</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No DNS records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                        {record.domain}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.type}</Badge>
                    </TableCell>
                    <TableCell>{record.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={record.content}>
                      {record.content}
                    </TableCell>
                    <TableCell>{record.ttl === 1 ? 'Auto' : record.ttl}</TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(record.status)}
                        variant="secondary"
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(record.lastChecked), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleVerifyRecord(record.id)}
                          disabled={isVerifying === record.id}
                          title="Verify Record"
                        >
                          <RefreshCw className={`h-4 w-4 ${isVerifying === record.id ? 'animate-spin' : ''}`} />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEditRecord(record)}
                          title="Edit Record"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteRecord(record.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}