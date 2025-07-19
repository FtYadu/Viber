import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { WebhookRegistration } from "@prisma/client";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { WebhookTestDialog } from "./webhook-test-dialog";

interface WebhookRegistrationProps {
  workflowId: string;
  webhooks: WebhookRegistration[];
}

export function WebhookRegistrationComponent({
  workflowId,
  webhooks,
}: WebhookRegistrationProps) {
  const [loading, setLoading] = useState(false);
  const [webhookType, setWebhookType] = useState("custom");
  const [description, setDescription] = useState("");

  const handleCreateWebhook = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workflows/${workflowId}/webhooks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: webhookType,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create webhook");
      }

      toast.success("Webhook created successfully");
      // Refresh the page to show the new webhook
      window.location.reload();
    } catch (error) {
      toast.error("Failed to create webhook: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      const response = await fetch(
        `/api/workflows/${workflowId}/webhooks/${webhookId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete webhook");
      }

      toast.success("Webhook deleted successfully");
      // Refresh the page to update the webhook list
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete webhook: " + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Register New Webhook</CardTitle>
          <CardDescription>
            Create a webhook endpoint that can be called by external systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="webhook-type">Webhook Type</Label>
              <Select
                value={webhookType}
                onValueChange={setWebhookType}
              >
                <SelectTrigger id="webhook-type">
                  <SelectValue placeholder="Select webhook type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice-notification">Invoice Notification</SelectItem>
                  <SelectItem value="client-onboarding">Client Onboarding</SelectItem>
                  <SelectItem value="project-update">Project Update</SelectItem>
                  <SelectItem value="email-delivery">Email Delivery</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Webhook description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateWebhook} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Plus className="h-4 w-4 mr-2" />
            Create Webhook
          </Button>
        </CardFooter>
      </Card>

      <h3 className="text-lg font-medium mt-6">Registered Webhooks</h3>
      
      {webhooks.length === 0 ? (
        <p className="text-muted-foreground">No webhooks registered yet</p>
      ) : (
        <div className="grid gap-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {webhook.type.charAt(0).toUpperCase() + webhook.type.slice(1)} Webhook
                </CardTitle>
                {webhook.description && (
                  <CardDescription>{webhook.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid gap-2">
                  <Label>Webhook URL</Label>
                  <div className="flex items-center">
                    <Input
                      value={`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/webhooks/n8n/${webhook.id}`}
                      readOnly
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <WebhookTestDialog 
                  webhookUrl={`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/webhooks/n8n/${webhook.id}`}
                  webhookType={webhook.type}
                />
                <ConfirmDialog
                  title="Delete Webhook"
                  description="Are you sure you want to delete this webhook? This action cannot be undone."
                  onConfirm={() => handleDeleteWebhook(webhook.id)}
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