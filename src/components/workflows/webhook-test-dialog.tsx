import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, TestTube2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WebhookTestDialogProps {
  webhookUrl: string;
  webhookType: string;
}

export function WebhookTestDialog({ webhookUrl, webhookType }: WebhookTestDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState("{\n  \"test\": true\n}");
  const [response, setResponse] = useState<{
    status: number;
    data: any;
  } | null>(null);

  const handleTest = async () => {
    try {
      setLoading(true);
      setResponse(null);
      
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(payload);
      } catch (e) {
        toast.error("Invalid JSON payload");
        return;
      }

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedPayload),
      });

      let responseData;
      try {
        responseData = await res.json();
      } catch (e) {
        responseData = await res.text();
      }

      setResponse({
        status: res.status,
        data: responseData,
      });

      if (res.ok) {
        toast.success("Webhook test successful");
      } else {
        toast.error(`Webhook test failed with status ${res.status}`);
      }
    } catch (error) {
      toast.error("Failed to test webhook: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <TestTube2 className="h-4 w-4 mr-2" />
          Test Webhook
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Test Webhook</DialogTitle>
          <DialogDescription>
            Send a test payload to the webhook endpoint to verify it's working correctly.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              value={webhookUrl}
              readOnly
              className="font-mono text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="webhook-type">Webhook Type</Label>
            <Input
              id="webhook-type"
              value={webhookType}
              readOnly
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="payload">Test Payload (JSON)</Label>
            <Textarea
              id="payload"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className="font-mono text-sm h-32"
            />
          </div>

          {response && (
            <div className="grid gap-2">
              <Label>Response</Label>
              <Alert variant={response.status >= 200 && response.status < 300 ? "default" : "destructive"}>
                <AlertDescription>
                  <div className="font-medium">Status: {response.status}</div>
                  <pre className="mt-2 bg-secondary/50 p-2 rounded-md overflow-auto text-xs">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline">
            Close
          </Button>
          <Button onClick={handleTest} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test Webhook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}