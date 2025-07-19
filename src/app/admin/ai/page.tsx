import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BrainCircuit, Mail, MessageSquare } from "lucide-react";

export default async function AIToolsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">AI Tools</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BrainCircuit className="h-5 w-5 mr-2" />
              Content Generation
            </CardTitle>
            <CardDescription>
              Generate captions and content using AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Use AI to generate captions, content, and creative text for your projects and clients.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/admin/ai/content">
                Open Content Generator
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Email Assistant
            </CardTitle>
            <CardDescription>
              AI-powered email drafting and composition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Draft professional emails quickly with AI assistance based on context and purpose.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/admin/ai/email">
                Open Email Assistant
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Chatbot
            </CardTitle>
            <CardDescription>
              Configure and manage the website chatbot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Set up the AI-powered chatbot that helps visitors learn about your services and portfolio.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/admin/ai/chatbot">
                Configure Chatbot
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}