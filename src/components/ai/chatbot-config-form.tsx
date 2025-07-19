"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { WebhookRegistration, WorkflowConfig } from "@prisma/client";

interface ChatbotConfigFormProps {
  existingWebhooks: (WebhookRegistration & {
    workflowConfig: WorkflowConfig;
  })[];
}

export function ChatbotConfigForm({ existingWebhooks }: ChatbotConfigFormProps) {
  const [loading, setLoading] = useState(false);
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  const handleCreateChatbotWebhook = async () => {
    try {
      setLoading(true);

      // First create the workflow config
      const workflowResponse = await fetch("/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: workflowName,
          description: workflowDescription,
          webhookUrl,
          type: "chatbot",
        }),
      });

      if (!workflowResponse.ok) {
        throw new Error("Failed to create workflow");
      }

      const workflow = await workflowResponse.json();

      // Then create the webhook registration
      const webhookResponse = await fetch(`/api/workflows/${workflow.id}/webhooks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "chatbot",
          description: "Chatbot integration with Langflow",
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error("Failed to create webhook");
      }

      toast.success("Chatbot webhook created successfully");
      // Refresh the page to show the new webhook
      window.location.reload();
    } catch (error) {
      toast.error("Failed to create chatbot webhook: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async (workflowId: string) => {
    try {
      setLoading(true);
      
      // Delete the workflow (this will cascade delete the webhook)
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete workflow");
      }

      toast.success("Chatbot webhook deleted successfully");
      // Refresh the page to update the webhook list
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete webhook: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chatbot Webhook Configuration</CardTitle>
          <CardDescription>
            Create a webhook to connect the chatbot to Langflow via n8n
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                placeholder="Chatbot Workflow"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea
                id="workflow-description"
                placeholder="Workflow for processing chatbot messages"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="webhook-url">n8n Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://n8n.example.com/webhook/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                The webhook URL from your n8n workflow that processes chatbot messages
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleCreateChatbotWebhook} 
            disabled={loading || !workflowName || !webhookUrl}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Plus className="h-4 w-4 mr-2" />
            Create Chatbot Webhook
          </Button>
        </CardFooter>
      </Card>

      <h3 className="text-lg font-medium mt-6">Registered Chatbot Webhooks</h3>
      
      {existingWebhooks.length === 0 ? (
        <p className="text-muted-foreground">No chatbot webhooks registered yet</p>
      ) : (
        <div className="grid gap-4">
          {existingWebhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {webhook.workflowConfig.name}
                </CardTitle>
                {webhook.workflowConfig.description && (
                  <CardDescription>{webhook.workflowConfig.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid gap-2">
                  <Label>n8n Webhook URL</Label>
                  <div className="flex items-center">
                    <Input
                      value={webhook.workflowConfig.webhookUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                  </div>
                  <Label className="mt-2">Application Webhook URL</Label>
                  <div className="flex items-center">
                    <Input
                      value={`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/webhooks/n8n/${webhook.id}`}
                      readOnly
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <ConfirmDialog
                  title="Delete Webhook"
                  description="Are you sure you want to delete this chatbot webhook? This will disable the chatbot functionality."
                  onConfirm={() => handleDeleteWebhook(webhook.workflowConfig.id)}
                  triggerButton={
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  }
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}