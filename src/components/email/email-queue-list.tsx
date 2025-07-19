'use client';

import { useState } from 'react';
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
  RefreshCw,
  MoreHorizontal,
  Trash2,
  RotateCw,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Define email queue item type
interface EmailQueueItem {
  id: string;
  type: 'welcome' | 'invoice' | 'project_update' | 'password_reset' | 'contact_form' | 'custom';
  recipient: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  createdAt: Date;
  processedAt?: Date;
}

// Mock email queue data
const mockQueueItems: EmailQueueItem[] = [
  {
    id: 'email_1',
    type: 'welcome',
    recipient: 'john.doe@example.com',
    subject: 'Welcome to Yadu Krishnan Services',
    status: 'sent',
    attempts: 1,
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    processedAt: new Date(Date.now() - 3590000), // 59 minutes 50 seconds ago
  },
  {
    id: 'email_2',
    type: 'invoice',
    recipient: 'jane.smith@example.com',
    subject: 'Invoice INV-20230101-0001 - Yadu Krishnan Services',
    status: 'pending',
    attempts: 0,
    createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
  },
  {
    id: 'email_3',
    type: 'project_update',
    recipient: 'bob.johnson@example.com',
    subject: 'Project Update: Website Redesign',
    status: 'failed',
    attempts: 3,
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    processedAt: new Date(Date.now() - 7000000), // 1 hour 56 minutes 40 seconds ago
  },
  {
    id: 'email_4',
    type: 'contact_form',
    recipient: 'admin@yadukrishnan.com',
    subject: 'Contact Form: New Project Inquiry',
    status: 'sent',
    attempts: 1,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    processedAt: new Date(Date.now() - 86390000), // 23 hours 59 minutes 50 seconds ago
  },
  {
    id: 'email_5',
    type: 'custom',
    recipient: 'support@example.com',
    subject: 'Custom Email Subject',
    status: 'pending',
    attempts: 0,
    createdAt: new Date(Date.now() - 300000), // 5 minutes ago
  },
];

export function EmailQueueList() {
  const [queueItems, setQueueItems] = useState<EmailQueueItem[]>(mockQueueItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter queue items based on search term, status, and type
  const filteredItems = queueItems.filter(item => {
    const matchesSearch = 
      item.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // In a real implementation, this would call an API to refresh the queue
      // For now, we'll just simulate a refresh after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Email queue refreshed successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error refreshing email queue:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh email queue',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handle retry
  const handleRetry = async (id: string) => {
    try {
      // In a real implementation, this would call an API to retry the email
      // For now, we'll just update the state
      setQueueItems(queueItems.map(item => 
        item.id === id
          ? { ...item, status: 'pending', attempts: item.attempts + 1 }
          : item
      ));
      
      toast({
        title: 'Success',
        description: 'Email queued for retry',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error retrying email:', error);
      toast({
        title: 'Error',
        description: 'Failed to retry email',
        variant: 'destructive',
      });
    }
  };
  
  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      // In a real implementation, this would call an API to delete the email
      // For now, we'll just remove it from the state
      setQueueItems(queueItems.filter(item => item.id !== id));
      
      toast({
        title: 'Success',
        description: 'Email removed from queue',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting email:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete email',
        variant: 'destructive',
      });
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  // Format email type
  const formatEmailType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Email Queue</CardTitle>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          
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
              <SelectItem value="welcome">Welcome</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="project_update">Project Update</SelectItem>
              <SelectItem value="password_reset">Password Reset</SelectItem>
              <SelectItem value="contact_form">Contact Form</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Processed</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No emails found in queue
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatEmailType(item.type)}</TableCell>
                    <TableCell className="max-w-[150px] truncate" title={item.recipient}>
                      {item.recipient}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={item.subject}>
                      {item.subject}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(item.status)}
                        variant="secondary"
                      >
                        <span className="flex items-center gap-1">
                          {getStatusIcon(item.status)}
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell title={format(item.createdAt, 'PPpp')}>
                      {format(item.createdAt, 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell title={item.processedAt ? format(item.processedAt, 'PPpp') : ''}>
                      {item.processedAt ? format(item.processedAt, 'MMM dd, HH:mm') : '-'}
                    </TableCell>
                    <TableCell>{item.attempts}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {}}
                          title="View Email"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {item.status === 'failed' && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRetry(item.id)}
                            title="Retry"
                          >
                            <RotateCw className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(item.id)}
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