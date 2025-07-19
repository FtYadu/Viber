import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/utils/request-utils";
import { rateLimiter } from "@/lib/rate-limiter";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    const ip = getClientIp(req) || "unknown";
    const { success } = await rateLimiter.limit(`webhook_${ip}`);
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Find the webhook registration
    const webhook = await db.webhookRegistration.findUnique({
      where: {
        id: params.id,
      },
      include: {
        workflowConfig: true,
      },
    });

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    // Parse the request body
    const payload = await req.json();

    // Record the execution
    const execution = await db.workflowExecution.create({
      data: {
        status: "RUNNING",
        payload: JSON.stringify(payload),
        workflowConfigId: webhook.workflowConfig.id,
      },
    });

    // For chatbot webhooks, we need to handle streaming responses
    if (webhook.type === "chatbot") {
      // Process the chatbot request
      try {
        // Connect to Langflow API
        const langflowUrl = process.env.LANGFLOW_API_URL;
        const langflowApiKey = process.env.LANGFLOW_API_KEY;
        
        if (!langflowUrl) {
          throw new Error("Langflow API URL not configured");
        }

        // Prepare headers for Langflow
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (langflowApiKey) {
          headers["Authorization"] = `Bearer ${langflowApiKey}`;
        }

        // Forward the request to Langflow
        const langflowResponse = await fetch(`${langflowUrl}/api/v1/chat/yadu-assistant`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            messages: payload.messages,
            stream: true,
          }),
        });

        if (!langflowResponse.ok) {
          throw new Error(`Langflow API error: ${langflowResponse.status}`);
        }

        // Update execution status to success
        await db.workflowExecution.update({
          where: { id: execution.id },
          data: {
            status: "SUCCESS",
            completedAt: new Date(),
          },
        });

        // Return the streaming response directly
        return new Response(langflowResponse.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        });
      } catch (error) {
        console.error("Error processing chatbot request:", error);
        
        // Update execution status to failed
        await db.workflowExecution.update({
          where: { id: execution.id },
          data: {
            status: "FAILED",
            error: (error as Error).message,
            completedAt: new Date(),
          },
        });

        // Return a fallback response
        return NextResponse.json(
          { error: "Failed to process chatbot request" },
          { status: 500 }
        );
      }
    } else {
      // For non-chatbot webhooks, process normally
      try {
        // Process the webhook based on type
        let result;
        
        switch (webhook.type) {
          case "invoice-notification":
            // Process invoice notification
            result = { status: "processed", type: "invoice-notification" };
            break;
          
          case "client-onboarding":
            // Process client onboarding
            result = { status: "processed", type: "client-onboarding" };
            break;
          
          case "project-update":
            // Process project update
            result = { status: "processed", type: "project-update" };
            break;
          
          case "email-delivery":
            // Process email delivery
            result = { status: "processed", type: "email-delivery" };
            break;
          
          case "custom":
          default:
            // Process custom webhook
            result = { status: "processed", type: "custom" };
            break;
        }

        // Update execution status to success
        await db.workflowExecution.update({
          where: { id: execution.id },
          data: {
            status: "SUCCESS",
            result: JSON.stringify(result),
            completedAt: new Date(),
          },
        });

        return NextResponse.json(result);
      } catch (error) {
        console.error("Error processing webhook:", error);
        
        // Update execution status to failed
        await db.workflowExecution.update({
          where: { id: execution.id },
          data: {
            status: "FAILED",
            error: (error as Error).message,
            completedAt: new Date(),
          },
        });

        return NextResponse.json(
          { error: "Failed to process webhook" },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}