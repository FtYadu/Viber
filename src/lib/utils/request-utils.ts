import { NextRequest } from "next/server";

export function getClientIp(req: NextRequest): string | null {
  // Try to get IP from Vercel's headers
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  // Try to get IP from Vercel's specific header
  const vercelIp = req.headers.get("x-vercel-ip");
  if (vercelIp) {
    return vercelIp;
  }

  // Try to get IP from Cloudflare's header
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Try to get IP from real IP header
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Return null if no IP found
  return null;
}