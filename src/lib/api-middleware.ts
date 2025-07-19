import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "./utils/request-utils";
import { rateLimiter } from "./rate-limiter";

export type ApiHandler = (
  req: NextRequest,
  params?: any
) => Promise<NextResponse> | NextResponse;

/**
 * Middleware for API routes that adds rate limiting and error handling
 */
export function withApiMiddleware(
  handler: ApiHandler,
  options: {
    rateLimit?: {
      limit: number;
      window: number; // in seconds
    };
  } = {}
) {
  return async (req: NextRequest, params?: any) => {
    try {
      // Apply rate limiting if configured
      if (options.rateLimit) {
        const ip = getClientIp(req) || "unknown";
        const { success, limit, remaining } = await rateLimiter.limit(
          `api_${req.nextUrl.pathname}_${ip}`,
          options.rateLimit.limit,
          options.rateLimit.window
        );

        if (!success) {
          return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            {
              status: 429,
              headers: {
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": remaining.toString(),
                "Retry-After": options.rateLimit.window.toString(),
              },
            }
          );
        }
      }

      // Call the handler
      return await handler(req, params);
    } catch (error) {
      console.error(`API Error (${req.nextUrl.pathname}):`, error);

      // Handle different types of errors
      if ((error as any).code === "P2025") {
        // Prisma not found error
        return NextResponse.json(
          { error: "Resource not found" },
          { status: 404 }
        );
      }

      if ((error as any).name === "ValidationError") {
        return NextResponse.json(
          { error: (error as Error).message },
          { status: 400 }
        );
      }

      if ((error as any).name === "UnauthorizedError") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      // Default to 500 internal server error
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}