"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Trash } from "lucide-react";
import { WebhookRegistration, WorkflowConfig } from "@prisma/client";
import { ChatMessage } from "@/lib/services/chat-service";
import { Avatar } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface ChatbotTestPanelProps {
  webhooks: (WebhookRegistration & {
    workflowConfig: WorkflowConfig;
  })[];
}

export function ChatbotTestPanel({ webhooks }: ChatbotTestPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Check if there are any chatbot webhooks configured
    if (webhooks.length === 0) {
      toast.error("No chatbot webhooks configured. Please set up a webhook first.");
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Create a placeholder for the assistant's response
      const placeholderId = Date.now().toString() + "-placeholder";
      const placeholderMessage: ChatMessage = {
        id: placeholderId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, placeholderMessage]);

      // Use the first webhook
      const webhook = webhooks[0];
      const webhookUrl = `${window.location.origin}/api/webhooks/n8n/${webhook.id}`;

      // Send message to webhook
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are Yadu Assistant, a helpful AI assistant for Yadu Krishnan's portfolio and business website. You can provide information about Yadu's services, skills, and portfolio. Be professional, friendly, and helpful.",
            },
            {
              role: "user",
              content: input,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Process the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedResponse = "";

      if (reader) {
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          
          if (value) {
            const chunkText = decoder.decode(value);
            accumulatedResponse += chunkText;
            
            // Update the placeholder message with the accumulated response
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === placeholderId
                  ? { ...msg, content: accumulatedResponse }
                  : msg
              )
            );
          }
        }
      }

      // Replace the placeholder ID with the actual message ID
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === placeholderId
            ? { ...msg, id: Date.now().toString() + "-response" }
            : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message: " + (error as Error).message);
      
      // Remove the placeholder message if there was an error
      setMessages((prev) => prev.filter((msg) => !msg.id.includes("placeholder")));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Test Chatbot</CardTitle>
            <CardDescription>
              Test the chatbot functionality in this sandbox environment
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearChat}
            disabled={messages.length === 0}
          >
            <Trash className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto pb-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Bot className="h-12 w-12 mb-4 opacity-20" />
            <p>No messages yet. Start a conversation to test the chatbot.</p>
            {webhooks.length === 0 && (
              <p className="mt-2 text-sm text-red-500">
                No chatbot webhooks configured. Please set up a webhook first.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  message.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <Avatar className={cn("h-8 w-8", message.role === "user" ? "bg-primary" : "bg-muted")}>
                  {message.role === "user" ? (
                    <User className="h-5 w-5 text-primary-foreground" />
                  ) : (
                    <Bot className="h-5 w-5" />
                  )}
                </Avatar>
                <div
                  className={cn(
                    "rounded-lg p-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {message.role === "user" ? (
                    <p className="text-sm">{message.content}</p>
                  ) : (
                    <div className="text-sm prose-sm max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                      {message.id.includes("placeholder") && message.content === "" && (
                        <span className="animate-pulse">▌</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex w-full gap-2"
        >
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || webhooks.length === 0}
            className="flex-grow"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim() || webhooks.length === 0}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}