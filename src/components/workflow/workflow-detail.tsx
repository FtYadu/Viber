'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Code,
  ExternalLink,
  Globe,
  Play,
  X,
  RefreshCw,
  Loader2,
} from 'lucide-react';

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

// Define workflow execution type
interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'success' | 'failed' | 'running';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  error?: string;
  payload?: Record<string, any>;
  result?: Record<string, any>;
}

// Mock workflow executions
const mockExecutions: WorkflowExecution[] = [
  {
    id: 'exec_1',
    workflowId: 'workflow_1',
    status: 'success',
    startTime: new Date(Date.now() - 86400000), // 1 day ago
    endTime: new Date(Date.now() - 86399000), // 1 day ago + 1 second
    duration: 1000,
    payload: {
      invoiceId: 'inv_123',
      clientId: 'client_456',
    },
    result: {
      success: true,
      emailSent: true,
      emailId: 'email_789',
    },
  },
  {
    id: 'exec_2',
    workflowId: 'workflow_1',
    status: 'failed',
    startTime: new Date(Date.now() - 172800000), // 2 days ago
    endTime: new Date(Date.now() - 172799000), // 2 days ago + 1 second
    duration: 1000,
    payload: {
      invoiceId: 'inv_124',
      clientId: 'client_457',
    },
    error: 'Failed to send email: Invalid recipient',
  },
  {
    id: 'exec_3',
    workflowId: 'workflow_1',
    status: 'success',
    startTime: new Date(Date.now() - 259200000), // 3 days ago
    endTime: new Date(Date.now() - 259199000), // 3 days ago + 1 second
    duration: 1000,
    payload: {
      invoiceId: 'inv_125',
      clientId: 'client_458',
    },
    result: {
      success: true,
      emailSent: true,
      emailId: 'email_790',
    },
  },
];

interface WorkflowDetailProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow;
}

export function WorkflowDetail({
  isOpen,
  onClose,
  workflow,
}: WorkflowDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRunning, setIsRunning] = useState(false);
  const [executions, setExecutions] = useState<WorkflowExecution[]>(
    mockExecutions.filter(exec => exec.workflowId === workflow.id)
  );
  
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
  
  // Get execution status color
  const getExecutionStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle run workflow
  const handleRunWorkflow = async () => {
    if (workflow.status !== 'active') {
      toast({
        title: 'Error',
        description: 'Cannot run inactive workflow',
        variant: 'destructive',
      });
      return;
    }
    
    setIsRunning(true);
    
    try {
      // In a real implementation, this would call an API to run the workflow
      // For now, we'll just simulate a successful run after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add a new execution to the list
      const newExecution: WorkflowExecution = {
        id: `exec_${Date.now()}`,
        workflowId: workflow.id,
        status: 'success',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1000,
        payload: {
          timestamp: new Date().toISOString(),
        },
        result: {
          success: true,
          message: 'Workflow executed successfully',
        },
      };
      
      setExecutions([newExecution, ...executions]);
      
      toast({
        title: 'Success',
        description: 'Workflow executed successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error running workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to run workflow',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };
  
  // Format JSON for display
  const formatJson = (json: Record<string, any>) => {
    return JSON.stringify(json, null, 2);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span className="mr-2">{workflow.name}</span>
            <Badge
              className={getStatusColor(workflow.status)}
              variant="secondary"
            >
              {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="executions">Executions</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                  <p>{workflow.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">
                          {workflow.type.charAt(0).toUpperCase() + workflow.type.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trigger:</span>
                        <span className="font-medium">
                          {workflow.triggerType.charAt(0).toUpperCase() + workflow.triggerType.slice(1)}
                        </span>
                      </div>
                      {workflow.triggerType === 'scheduled' && workflow.schedule && (
                        <div className="flex justify-between">
                          <span>Schedule:</span>
                          <span className="font-medium">{workflow.schedule}</span>
                        </div>
                      )}
                      {workflow.triggerType === 'webhook' && workflow.webhookUrl && (
                        <div className="flex justify-between">
                          <span>Webhook URL:</span>
                          <span className="font-medium truncate max-w-[250px]" title={workflow.webhookUrl}>
                            {workflow.webhookUrl}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Execution</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Last Run:</span>
                        <span className="font-medium">
                          {workflow.lastRun
                            ? format(workflow.lastRun, 'MMM dd, yyyy HH:mm:ss')
                            : 'Never'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Run:</span>
                        <span className="font-medium">
                          {workflow.nextRun
                            ? format(workflow.nextRun, 'MMM dd, yyyy HH:mm:ss')
                            : workflow.triggerType === 'scheduled'
                            ? 'Not scheduled'
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recent Executions:</span>
                        <span className="font-medium">{executions.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {workflow.triggerType === 'webhook' && workflow.webhookUrl && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Webhook URL</h3>
                    <div className="bg-muted p-3 rounded-md flex items-center justify-between">
                      <code className="text-sm">{workflow.webhookUrl}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(workflow.webhookUrl || '');
                          toast({
                            title: 'Success',
                            description: 'Webhook URL copied to clipboard',
                            variant: 'default',
                          });
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button
                    onClick={handleRunWorkflow}
                    disabled={isRunning || workflow.status !== 'active'}
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Workflow
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Executions Tab */}
          <TabsContent value="executions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Execution History</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: 'Info',
                      description: 'Refreshing execution history...',
                      variant: 'default',
                    });
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {executions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No execution history found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {executions.map((execution) => (
                      <div
                        key={execution.id}
                        className="border rounded-md p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Badge
                              className={getExecutionStatusColor(execution.status)}
                              variant="secondary"
                            >
                              {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
                            </Badge>
                            <span className="ml-2 text-sm text-muted-foreground">
                              {format(execution.startTime, 'MMM dd, yyyy HH:mm:ss')}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Duration: {execution.duration ? `${execution.duration}ms` : 'N/A'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {execution.payload && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Payload</h4>
                              <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-[200px]">
                                {formatJson(execution.payload)}
                              </pre>
                            </div>
                          )}
                          
                          {execution.result && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Result</h4>
                              <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-[200px]">
                                {formatJson(execution.result)}
                              </pre>
                            </div>
                          )}
                          
                          {execution.error && (
                            <div className="col-span-2">
                              <h4 className="text-sm font-medium mb-1">Error</h4>
                              <pre className="bg-red-50 text-red-800 p-2 rounded-md text-xs overflow-auto max-h-[200px]">
                                {execution.error}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Configuration Tab */}
          <TabsContent value="configuration">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Workflow Configuration</h3>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[400px]">
                    {formatJson({
                      id: workflow.id,
                      name: workflow.name,
                      description: workflow.description,
                      type: workflow.type,
                      status: workflow.status,
                      triggerType: workflow.triggerType,
                      webhookUrl: workflow.webhookUrl,
                      schedule: workflow.schedule,
                    })}
                  </pre>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">n8n Integration</h3>
                  <p className="text-sm mb-4">
                    This workflow is integrated with n8n. You can view and edit the workflow in the n8n editor.
                  </p>
                  <Button variant="outline" className="flex items-center">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in n8n
                  </Button>
                </div>
                
                {workflow.triggerType === 'webhook' && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Webhook Example</h3>
                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="text-sm font-medium mb-2">cURL</h4>
                      <pre className="text-xs overflow-auto">
                        {`curl -X POST ${workflow.webhookUrl || 'https://n8n.example.com/webhook/my-workflow'} \\
  -H "Content-Type: application/json" \\
  -d '{"key": "value"}'`}
                      </pre>
                      
                      <h4 className="text-sm font-medium mt-4 mb-2">JavaScript</h4>
                      <pre className="text-xs overflow-auto">
                        {`fetch('${workflow.webhookUrl || 'https://n8n.example.com/webhook/my-workflow'}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    key: 'value',
  }),
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}