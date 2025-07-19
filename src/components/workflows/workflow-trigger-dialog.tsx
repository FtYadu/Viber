"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Play } from 'lucide-react';

interface WorkflowTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow: {
    id: string;
    name: string;
    type: string;
  };
  onWorkflowTriggered: () => void;
}

export function WorkflowTriggerDialog({
  open,
  onOpenChange,
  workflow,
  onWorkflowTriggered,
}: WorkflowTriggerDialogProps) {
  const [payload, setPayload] = useState('{\n  "data": {\n    \n  }\n}');
  const [submitting, setSubmitting] = useState(false);

  const handlePayloadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPayload(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate JSON
    try {
      JSON.parse(payload);
    } catch (error) {
      toast.error('Invalid JSON payload');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`/api/workflows/${workflow.id}/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });
      
      if (!response.ok) {
        throw new Error('Failed to trigger workflow');
      }
      
      const data = await response.json();
      toast.success(`Workflow triggered successfully (Execution ID: ${data.executionId})`);
      onWorkflowTriggered();
    } catch (error) {
      console.error('Error triggering workflow:', error);
      toast.error('Failed to trigger workflow');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate sample payload based on workflow type
  const generateSamplePayload = () => {
    let sample = {};
    
    switch (workflow.type) {
      case 'invoice-reminder':
        sample = {
          invoiceId: "invoice_id_here",
          reminderType: "upcoming", // or "overdue", "final-notice"
          data: {
            clientName: "Client Name",
            amount: 1000,
            dueDate: new Date().toISOString(),
          }
        };
        break;
        
      case 'project-deadline':
        sample = {
          projectId: "project_id_here",
          deadlineType: "approaching", // or "today", "overdue"
          data: {
            projectTitle: "Project Title",
            clientName: "Client Name",
            deadline: new Date().toISOString(),
          }
        };
        break;
        
      case 'client-onboarding':
        sample = {
          clientId: "client_id_here",
          data: {
            clientName: "Client Name",
            email: "client@example.com",
            services: ["Web Development", "SEO"]
          }
        };
        break;
        
      case 'ai-processing':
        sample = {
          type: "content-generation", // or "email-draft"
          data: {
            prompt: "Write a blog post about...",
            length: "medium",
            tone: "professional"
          },
          callbackUrl: "https://example.com/webhook"
        };
        break;
        
      default:
        sample = {
          data: {
            // Add custom data here
          }
        };
    }
    
    setPayload(JSON.stringify(sample, null, 2));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Trigger Workflow: {workflow.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="payload">Payload (JSON)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateSamplePayload}
              >
                Generate Sample
              </Button>
            </div>
            <Textarea
              id="payload"
              value={payload}
              onChange={handlePayloadChange}
              rows={10}
              className="font-mono text-sm"
              placeholder="Enter JSON payload"
            />
            <p className="text-xs text-muted-foreground">
              The payload will be sent to the workflow as input data
            </p>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Triggering...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Trigger Workflow
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}