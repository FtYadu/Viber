import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

class ChatService {
  private apiUrl = "/api/chat";
  private sessionId: string | null = null;

  constructor() {
    // Try to load session from localStorage
    if (typeof window !== "undefined") {
      this.sessionId = localStorage.getItem("chat_session_id");
    }
  }

  async createSession(): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create chat session");
      }

      const data = await response.json();
      this.sessionId = data.id;
      
      // Save session ID to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("chat_session_id", data.id);
      }
      
      return data.id;
    } catch (error) {
      console.error("Error creating chat session:", error);
      toast.error("Failed to initialize chat. Please try again.");
      throw error;
    }
  }

  async getSession(): Promise<ChatSession | null> {
    if (!this.sessionId) {
      return null;
    }

    try {
      const response = await fetch(`${this.apiUrl}/sessions/${this.sessionId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Session not found, clear local storage
          if (typeof window !== "undefined") {
            localStorage.removeItem("chat_session_id");
          }
          this.sessionId = null;
          return null;
        }
        throw new Error("Failed to get chat session");
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting chat session:", error);
      return null;
    }
  }

  async sendMessage(content: string): Promise<ReadableStream<Uint8Array> | null> {
    if (!this.sessionId) {
      await this.createSession();
    }

    try {
      const response = await fetch(`${this.apiUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Return the stream for real-time processing
      return response.body;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
      return null;
    }
  }

  async clearSession(): Promise<void> {
    if (!this.sessionId) {
      return;
    }

    try {
      await fetch(`${this.apiUrl}/sessions/${this.sessionId}`, {
        method: "DELETE",
      });
      
      // Clear session ID from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("chat_session_id");
      }
      this.sessionId = null;
    } catch (error) {
      console.error("Error clearing chat session:", error);
    }
  }
}

// Export as singleton
export const chatService = new ChatService();