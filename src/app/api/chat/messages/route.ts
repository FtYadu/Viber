import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { getClientIp } from "@/lib/utils/request-utils";
import { rateLimiter } from "@/lib/rate-limiter";
import { n8nService } from "@/lib/services/n8n-service";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting (10 requests per minute per IP)
    const ip = getClientIp(req) || "unknown";
    const { success } = await rateLimiter.limit(`chat_message_${ip}`, 10);
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { sessionId, content } = await req.json();

    if (!sessionId || !content) {
      return NextResponse.json(
        { error: "Session ID and content are required" },
        { status: 400 }
      );
    }

    // Check if session exists
    const session = await db.chatSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Save user message to database
    const userMessage = await db.chatMessage.create({
      data: {
        id: uuidv4(),
        role: "user",
        content,
        sessionId,
      },
    });

    // Prepare context for AI
    const messageHistory = session.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add the new user message
    messageHistory.push({
      role: "user",
      content,
    });

    // Create a placeholder for the assistant's response
    const assistantMessageId = uuidv4();
    await db.chatMessage.create({
      data: {
        id: assistantMessageId,
        role: "assistant",
        content: "", // Will be updated as the stream comes in
        sessionId,
      },
    });

    // Send request to n8n webhook for Langflow processing
    const webhooks = await db.webhookRegistration.findMany({
      where: {
        type: "chatbot",
      },
      take: 1,
    });

    if (webhooks.length === 0) {
      // Fallback response if no webhook is configured
      const fallbackResponse = new ReadableStream({
        start(controller) {
          const message = "I'm sorry, the chatbot is not fully configured yet. Please try again later.";
          controller.enqueue(new TextEncoder().encode(message));
          controller.close();
        },
      });

      // Update the placeholder message
      await db.chatMessage.update({
        where: { id: assistantMessageId },
        data: { content: "I'm sorry, the chatbot is not fully configured yet. Please try again later." },
      });

      return new Response(fallbackResponse, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    // Use the first webhook found
    const webhook = webhooks[0];

    // Create a transform stream to update the database as chunks come in
    let assistantResponse = "";
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        assistantResponse += text;
        controller.enqueue(chunk);
      },
      flush(controller) {
        // Update the message in the database with the complete response
        db.chatMessage.update({
          where: { id: assistantMessageId },
          data: { content: assistantResponse },
        }).catch(error => {
          console.error("Error updating chat message:", error);
        });
      }
    });

    // Send to n8n webhook and get streaming response
    const response = await n8nService.triggerWebhook(webhook.id, {
      sessionId,
      messages: messageHistory,
    });

    if (!response.ok) {
      const errorStream = new ReadableStream({
        start(controller) {
          const message = "I'm sorry, I encountered an error processing your request. Please try again later.";
          controller.enqueue(new TextEncoder().encode(message));
          controller.close();
        },
      });

      // Update the placeholder message
      await db.chatMessage.update({
        where: { id: assistantMessageId },
        data: { content: "I'm sorry, I encountered an error processing your request. Please try again later." },
      });

      return new Response(errorStream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    // Return streaming response
    const stream = response.body!.pipeThrough(transformStream);
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (error) {
    console.error("Error processing chat message:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}