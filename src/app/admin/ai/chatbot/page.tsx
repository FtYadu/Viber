import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatbotConfigForm } from "@/components/ai/chatbot-config-form";
import { ChatbotTestPanel } from "@/components/ai/chatbot-test-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { SetupGuide } from "./setup-guide";

export default async function ChatbotConfigPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    notFound();
  }

  // Get chatbot webhook registrations
  const chatbotWebhooks = await db.webhookRegistration.findMany({
    where: {
      type: "chatbot",
    },
    include: {
      workflowConfig: true,
    },
  });

  // Get environment variables
  const langflowApiUrl = process.env.LANGFLOW_API_URL || "";
  const langflowApiKey = process.env.LANGFLOW_API_KEY ? "[CONFIGURED]" : "";

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Chatbot Configuration</h1>

      <div className="grid gap-6">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Integration Information</AlertTitle>
          <AlertDescription>
            The chatbot system integrates Langflow for AI processing through n8n workflows.
            Configure your Langflow API and register a webhook to enable the chatbot functionality.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="test">Test Chatbot</TabsTrigger>
            <TabsTrigger value="guide">Setup Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Langflow API Configuration</CardTitle>
                  <CardDescription>
                    Configure the connection to your Langflow instance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="langflow-url">Langflow API URL</Label>
                      <Input
                        id="langflow-url"
                        value={langflowApiUrl}
                        placeholder="http://localhost:7860"
                        disabled
                      />
                      <p className="text-sm text-muted-foreground">
                        Set the LANGFLOW_API_URL environment variable to change this value
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="langflow-key">Langflow API Key</Label>
                      <Input
                        id="langflow-key"
                        value={langflowApiKey}
                        type="password"
                        placeholder="••••••••"
                        disabled
                      />
                      <p className="text-sm text-muted-foreground">
                        Set the LANGFLOW_API_KEY environment variable to change this value
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <ChatbotConfigForm existingWebhooks={chatbotWebhooks} />
            </div>
          </TabsContent>
          
          <TabsContent value="test">
            <ChatbotTestPanel webhooks={chatbotWebhooks} />
          </TabsContent>
          
          <TabsContent value="guide">
            <SetupGuide />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}