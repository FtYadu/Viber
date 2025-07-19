'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, X } from 'lucide-react';

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

// Define form schema
const workflowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['email', 'notification', 'integration', 'custom']),
  status: z.enum(['active', 'inactive']),
  triggerType: z.enum(['scheduled', 'webhook', 'manual']),
  webhookUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  schedule: z.string().optional().or(z.literal('')),
});

type WorkflowFormValues = z.infer<typeof workflowSchema>;

interface WorkflowFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workflow: Workflow) => void;
  workflow?: Workflow; // If provided, we're editing an existing workflow
}

export function WorkflowForm({
  isOpen,
  onClose,
  onSave,
  workflow,
}: WorkflowFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditing = !!workflow;
  
  // Set up form with default values
  const form = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: workflow?.name || '',
      description: workflow?.description || '',
      type: workflow?.type || 'email',
      status: workflow?.status === 'error' ? 'inactive' : (workflow?.status || 'active'),
      triggerType: workflow?.triggerType || 'webhook',
      webhookUrl: workflow?.webhookUrl || '',
      schedule: workflow?.schedule || '',
    },
  });
  
  // Update form values when workflow changes
  useEffect(() => {
    if (workflow) {
      form.reset({
        name: workflow.name,
        description: workflow.description,
        type: workflow.type,
        status: workflow.status === 'error' ? 'inactive' : workflow.status,
        triggerType: workflow.triggerType,
        webhookUrl: workflow.webhookUrl || '',
        schedule: workflow.schedule || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        type: 'email',
        status: 'active',
        triggerType: 'webhook',
        webhookUrl: '',
        schedule: '',
      });
    }
  }, [workflow, form]);
  
  const handleSubmit = async (values: WorkflowFormValues) => {
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call an API to save the workflow
      // For now, we'll just simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedWorkflow: Workflow = {
        id: workflow?.id || `workflow_${Date.now()}`,
        name: values.name,
        description: values.description,
        type: values.type,
        status: values.status,
        triggerType: values.triggerType,
        webhookUrl: values.triggerType === 'webhook' ? values.webhookUrl : undefined,
        schedule: values.triggerType === 'scheduled' ? values.schedule : undefined,
        lastRun: workflow?.lastRun,
        nextRun: workflow?.nextRun,
      };
      
      onSave(savedWorkflow);
      
      toast({
        title: 'Success',
        description: `Workflow ${isEditing ? 'updated' : 'created'} successfully`,
        variant: 'default',
      });
      
      onClose();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} workflow:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} workflow`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get current trigger type
  const triggerType = form.watch('triggerType');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Workflow' : 'Create Workflow'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
          {/* Workflow Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Workflow Name</Label>
            <Input
              id="name"
              placeholder="Invoice Follow-up"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Send reminder emails for unpaid invoices"
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>
          
          {/* Type and Status */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="type">Workflow Type</Label>
              <Select
                value={form.watch('type')}
                onValueChange={(value) => form.setValue('type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value) => form.setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
              )}
            </div>
          </div>
          
          {/* Trigger Type */}
          <div className="space-y-2">
            <Label htmlFor="triggerType">Trigger Type</Label>
            <Select
              value={form.watch('triggerType')}
              onValueChange={(value) => form.setValue('triggerType', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select trigger type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webhook">Webhook</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.triggerType && (
              <p className="text-sm text-red-500">{form.formState.errors.triggerType.message}</p>
            )}
          </div>
          
          {/* Webhook URL (only if triggerType is webhook) */}
          {triggerType === 'webhook' && (
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                placeholder="https://n8n.example.com/webhook/my-workflow"
                {...form.register('webhookUrl')}
              />
              {form.formState.errors.webhookUrl && (
                <p className="text-sm text-red-500">{form.formState.errors.webhookUrl.message}</p>
              )}
            </div>
          )}
          
          {/* Schedule (only if triggerType is scheduled) */}
          {triggerType === 'scheduled' && (
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule</Label>
              <Input
                id="schedule"
                placeholder="Daily at 9:00 AM"
                {...form.register('schedule')}
              />
              {form.formState.errors.schedule && (
                <p className="text-sm text-red-500">{form.formState.errors.schedule.message}</p>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Workflow' : 'Create Workflow'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}