import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Create a rate limiter that allows 10 requests per minute by default
export const rateLimiter = {
  async limit(
    identifier: string,
    limit: number = 10,
    window: number = 60 // 60 seconds = 1 minute
  ): Promise<{ success: boolean; limit: number; remaining: number }> {
    // If Redis is not configured, allow all requests
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return { success: true, limit, remaining: 999 };
    }

    try {
      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${window}s`),
        analytics: true,
      });

      const result = await ratelimit.limit(identifier);
      
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
      };
    } catch (error) {
      console.error("Rate limiting error:", error);
      // In case of error, allow the request
      return { success: true, limit, remaining: 999 };
    }
  },
};