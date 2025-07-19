"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export function SetupGuide() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Langflow Setup Guide</CardTitle>
        <CardDescription>
          Learn how to set up Langflow for the chatbot integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="installation">
          <TabsList className="mb-4">
            <TabsTrigger value="installation">Installation</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="chain">Chain Setup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="installation">
            <div className="space-y-4">
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Prerequisites</AlertTitle>
                <AlertDescription>
                  You need Python 3.10+ and pip installed on your system.
                </AlertDescription>
              </Alert>
              
              <h3 className="text-lg font-medium">Installing Langflow</h3>
              
              <div className="space-y-2">
                <p>Install Langflow using pip:</p>
                <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">
                  <code>pip install langflow</code>
                </pre>
                
                <p className="mt-4">Or using Docker:</p>
                <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">
                  <code>docker pull langflow/langflow:latest</code>
                </pre>
                
                <p className="mt-4">Run Langflow:</p>
                <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">
                  <code>langflow run --host 0.0.0.0 --port 7860</code>
                </pre>
                
                <p className="mt-4">For Docker:</p>
                <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">
                  <code>docker run -p 7860:7860 langflow/langflow</code>
                </pre>
                
                <p className="mt-4">
                  Once running, Langflow will be available at <code>http://localhost:7860</code>
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="configuration">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuring Langflow</h3>
              
              <div className="space-y-2">
                <p>1. Create an API key in Langflow:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Go to Settings in the Langflow UI</li>
                  <li>Navigate to the API Keys section</li>
                  <li>Create a new API key with a descriptive name</li>
                  <li>Copy the API key for later use</li>
                </ul>
                
                <p className="mt-4">2. Set environment variables in your application:</p>
                <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">
                  <code>
                    LANGFLOW_API_URL=http://your-langflow-host:7860<br/>
                    LANGFLOW_API_KEY=your_api_key_here
                  </code>
                </pre>
                
                <p className="mt-4">3. Configure CORS in Langflow:</p>
                <p>
                  If your application is running on a different domain, you'll need to configure CORS in Langflow.
                  Create a <code>.env</code> file in your Langflow directory:
                </p>
                <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">
                  <code>
                    LANGFLOW_ALLOW_ORIGINS=http://your-app-domain.com<br/>
                    LANGFLOW_ALLOW_CREDENTIALS=true
                  </code>
                </pre>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="chain">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Setting Up the Yadu-Assistant Chain</h3>
              
              <div className="space-y-2">
                <p>1. Create a new flow in Langflow:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Click "Create Flow" in the Langflow UI</li>
                  <li>Name it "yadu-assistant" (important: this exact name is used in the API)</li>
                </ul>
                
                <p className="mt-4">2. Set up the components:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Add a ChatOpenAI component and configure it with your OpenAI API key</li>
                  <li>Add a ConversationBufferMemory component</li>
                  <li>Add a PromptTemplate component with the system prompt</li>
                  <li>Add a ConversationalRetrievalChain component</li>
                  <li>Add a VectorStore component (optional, for knowledge base)</li>
                </ul>
                
                <p className="mt-4">3. Configure the system prompt:</p>
                <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">
                  <code>
                    You are Yadu Assistant, a helpful AI assistant for Yadu Krishnan's portfolio and business website.<br/>
                    You can provide information about Yadu's services, skills, and portfolio.<br/>
                    Be professional, friendly, and helpful.<br/><br/>
                    
                    About Yadu:<br/>
                    - Yadu is a full-stack developer specializing in web and mobile applications<br/>
                    - He offers freelance services including web development, app development, and consulting<br/>
                    - His portfolio includes projects in React, Next.js, Node.js, and mobile development<br/>
                    - He has expertise in UI/UX design, database design, and cloud infrastructure
                  </code>
                </pre>
                
                <p className="mt-4">4. Connect the components:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Connect the PromptTemplate to the ConversationalRetrievalChain</li>
                  <li>Connect the ChatOpenAI to the ConversationalRetrievalChain</li>
                  <li>Connect the ConversationBufferMemory to the ConversationalRetrievalChain</li>
                  <li>If using a VectorStore, connect it to the ConversationalRetrievalChain</li>
                </ul>
                
                <p className="mt-4">5. Export and save the flow</p>
                
                <p className="mt-4">6. Test the flow using the chat interface in Langflow</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}