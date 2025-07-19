'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Loader2,
  Plus,
  FileText,
  Calendar
} from 'lucide-react';
import { CLIENT_STATUS_COLORS, PROJECT_STATUS_COLORS, INVOICE_STATUS_COLORS } from '@/lib/constants';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ClientDialog } from '@/components/admin/clients/client-dialog';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Client } from '@/types';

interface ClientDetailProps {
  params: {
    id: string;
  };
}

export default function ClientDetailPage({ params }: ClientDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch client data
  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(`/api/clients/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          setClient(data.data);
        } else {
          toast({
            title: 'Error',
            description: data.error || 'Failed to fetch client details',
            variant: 'destructive',
          });
          router.push('/admin/clients');
        }
      } catch (error) {
        console.error('Error fetching client:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
        router.push('/admin/clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [params.id, router, toast]);

  // Handle client update
  const handleClientSave = async (updatedClient: any) => {
    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedClient),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Client updated successfully',
        });
        
        // Update client data
        setClient((prev: Client | null) => ({
          ...prev,
          ...data.data,
        }));
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update client',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Handle client deletion
  const handleDeleteClient = async () => {
    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Client deleted successfully',
        });
        
        router.push('/admin/clients');
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

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Client Not Found</h2>
          <p className="text-muted-foreground mb-6">The client you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => router.push('/admin/clients')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/admin/clients')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground">{client.company || 'No company'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsClientDialogOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Client Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${client.email}`}
                  className="text-primary hover:underline"
                >
                  {client.email}
                </a>
              </div>
              
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${client.phone.replace(/\D/g, '')}`}
                    className="text-primary hover:underline"
                  >
                    {client.phone}
                  </a>
                </div>
              )}
              
              {client.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{client.address}</span>
                </div>
              )}
              
              {client.company && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{client.company}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Client Status:</span>
                <Badge className={CLIENT_STATUS_COLORS[client.status]}>
                  {client.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Client Since:</span>
                <span>{formatDate(client.createdAt)}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{formatDate(client.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Projects:</span>
                <span className="font-medium">{client.projects?.length || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Invoices:</span>
                <span className="font-medium">{client.invoices?.length || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Projects:</span>
                <span className="font-medium">
                  {client.projects?.filter(p => p.status === 'IN_PROGRESS').length || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Unpaid Invoices:</span>
                <span className="font-medium">
                  {client.invoices?.filter(i => i.status !== 'PAID').length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Projects and Invoices */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          {client.user && <TabsTrigger value="account">User Account</TabsTrigger>}
        </TabsList>
        
        {/* Projects Tab */}
        <TabsContent value="projects">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Projects</CardTitle>
                <CardDescription>
                  Manage client projects and their status
                </CardDescription>
              </div>
              <Button onClick={() => router.push(`/admin/projects/new?clientId=${client.id}`)}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </CardHeader>
            <CardContent>
              {client.projects?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No projects found for this client</p>
                  <Button onClick={() => router.push(`/admin/projects/new?clientId=${client.id}`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Project
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {client.projects?.map((project: any) => (
                    <Card key={project.id} className="overflow-hidden">
                      <div className={`h-2 ${PROJECT_STATUS_COLORS[project.status as keyof typeof PROJECT_STATUS_COLORS]?.replace('text-', 'bg-') || 'bg-gray-200'}`} />
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{project.title}</h3>
                          <Badge className={PROJECT_STATUS_COLORS[project.status as keyof typeof PROJECT_STATUS_COLORS] || 'bg-gray-100 text-gray-800'}>
                            {project.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {project.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(project.startDate)}</span>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/projects/${project.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>
                  Manage client invoices and payments
                </CardDescription>
              </div>
              <Button onClick={() => router.push(`/admin/invoices/new?clientId=${client.id}`)}>
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </CardHeader>
            <CardContent>
              {client.invoices?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No invoices found for this client</p>
                  <Button onClick={() => router.push(`/admin/invoices/new?clientId=${client.id}`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Invoice
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {client.invoices?.map((invoice: any) => (
                    <Card key={invoice.id} className="overflow-hidden">
                      <div className={`h-2 ${INVOICE_STATUS_COLORS[invoice.status as keyof typeof INVOICE_STATUS_COLORS]?.replace('text-', 'bg-') || 'bg-gray-200'}`} />
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">Invoice #{invoice.invoiceNumber}</h3>
                          <Badge className={INVOICE_STATUS_COLORS[invoice.status as keyof typeof INVOICE_STATUS_COLORS] || 'bg-gray-100 text-gray-800'}>
                            {invoice.status}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-muted-foreground">
                            Due: {formatDate(invoice.dueDate)}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(invoice.amount, invoice.currency)}
                          </span>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/invoices/${invoice.id}`)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            View Invoice
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* User Account Tab */}
        {client.user && (
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>User Account</CardTitle>
                <CardDescription>
                  Client portal access information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    {client.user?.image ? (
                      <AvatarImage src={client.user.image} alt={client.user.name || 'User'} />
                    ) : (
                      <AvatarFallback>{client.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{client.user?.name || 'No Name'}</h3>
                    <p className="text-sm text-muted-foreground">{client.user?.email || 'No Email'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Portal Access:</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Last Login:</span>
                    <span>Not available</span>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button variant="outline">
                      Reset Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Client Dialog */}
      <ClientDialog
        isOpen={isClientDialogOpen}
        onClose={() => setIsClientDialogOpen(false)}
        client={client}
        onSave={handleClientSave}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteClient}
        title="Delete Client"
        description="Are you sure you want to delete this client? This action cannot be undone and will also delete all associated projects and invoices."
      />
    </div>
  );
}