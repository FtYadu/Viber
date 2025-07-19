'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  FileUp, 
  FileDown, 
  Edit, 
  Trash2, 
  Eye, 
  Loader2 
} from 'lucide-react';
import { CLIENT_STATUS_COLORS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ClientDialog } from '@/components/admin/clients/client-dialog';
import { ImportDialog } from '@/components/admin/clients/import-dialog';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';

interface Client {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT';
  createdAt: string;
  updatedAt: string;
  projects: { id: string; title: string; status: string }[];
  invoices: { id: string; amount: number; status: string }[];
}

function ClientsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Get query params
  useEffect(() => {
    const page = searchParams.get('page') || '1';
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    
    setPagination(prev => ({ ...prev, page: parseInt(page) }));
    setStatusFilter(status);
    setSearchTerm(search);
  }, [searchParams]);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', pagination.page.toString());
        queryParams.append('limit', pagination.limit.toString());
        
        if (statusFilter) {
          queryParams.append('status', statusFilter);
        }
        
        if (searchTerm) {
          queryParams.append('search', searchTerm);
        }
        
        const response = await fetch(`/api/clients?${queryParams.toString()}`);
        const data = await response.json();
        
        if (data.success) {
          setClients(data.data);
          setPagination(prev => ({
            ...prev,
            totalCount: data.pagination.totalCount,
            totalPages: data.pagination.totalPages,
          }));
        } else {
          toast({
            title: 'Error',
            description: data.error || 'Failed to fetch clients',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [pagination.page, pagination.limit, statusFilter, searchTerm, toast]);

  // Update URL with filters
  const updateUrlWithFilters = () => {
    const params = new URLSearchParams();
    
    if (pagination.page > 1) {
      params.append('page', pagination.page.toString());
    }
    
    if (statusFilter) {
      params.append('status', statusFilter);
    }
    
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : '';
    
    router.push(`/admin/clients${url}`);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    updateUrlWithFilters();
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    
    params.set('page', '1');
    
    router.push(`/admin/clients?${params.toString()}`);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    
    router.push(`/admin/clients?${params.toString()}`);
  };

  // Handle client creation/update
  const handleClientSave = async (client: any, isNew: boolean) => {
    try {
      const url = isNew ? '/api/clients' : `/api/clients/${client.id}`;
      const method = isNew ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(client),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: isNew ? 'Client created successfully' : 'Client updated successfully',
        });
        
        // Refresh client list
        const queryParams = new URLSearchParams();
        queryParams.append('page', pagination.page.toString());
        queryParams.append('limit', pagination.limit.toString());
        
        if (statusFilter) {
          queryParams.append('status', statusFilter);
        }
        
        if (searchTerm) {
          queryParams.append('search', searchTerm);
        }
        
        const refreshResponse = await fetch(`/api/clients?${queryParams.toString()}`);
        const refreshData = await refreshResponse.json();
        
        if (refreshData.success) {
          setClients(refreshData.data);
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || (isNew ? 'Failed to create client' : 'Failed to update client'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Handle client deletion
  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    
    try {
      const response = await fetch(`/api/clients/${clientToDelete}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Client deleted successfully',
        });
        
        // Remove client from list
        setClients(prev => prev.filter(client => client.id !== clientToDelete));
        
        // Close dialog
        setIsDeleteDialogOpen(false);
        setClientToDelete(null);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete client',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Handle CSV export
  const handleExportCSV = () => {
    const queryParams = new URLSearchParams();
    
    if (statusFilter) {
      queryParams.append('status', statusFilter);
    }
    
    window.open(`/api/clients/export?${queryParams.toString()}`, '_blank');
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clients</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <FileUp className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => {
            setSelectedClient(null);
            setIsClientDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="secondary">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
            <div className="w-full md:w-48">
              <Select
                value={statusFilter}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="PROSPECT">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No clients found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSelectedClient(null);
                  setIsClientDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Client
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.company || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          className={CLIENT_STATUS_COLORS[client.status]}
                        >
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{client.projects.length}</TableCell>
                      <TableCell>{formatDate(client.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/admin/clients/${client.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedClient(client);
                              setIsClientDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setClientToDelete(client.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.page > 1) {
                          handlePageChange(pagination.page - 1);
                        }
                      }}
                      className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, and pages around current page
                      const current = pagination.page;
                      return page === 1 || 
                             page === pagination.totalPages || 
                             (page >= current - 1 && page <= current + 1);
                    })
                    .map((page, i, array) => {
                      // Add ellipsis
                      const prevPage = array[i - 1];
                      const showEllipsisBefore = prevPage && page - prevPage > 1;
                      
                      return (
                        <React.Fragment key={page}>
                          {showEllipsisBefore && (
                            <PaginationItem>
                              <span className="px-4 py-2">...</span>
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(page);
                              }}
                              isActive={page === pagination.page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      );
                    })}
                  
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.page < pagination.totalPages) {
                          handlePageChange(pagination.page + 1);
                        }
                      }}
                      className={pagination.page >= pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Dialog */}
      <ClientDialog
        isOpen={isClientDialogOpen}
        onClose={() => setIsClientDialogOpen(false)}
        client={selectedClient}
        onSave={handleClientSave}
      />

      {/* Import Dialog */}
      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onSuccess={() => {
          // Refresh client list
          const queryParams = new URLSearchParams();
          queryParams.append('page', pagination.page.toString());
          queryParams.append('limit', pagination.limit.toString());
          
          if (statusFilter) {
            queryParams.append('status', statusFilter);
          }
          
          if (searchTerm) {
            queryParams.append('search', searchTerm);
          }
          
          fetch(`/api/clients?${queryParams.toString()}`)
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                setClients(data.data);
                setPagination(prev => ({
                  ...prev,
                  totalCount: data.pagination.totalCount,
                  totalPages: data.pagination.totalPages,
                }));
              }
            });
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setClientToDelete(null);
        }}
        onConfirm={handleDeleteClient}
        title="Delete Client"
        description="Are you sure you want to delete this client? This action cannot be undone and will also delete all associated projects and invoices."
      />
    </div>
  );
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-10">
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading clients...</div>
      </div>
    </div>}>
      <ClientsPageContent />
    </Suspense>
  );
}