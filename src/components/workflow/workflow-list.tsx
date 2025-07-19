'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  Play,
  Pause,
  RefreshCw,
  ExternalLink,
  Clock,
  Globe,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Define workflow type
interface Workflow {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'notification' | 'integration' | 'custom';
  status: 'active' | 'inactive' | 'error';
  lastRun?: Date;
  nextRun?: Date;
  triggerType: 'scheduled' | 'webhook' | 'manual';
  webhookUrl?: string;
  schedule?: string;
}

// Mock workflows data
const mockWorkflows: Workflow[] = [
  {
    id: 'workflow_1',
    name: 'Invoice Follow-up',
    description: 'Send reminder emails for unpaid invoices',
    type: 'email',
    status: 'active',
    lastRun: new Date(Date.now() - 86400000), // 1 day ago
    nextRun: new Date(Date.now() + 86400000), // 1 day from now
    triggerType: 'scheduled',
    schedule: 'Daily at 9:00 AM',
  },
  {
    id: 'workflow_2',
    name: 'Project Status Update',
    description: 'Notify clients when project status changes',
    type: 'notification',
    status: 'active',
    lastRun: new Date(Date.now() - 172800000), // 2 days ago
    triggerType: 'webhook',
    webhookUrl: 'https://n8n.example.com/webhook/project-status',
  },
  {
    id: 'workflow_3',
    name: 'Deadline Notification',
    description: 'Send notifications for approaching project deadlines',
    type: 'notification',
    status: 'active',
    lastRun: new Date(Date.now() - 259200000), // 3 days ago
    nextRun: new Date(Date.now() + 172800000), // 2 days from now
    triggerType: 'scheduled',
    schedule: 'Daily at 10:00 AM',
  },
  {
    id: 'workflow_4',
    name: 'Client Onboarding',
    description: 'Send welcome emails to new clients',
    type: 'email',
    status: 'active',
    triggerType: 'webhook',
    webhookUrl: 'https://n8n.example.com/webhook/welcome-email',
  },
  {
    id: 'workflow_5',
    name: 'DNS Status Check',
    description: 'Check DNS record status and update database',
    type: 'integration',
    status: 'inactive',
    triggerType: 'scheduled',
    schedule: 'Every 6 hours',
  },
];

interface WorkflowListProps {
  onAddWorkflow: () => void;
  onEditWorkflow: (workflow: Workflow) => void;
  onViewWorkflow: (workflow: Workflow) => void;
}

export function WorkflowList({
  onAddWorkflow,
  onEditWorkflow,
  onViewWorkflow,
}: WorkflowListProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter workflows based on search term, type, and status
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = 
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || workflow.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  // Handle workflow toggle
  const handleToggleWorkflow = (id: string) => {
    setWorkflows(workflows.map(workflow => 
      workflow.id === id
        ? { ...workflow, status: workflow.status === 'active' ? 'inactive' : 'active' }
        : workflow
    ));
    
    const workflow = workflows.find(w => w.id === id);
    if (workflow) {
      toast({
        title: 'Success',
        description: `Workflow "${workflow.name}" ${workflow.status === 'active' ? 'deactivated' : 'activated'}`,
        variant: 'default',
      });
    }
  };
  
  // Handle workflow deletion
  const handleDeleteWorkflow = (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    setWorkflows(workflows.filter(workflow => workflow.id !== id));
    
    if (workflow) {
      toast({
        title: 'Success',
        description: `Workflow "${workflow.name}" deleted`,
        variant: 'default',
      });
    }
  };
  
  // Handle workflow run
  const handleRunWorkflow = async (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    
    if (workflow) {
      toast({
        title: 'Info',
        description: `Triggering workflow "${workflow.name}"...`,
        variant: 'default',
      });
      
      // In a real implementation, this would call an API to trigger the workflow
      // For now, we'll just update the lastRun time
      setWorkflows(workflows.map(w => 
        w.id === id
          ? { ...w, lastRun: new Date() }
          : w
      ));
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Success',
        description: `Workflow "${workflow.name}" executed successfully`,
        variant: 'default',
      });
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // In a real implementation, this would call an API to refresh the workflows
      // For now, we'll just simulate a refresh after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Workflows refreshed successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error refreshing workflows:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh workflows',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'notification':
        return 'bg-purple-100 text-purple-800';
      case 'integration':
        return 'bg-orange-100 text-orange-800';
      case 'custom':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Workflows</CardTitle>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button onClick={onAddWorkflow}>
            <Plus className="mr-2 h-4 w-4" />
            Add Workflow
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Type Filter */}
          <select
            className="h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="email">Email</option>
            <option value="notification">Notification</option>
            <option value="integration">Integration</option>
            <option value="custom">Custom</option>
          </select>
          
          {/* Status Filter */}
          <select
            className="h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="error">Error</option>
          </select>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No workflows found
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{workflow.name}</div>
                        <div className="text-sm text-muted-foreground">{workflow.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getTypeColor(workflow.type)}
                        variant="secondary"
                      >
                        {workflow.type.charAt(0).toUpperCase() + workflow.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {workflow.triggerType === 'scheduled' ? (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{workflow.schedule}</span>
                        </div>
                      ) : workflow.triggerType === 'webhook' ? (
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>Webhook</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Play className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>Manual</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {workflow.lastRun
                        ? format(workflow.lastRun, 'MMM dd, yyyy HH:mm')
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      {workflow.nextRun
                        ? format(workflow.nextRun, 'MMM dd, yyyy HH:mm')
                        : workflow.triggerType === 'scheduled'
                        ? 'Not scheduled'
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Badge
                          className={getStatusColor(workflow.status)}
                          variant="secondary"
                        >
                          {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                        </Badge>
                        <Switch
                          checked={workflow.status === 'active'}
                          onCheckedChange={() => handleToggleWorkflow(workflow.id)}
                          className="ml-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRunWorkflow(workflow.id)}
                          disabled={workflow.status !== 'active'}
                          title="Run Workflow"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onViewWorkflow(workflow)}
                          title="View Workflow"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEditWorkflow(workflow)}
                          title="Edit Workflow"
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
                              onClick={() => handleDeleteWorkflow(workflow.id)}
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