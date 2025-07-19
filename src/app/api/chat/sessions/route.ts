import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { getClientIp } from "@/lib/utils/request-utils";
import { rateLimiter } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting (10 requests per minute per IP)
    const ip = getClientIp(req) || "unknown";
    const { success } = await rateLimiter.limit(`chat_session_${ip}`);
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Create a new chat session
    const session = await db.chatSession.create({
      data: {
        id: uuidv4(),
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || "unknown",
        messages: {
          create: [
            {
              id: uuidv4(),
              role: "system",
              content: "You are Yadu Assistant, a helpful AI assistant for Yadu Krishnan's portfolio and business website. You can provide information about Yadu's services, skills, and portfolio. Be professional, friendly, and helpful.",
            }
          ]
        }
      },
      include: {
        messages: true,
      }
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error creating chat session:", error);
    return NextResponse.json(
      { error: "Failed to create chat session" },
      { status: 500 }
    );
  }
}