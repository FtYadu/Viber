import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, FileCode, FileJson, Info } from "lucide-react";

export function WorkflowDocumentation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Info className="h-5 w-5 mr-2" />
          Workflow Documentation
        </CardTitle>
        <CardDescription>
          Learn how to set up and use n8n workflows with this application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="setup">
          <TabsList className="mb-4">
            <TabsTrigger value="setup">Setup Guide</TabsTrigger>
            <TabsTrigger value="webhooks">Webhook Integration</TabsTrigger>
            <TabsTrigger value="examples">Example Workflows</TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup">
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Prerequisites</AlertTitle>
                <AlertDescription>
                  You need to have n8n installed and running. You can install it using Docker, npm, or other methods.
                  Visit <a href="https://docs.n8n.io/getting-started/installation/" target="_blank" rel="noopener noreferrer" className="underline">n8n documentation</a> for installation instructions.
                </AlertDescription>
              </Alert>
              
              <h3 className="text-lg font-medium">Setting Up n8n Integration</h3>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="step1">
                  <AccordionTrigger>Step 1: Configure n8n URL</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Set the N8N_URL environment variable in your .env file to point to your n8n instance:
                    </p>
                    <pre className="bg-gray-100 p-2 rounded-md">
                      N8N_URL=http://localhost:5678
                    </pre>
                    <p className="mt-2">
                      If your n8n instance requires authentication, also set the N8N_API_KEY variable:
                    </p>
                    <pre className="bg-gray-100 p-2 rounded-md">
                      N8N_API_KEY=your_api_key_here
                    </pre>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="step2">
                  <AccordionTrigger>Step 2: Create a Workflow in n8n</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      1. Open your n8n instance and create a new workflow
                    </p>
                    <p className="mb-2">
                      2. Add a Webhook node as the trigger (this will be your entry point)
                    </p>
                    <p className="mb-2">
                      3. Configure the webhook to receive POST requests
                    </p>
                    <p className="mb-2">
                      4. Add your workflow logic after the webhook node
                    </p>
                    <p className="mb-2">
                      5. Save and activate the workflow
                    </p>
                    <p className="mb-2">
                      6. Copy the webhook URL from n8n
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="step3">
                  <AccordionTrigger>Step 3: Register the Workflow in this App</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      1. Go to the Workflows section in the admin panel
                    </p>
                    <p className="mb-2">
                      2. Click "Create Workflow"
                    </p>
                    <p className="mb-2">
                      3. Enter a name and description for your workflow
                    </p>
                    <p className="mb-2">
                      4. Paste the n8n webhook URL
                    </p>
                    <p className="mb-2">
                      5. Select the appropriate workflow type
                    </p>
                    <p className="mb-2">
                      6. Save the workflow configuration
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
          
          <TabsContent value="webhooks">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Webhook Integration</h3>
              
              <p className="mb-4">
                This application provides webhook endpoints that can be registered to receive events from n8n workflows.
                These webhooks allow n8n to send data back to the application.
              </p>
              
              <div className="grid gap-4">
                <div className="flex items-start space-x-2">
                  <FileCode className="h-5 w-5 mt-0.5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Available Webhook Types</h4>
                    <ul className="list-disc list-inside mt-2 space-y-2">
                      <li>
                        <strong>invoice-notification</strong>: Receives invoice status updates
                      </li>
                      <li>
                        <strong>client-onboarding</strong>: Handles client onboarding process events
                      </li>
                      <li>
                        <strong>project-update</strong>: Receives project status updates
                      </li>
                      <li>
                        <strong>email-delivery</strong>: Handles email delivery status updates
                      </li>
                      <li>
                        <strong>custom</strong>: For custom webhook integrations
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <FileJson className="h-5 w-5 mt-0.5 text-green-500" />
                  <div>
                    <h4 className="font-medium">Webhook Payload Format</h4>
                    <p className="mt-1 mb-2">
                      Webhooks expect JSON payloads with the following structure:
                    </p>
                    <pre className="bg-gray-100 p-2 rounded-md text-sm">
{`{
  "event": "string",  // Event type
  "data": {          // Event data
    // Varies by webhook type
  },
  "timestamp": "string",  // ISO timestamp
  "signature": "string"   // Optional signature for verification
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="examples">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Example Workflows</h3>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="example1">
                  <AccordionTrigger>Invoice Follow-up Workflow</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      This workflow automatically sends follow-up emails for unpaid invoices.
                    </p>
                    <h4 className="font-medium mt-4">Workflow Steps:</h4>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Trigger: Webhook receives invoice status update</li>
                      <li>Filter: Check if invoice is unpaid and due date has passed</li>
                      <li>Wait: Delay for 3 days after due date</li>
                      <li>HTTP Request: Get invoice details from API</li>
                      <li>HTTP Request: Get client details from API</li>
                      <li>Send Email: Send reminder email using Resend</li>
                      <li>HTTP Request: Update invoice status to "reminder-sent"</li>
                    </ol>
                    <p className="mt-4">
                      <a href="#" className="text-blue-500 underline">Download workflow JSON</a>
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="example2">
                  <AccordionTrigger>Client Onboarding Workflow</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      This workflow automates the client onboarding process.
                    </p>
                    <h4 className="font-medium mt-4">Workflow Steps:</h4>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Trigger: Webhook receives new client notification</li>
                      <li>HTTP Request: Create client record in CRM</li>
                      <li>Send Email: Welcome email to client</li>
                      <li>Wait: Delay for 1 day</li>
                      <li>HTTP Request: Create Google Drive folder for client</li>
                      <li>Send Email: Send folder access to client</li>
                      <li>Wait: Delay for 3 days</li>
                      <li>Send Email: Follow-up email to check if client has questions</li>
                    </ol>
                    <p className="mt-4">
                      <a href="#" className="text-blue-500 underline">Download workflow JSON</a>
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="example3">
                  <AccordionTrigger>Project Deadline Notification</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      This workflow sends notifications for upcoming project deadlines.
                    </p>
                    <h4 className="font-medium mt-4">Workflow Steps:</h4>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Trigger: Schedule (runs daily)</li>
                      <li>HTTP Request: Get projects with deadlines in the next 7 days</li>
                      <li>Loop: For each project</li>
                      <li>HTTP Request: Get project details and client information</li>
                      <li>Send Email: Send deadline reminder to admin</li>
                      <li>IF: Check if client notification is enabled</li>
                      <li>Send Email: Send gentle reminder to client</li>
                      <li>HTTP Request: Log notification in system</li>
                    </ol>
                    <p className="mt-4">
                      <a href="#" className="text-blue-500 underline">Download workflow JSON</a>
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}