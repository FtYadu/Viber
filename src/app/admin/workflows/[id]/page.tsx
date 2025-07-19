'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Copy, 
  Play, 
  RefreshCw, 
  Save, 
  XCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { WorkflowTriggerDialog } from '@/components/workflows/workflow-trigger-dialog';

interface WorkflowExecution {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  executedAt: string;
  completedAt?: string;
  payload?: string;
  result?: string;
  error?: string;
}

interface WorkflowDetail {
  id: string;
  workflowId: string;
  name: string;
  description?: string;
  type: string;
  enabled: boolean;
  executionCount: number;
  lastExecuted?: string;
  webhookUrl?: string;
  recentExecutions: WorkflowExecution[];
}

export default function WorkflowDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    enabled: false,
  });

  // Fetch workflow details
  const fetchWorkflowDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workflows/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflow details');
      }
      const data = await response.json();
      setWorkflow(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        type: data.type,
        enabled: data.enabled,
      });
    } catch (error) {
      console.error('Error fetching workflow details:', error);
      toast.error('Failed to load workflow details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflowDetails();
  }, [id]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Save workflow changes
  const saveWorkflow = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update workflow');
      }

      const updatedWorkflow = await response.json();
      setWorkflow({
        ...workflow!,
        ...updatedWorkflow,
      });
      toast.success('Workflow updated successfully');
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast.error('Failed to update workflow');
    } finally {
      setSaving(false);
    }
  };

  // Copy webhook URL to clipboard
  const copyWebhookUrl = () => {
    if (workflow?.webhookUrl) {
      navigator.clipboard.writeText(workflow.webhookUrl);
      toast.success('Webhook URL copied to clipboard');
    }
  };

  // Handle workflow trigger
  const handleWorkflowTriggered = () => {
    setTriggerDialogOpen(false);
    toast.success('Workflow triggered successfully');
    // Refresh executions after a short delay
    setTimeout(fetchWorkflowDetails, 1000);
  };

  // Execution table columns
  const executionColumns = [
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        let badgeVariant: 'default' | 'success' | 'destructive' | 'secondary' = 'default';
        let icon = null;
        
        switch (status) {
          case 'completed':
            badgeVariant = 'success';
            icon = <CheckCircle className="h-3 w-3 mr-1" />;
            break;
          case 'failed':
            badgeVariant = 'destructive';
            icon = <XCircle className="h-3 w-3 mr-1" />;
            break;
          case 'running':
            badgeVariant = 'default';
            icon = <RefreshCw className="h-3 w-3 mr-1 animate-spin" />;
            break;
          default:
            badgeVariant = 'secondary';
            icon = <Clock className="h-3 w-3 mr-1" />;
        }
        
        return (
          <Badge variant={badgeVariant} className="flex items-center">
            {icon}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'executedAt',
      header: 'Executed',
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
          <span title={format(new Date(row.original.executedAt), 'PPpp')}>
            {formatDistanceToNow(new Date(row.original.executedAt), { addSuffix: true })}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'completedAt',
      header: 'Duration',
      cell: ({ row }: any) => {
        if (!row.original.completedAt) return 'In progress';
        
        const start = new Date(row.original.executedAt);
        const end = new Date(row.original.completedAt);
        const durationMs = end.getTime() - start.getTime();
        
        if (durationMs < 1000) {
          return `${durationMs}ms`;
        }
        
        return `${(durationMs / 1000).toFixed(2)}s`;
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/workflows/${id}/executions/${row.original.id}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-10">
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!workflow) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-10">
          <div className="flex flex-col items-center justify-center h-64">
            <h2 className="text-2xl font-bold mb-4">Workflow not found</h2>
            <Button onClick={() => router.push('/admin/workflows')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Workflows
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-10">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/workflows')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{workflow.name}</h1>
          <Badge
            variant={workflow.enabled ? 'success' : 'secondary'}
            className="ml-4"
          >
            {workflow.enabled ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workflow Settings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Settings</CardTitle>
                <CardDescription>
                  Configure the workflow settings and integration details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Workflow Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Workflow Type</Label>
                    <Input
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enabled"
                      name="enabled"
                      checked={formData.enabled}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, enabled: checked })
                      }
                    />
                    <Label htmlFor="enabled">Workflow Active</Label>
                  </div>

                  <Button
                    type="button"
                    onClick={saveWorkflow}
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Actions */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full"
                  onClick={() => setTriggerDialogOpen(true)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Trigger Workflow
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={fetchWorkflowDetails}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </CardContent>
            </Card>

            {workflow.webhookUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Webhook URL</CardTitle>
                  <CardDescription>
                    Use this URL to trigger the workflow from external systems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded-md text-sm font-mono break-all mb-2">
                    {workflow.webhookUrl}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={copyWebhookUrl}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Execution History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Execution History</CardTitle>
            <CardDescription>
              Recent workflow executions and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={executionColumns}
              data={workflow.recentExecutions || []}
              loading={loading}
              noDataMessage="No executions found"
            />
          </CardContent>
        </Card>
      </div>

      {/* Trigger Workflow Dialog */}
      <WorkflowTriggerDialog
        open={triggerDialogOpen}
        onOpenChange={setTriggerDialogOpen}
        workflow={workflow}
        onWorkflowTriggered={handleWorkflowTriggered}
      />
    </AdminLayout>
  );
}