'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Loader2, 
  LayoutGrid, 
  List 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { KanbanBoard } from '@/components/admin/projects/kanban-board';
import { ProjectDialog } from '@/components/admin/projects/project-dialog';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import { ProjectList } from '@/components/admin/projects/project-list';

function ProjectsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [clientFilter, setClientFilter] = useState<string>('');
  
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Get query params
  useEffect(() => {
    const status = searchParams.get('status') || '';
    const clientId = searchParams.get('clientId') || '';
    const search = searchParams.get('search') || '';
    const view = searchParams.get('view') || 'kanban';
    
    setStatusFilter(status);
    setClientFilter(clientId);
    setSearchTerm(search);
    setViewMode(view === 'list' ? 'list' : 'kanban');
    
    // Check if we need to open the project dialog for a new project
    if (searchParams.get('new') === 'true') {
      setSelectedProject(null);
      setIsProjectDialogOpen(true);
    }
  }, [searchParams]);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients');
        const data = await response.json();
        
        if (data.success) {
          setClients(data.data);
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
      }
    };

    fetchClients();
  }, [toast]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      
      try {
        const queryParams = new URLSearchParams();
        
        if (statusFilter) {
          queryParams.append('status', statusFilter);
        }
        
        if (clientFilter) {
          queryParams.append('clientId', clientFilter);
        }
        
        if (searchTerm) {
          queryParams.append('search', searchTerm);
        }
        
        const response = await fetch(`/api/projects?${queryParams.toString()}`);
        const data = await response.json();
        
        if (data.success) {
          setProjects(data.data);
        } else {
          toast({
            title: 'Error',
            description: data.error || 'Failed to fetch projects',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [statusFilter, clientFilter, searchTerm, toast]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (statusFilter) {
      params.append('status', statusFilter);
    }
    
    if (clientFilter) {
      params.append('clientId', clientFilter);
    }
    
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    params.append('view', viewMode);
    
    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : '';
    
    router.push(`/admin/projects${url}`);
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    
    router.push(`/admin/projects?${params.toString()}`);
  };

  // Handle client filter change
  const handleClientChange = (value: string) => {
    setClientFilter(value);
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set('clientId', value);
    } else {
      params.delete('clientId');
    }
    
    router.push(`/admin/projects?${params.toString()}`);
  };

  // Handle view mode change
  const handleViewModeChange = (value: 'kanban' | 'list') => {
    setViewMode(value);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', value);
    
    router.push(`/admin/projects?${params.toString()}`);
  };

  // Handle project creation/update
  const handleProjectSave = async (project: any, isNew: boolean) => {
    try {
      const url = isNew ? '/api/projects' : `/api/projects/${project.id}`;
      const method = isNew ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: isNew ? 'Project created successfully' : 'Project updated successfully',
        });
        
        // Refresh project list
        const queryParams = new URLSearchParams();
        
        if (statusFilter) {
          queryParams.append('status', statusFilter);
        }
        
        if (clientFilter) {
          queryParams.append('clientId', clientFilter);
        }
        
        if (searchTerm) {
          queryParams.append('search', searchTerm);
        }
        
        const refreshResponse = await fetch(`/api/projects?${queryParams.toString()}`);
        const refreshData = await refreshResponse.json();
        
        if (refreshData.success) {
          setProjects(refreshData.data);
        }
        
        // Remove 'new' param from URL if it exists
        if (searchParams.has('new')) {
          const params = new URLSearchParams(searchParams.toString());
          params.delete('new');
          router.push(`/admin/projects?${params.toString()}`);
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || (isNew ? 'Failed to create project' : 'Failed to update project'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      const response = await fetch(`/api/projects/${projectToDelete}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Project deleted successfully',
        });
        
        // Remove project from list
        setProjects(prev => prev.filter(project => project.id !== projectToDelete));
        
        // Close dialog
        setIsDeleteDialogOpen(false);
        setProjectToDelete(null);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete project',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Handle project status change (for Kanban board)
  const handleStatusUpdate = async (projectId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update project status',
          variant: 'destructive',
        });
        throw new Error('Failed to update project status');
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <div className="flex gap-2">
          <Button onClick={() => {
            setSelectedProject(null);
            setIsProjectDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Search by title or description..."
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
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="REVIEW">Review</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select
                value={clientFilter}
                onValueChange={handleClientChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex">
              <Tabs value={viewMode} onValueChange={(v) => handleViewModeChange(v as 'kanban' | 'list')}>
                <TabsList>
                  <TabsTrigger value="kanban">
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Kanban
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <List className="h-4 w-4 mr-2" />
                    List
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">No projects found</p>
          <Button
            onClick={() => {
              setSelectedProject(null);
              setIsProjectDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Project
          </Button>
        </div>
      ) : (
        <div className="min-h-[500px]">
          {viewMode === 'kanban' ? (
            <KanbanBoard
              projects={projects}
              onProjectClick={(project) => router.push(`/admin/projects/${project.id}`)}
              onAddProject={() => {
                setSelectedProject(null);
                setIsProjectDialogOpen(true);
              }}
              onEditProject={(project) => {
                setSelectedProject(project);
                setIsProjectDialogOpen(true);
              }}
              onDeleteProject={(project) => {
                setProjectToDelete(project.id);
                setIsDeleteDialogOpen(true);
              }}
              onStatusChange={handleStatusUpdate}
            />
          ) : (
            <ProjectList
              projects={projects}
              onProjectClick={(project) => router.push(`/admin/projects/${project.id}`)}
              onEditProject={(project) => {
                setSelectedProject(project);
                setIsProjectDialogOpen(true);
              }}
              onDeleteProject={(project) => {
                setProjectToDelete(project.id);
                setIsDeleteDialogOpen(true);
              }}
            />
          )}
        </div>
      )}

      {/* Project Dialog */}
      <ProjectDialog
        isOpen={isProjectDialogOpen}
        onClose={() => {
          setIsProjectDialogOpen(false);
          // Remove 'new' param from URL if it exists
          if (searchParams.has('new')) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete('new');
            router.push(`/admin/projects?${params.toString()}`);
          }
        }}
        project={selectedProject}
        clients={clients}
        onSave={handleProjectSave}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone and will also delete all associated tasks and files."
      />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-10">
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading projects...</div>
      </div>
    </div>}>
      <ProjectsPageContent />
    </Suspense>
  );
}