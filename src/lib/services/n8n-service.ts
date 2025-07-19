class N8nService {
  private apiUrl: string;
  private apiKey: string | null;

  constructor() {
    this.apiUrl = process.env.N8N_URL || "http://localhost:5678";
    this.apiKey = process.env.N8N_API_KEY || null;
  }
  
  getWebhookUrl(workflowType: string): string {
    // This is a simplified implementation - in a real app, you'd have different webhook URLs for different workflow types
    return `${this.apiUrl}/webhook/${workflowType}`;
  }
  
  async setWorkflowActive(workflowId: string, active: boolean): Promise<void> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (this.apiKey) {
        headers["X-N8N-API-KEY"] = this.apiKey;
      }

      await fetch(`${this.apiUrl}/api/v1/workflows/${workflowId}/activate`, {
        method: active ? "POST" : "DELETE",
        headers,
      });
    } catch (error) {
      console.error(`Error ${active ? 'activating' : 'deactivating'} workflow:`, error);
      throw error;
    }
  }

  async triggerWorkflow(
    workflowId: string,
    payload: any
  ): Promise<{ executionId: string }> {
    try {
      const workflow = await this.getWorkflowConfig(workflowId);
      
      if (!workflow) {
        throw new Error("Workflow not found");
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (this.apiKey) {
        headers["X-N8N-API-KEY"] = this.apiKey;
      }

      const response = await fetch(workflow.webhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to trigger workflow: ${response.status}`);
      }
      
      // In a real implementation, n8n would return an execution ID
      // For now, we'll generate a mock execution ID
      return { 
        executionId: `exec-${Date.now()}-${Math.floor(Math.random() * 1000)}` 
      };
    } catch (error) {
      console.error("Error triggering n8n workflow:", error);
      throw error;
    }
  }

  async triggerWebhook(
    webhookId: string,
    payload: any
  ): Promise<Response> {
    try {
      const { db } = await import("@/lib/db");
      
      const webhook = await db.webhookRegistration.findUnique({
        where: { id: webhookId },
        include: { workflowConfig: true },
      });

      if (!webhook) {
        throw new Error("Webhook not found");
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (this.apiKey) {
        headers["X-N8N-API-KEY"] = this.apiKey;
      }

      return fetch(webhook.workflowConfig.webhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...payload,
          webhookType: webhook.type,
          webhookId,
        }),
      });
    } catch (error) {
      console.error("Error triggering n8n webhook:", error);
      throw error;
    }
  }

  async getWorkflows() {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (this.apiKey) {
        headers["X-N8N-API-KEY"] = this.apiKey;
      }

      const response = await fetch(`${this.apiUrl}/api/v1/workflows`, {
        method: "GET",
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get workflows: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting n8n workflows:", error);
      // Return empty array instead of throwing to make the API more resilient
      return [];
    }
  }
  
  private async getWorkflowConfig(workflowId: string) {
    const { db } = await import("@/lib/db");
    
    return db.workflowConfig.findUnique({
      where: { id: workflowId },
    });
  }
}

// Export as singleton
export const n8nService = new N8nService();