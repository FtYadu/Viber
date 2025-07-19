"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, Send } from "lucide-react";
import { ChatMessage, chatService } from "@/lib/services/chat-service";
import { ChatMessageItem } from "./chat-message-item";
import { useToast } from "@/hooks/use-toast";

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize chat session
  useEffect(() => {
    const initChat = async () => {
      try {
        const session = await chatService.getSession();
        
        if (session) {
          setMessages(session.messages);
        } else {
          // Create a new session if none exists
          await chatService.createSession();
          const newSession = await chatService.getSession();
          if (newSession) {
            setMessages(newSession.messages);
          }
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast({
          title: "Error",
          description: "Failed to initialize chat. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initChat();
  }, [toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

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

      // Send message to API and get streaming response
      const stream = await chatService.sendMessage(input);
      
      if (!stream) {
        throw new Error("Failed to get response");
      }

      // Process the stream
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedResponse = "";

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
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      // Remove the placeholder message if there was an error
      setMessages((prev) => prev.filter((msg) => !msg.id.includes("placeholder")));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = async () => {
    try {
      setIsInitializing(true);
      await chatService.clearSession();
      await chatService.createSession();
      const newSession = await chatService.getSession();
      
      if (newSession) {
        setMessages(newSession.messages);
      } else {
        setMessages([]);
      }
      
      toast({
        title: "Chat Reset",
        description: "Your conversation has been reset.",
      });
    } catch (error) {
      console.error("Error resetting chat:", error);
      toast({
        title: "Error",
        description: "Failed to reset chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <Card className="w-[350px] md:w-[450px] h-[500px] flex flex-col shadow-xl border-gray-200">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Chat with Yadu Assistant</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetChat}
            disabled={isInitializing || isLoading}
            className="h-8 w-8 p-0"
            aria-label="Reset chat"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 overflow-y-auto flex-grow">
        {isInitializing ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            <p>Start a conversation with Yadu Assistant</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages
              .filter((msg) => msg.role !== "system") // Don't show system messages
              .map((message) => (
                <ChatMessageItem key={message.id} message={message} />
              ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t">
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
            disabled={isLoading || isInitializing}
            className="flex-grow"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || isInitializing || !input.trim()}
            className={isLoading ? "opacity-70" : ""}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}