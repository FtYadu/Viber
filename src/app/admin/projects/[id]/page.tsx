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
  Calendar, 
  Clock, 
  DollarSign, 
  Tag as TagIcon,
  Plus,
  FileUp,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { PROJECT_STATUS_COLORS, PRIORITY_COLORS, TASK_STATUS_COLORS } from '@/lib/constants';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ProjectDialog } from '@/components/admin/projects/project-dialog';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import { TaskDialog } from '@/components/admin/projects/task-dialog';
import { TaskList } from '@/components/admin/projects/task-list';
import { FileUploader } from '@/components/admin/projects/file-uploader';
import { FileList } from '@/components/admin/projects/file-list';

interface ProjectDetailProps {
  params: {
    id: string;
  };
}

export default function ProjectDetailPage({ params }: ProjectDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [project, setProject] = useState<any | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isTaskDeleteDialogOpen, setIsTaskDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          setProject(data.data);
        } else {
          toast({
            title: 'Error',
            description: data.error || 'Failed to fetch project details',
            variant: 'destructive',
          });
          router.push('/admin/projects');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
        router.push('/admin/projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.id, router, toast]);

  // Fetch clients for project editing
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

  // Handle project update
  const handleProjectSave = async (updatedProject: any) => {
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProject),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Project updated successfully',
        });
        
        // Update project data
        setProject(data.data);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update project',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Project deleted successfully',
        });
        
        router.push('/admin/projects');
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

  // Handle task creation/update
  const handleTaskSave = async (task: any, isNew: boolean) => {
    try {
      const url = isNew ? '/api/tasks' : `/api/tasks/${task.id}`;
      const method = isNew ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...task,
          projectId: params.id,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: isNew ? 'Task created successfully' : 'Task updated successfully',
        });
        
        // Refresh project data
        const refreshResponse = await fetch(`/api/projects/${params.id}`);
        const refreshData = await refreshResponse.json();
        
        if (refreshData.success) {
          setProject(refreshData.data);
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || (isNew ? 'Failed to create task' : 'Failed to update task'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Handle task deletion
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      const response = await fetch(`/api/tasks/${taskToDelete}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Task deleted successfully',
        });
        
        // Refresh project data
        const refreshResponse = await fetch(`/api/projects/${params.id}`);
        const refreshData = await refreshResponse.json();
        
        if (refreshData.success) {
          setProject(refreshData.data);
        }
        
        // Close dialog
        setIsTaskDeleteDialogOpen(false);
        setTaskToDelete(null);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete task',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Handle task status update
  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update task in project data
        setProject((prev: any) => ({
          ...prev,
          tasks: prev.tasks.map((task: any) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          ),
        }));
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update task status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    // Refresh project data after file upload
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setProject(data.data);
      }
    } catch (error) {
      console.error('Error refreshing project data:', error);
    }
  };

  // Handle file deletion
  const handleFileDelete = async (fileId: string) => {
    try {
      const response = await fetch(`/api/upload/${fileId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'File deleted successfully',
        });
        
        // Update files in project data
        setProject((prev: any) => ({
          ...prev,
          files: prev.files.filter((file: any) => file.id !== fileId),
        }));
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete file',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
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

  if (!project) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => router.push('/admin/projects')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
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
            onClick={() => router.push('/admin/projects')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground">Client: {project.client.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsProjectDialogOpen(true)}
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

      {/* Project Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Status:</span>
                <Badge className={PROJECT_STATUS_COLORS[project.status as keyof typeof PROJECT_STATUS_COLORS] || 'bg-gray-100 text-gray-800'}>
                  {project.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Priority:</span>
                <Badge className={PRIORITY_COLORS[project.priority as keyof typeof PRIORITY_COLORS] || 'bg-gray-100 text-gray-800'}>
                  {project.priority}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Start Date:</span>
                <span>{formatDate(project.startDate)}</span>
              </div>
              
              {project.deadline && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Deadline:</span>
                  <span className={
                    new Date(project.deadline) < new Date() 
                      ? 'text-destructive flex items-center' 
                      : ''
                  }>
                    {formatDate(project.deadline)}
                    {new Date(project.deadline) < new Date() && (
                      <AlertCircle className="ml-1 h-4 w-4 text-destructive" />
                    )}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Budget Information */}
        <Card>
          <CardHeader>
            <CardTitle>Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Budget:</span>
                <span>{project.budget ? formatCurrency(project.budget) : 'Not specified'}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <TagIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {project.tags && project.tags.length > 0 ? (
                    project.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span>No tags</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Tasks:</span>
                <span className="font-medium">{project.tasks.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium">
                  {project.tasks.filter((task: any) => task.status === 'COMPLETED').length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">In Progress:</span>
                <span className="font-medium">
                  {project.tasks.filter((task: any) => task.status === 'IN_PROGRESS').length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">To Do:</span>
                <span className="font-medium">
                  {project.tasks.filter((task: any) => task.status === 'TODO').length}
                </span>
              </div>
              
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedTask(null);
                    setIsTaskDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Description */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{project.description}</p>
        </CardContent>
      </Card>

      {/* Tabs for Tasks and Files */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        
        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>
                  Manage project tasks and their status
                </CardDescription>
              </div>
              <Button onClick={() => {
                setSelectedTask(null);
                setIsTaskDialogOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </CardHeader>
            <CardContent>
              <TaskList
                tasks={project.tasks}
                onEditTask={(task) => {
                  setSelectedTask(task);
                  setIsTaskDialogOpen(true);
                }}
                onDeleteTask={(task) => {
                  setTaskToDelete(task.id);
                  setIsTaskDeleteDialogOpen(true);
                }}
                onStatusChange={handleTaskStatusUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Files Tab */}
        <TabsContent value="files">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Files</CardTitle>
                <CardDescription>
                  Upload and manage project files
                </CardDescription>
              </div>
              <Button>
                <FileUp className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <FileUploader
                  projectId={project.id}
                  onUploadComplete={handleFileUpload}
                />
                
                <FileList
                  files={project.files}
                  onDeleteFile={handleFileDelete}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Project Dialog */}
      <ProjectDialog
        isOpen={isProjectDialogOpen}
        onClose={() => setIsProjectDialogOpen(false)}
        project={project}
        clients={clients}
        onSave={handleProjectSave}
      />

      {/* Delete Project Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone and will also delete all associated tasks and files."
      />

      {/* Task Dialog */}
      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        task={selectedTask}
        onSave={handleTaskSave}
      />

      {/* Delete Task Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isTaskDeleteDialogOpen}
        onClose={() => {
          setIsTaskDeleteDialogOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
      />
    </div>
  );
}