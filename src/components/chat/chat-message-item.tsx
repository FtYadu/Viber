"use client";

import { useState, useEffect } from "react";
import { ChatMessage } from "@/lib/services/chat-service";
import { Avatar } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface ChatMessageItemProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const [isTyping, setIsTyping] = useState(false);
  const [displayedContent, setDisplayedContent] = useState("");
  const isUser = message.role === "user";

  // Simulate typing effect for assistant messages
  useEffect(() => {
    if (message.role === "assistant" && message.content) {
      setIsTyping(true);
      let index = 0;
      const content = message.content;
      
      // If content is very short, don't animate
      if (content.length < 20) {
        setDisplayedContent(content);
        setIsTyping(false);
        return;
      }

      const interval = setInterval(() => {
        setDisplayedContent(content.substring(0, index));
        index++;
        
        if (index > content.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 10); // Speed of typing

      return () => clearInterval(interval);
    } else {
      setDisplayedContent(message.content);
    }
  }, [message.content, message.role]);

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%]",
        isUser ? "ml-auto flex-row-reverse" : ""
      )}
    >
      <Avatar className={cn("h-8 w-8", isUser ? "bg-primary" : "bg-muted")}>
        {isUser ? (
          <User className="h-5 w-5 text-primary-foreground" />
        ) : (
          <Bot className="h-5 w-5" />
        )}
      </Avatar>
      <div
        className={cn(
          "rounded-lg p-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {isUser ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <div className="text-sm prose-sm max-w-none">
            <ReactMarkdown>{displayedContent}</ReactMarkdown>
            {isTyping && <span className="animate-pulse">▌</span>}
          </div>
        )}
      </div>
    </div>
  );
}