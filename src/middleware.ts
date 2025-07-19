import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Define the middleware function
export async function middleware(req: NextRequest) {
  const response = NextResponse.next();
  
  // Add security headers
  const securityHeaders = {
    // Content Security Policy
    "Content-Security-Policy": 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-analytics.com https://cdn.jsdelivr.net; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "img-src 'self' data: https://*.cloudinary.com https://avatars.githubusercontent.com https://www.gravatar.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "connect-src 'self' https://*.vercel-analytics.com https://vitals.vercel-insights.com; " +
      "media-src 'self' https://*.cloudinary.com; " +
      "frame-src 'self' https://js.stripe.com; " +
      "object-src 'none';",
    
    // XSS Protection
    "X-XSS-Protection": "1; mode=block",
    
    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",
    
    // Referrer Policy
    "Referrer-Policy": "strict-origin-when-cross-origin",
    
    // Permissions Policy
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    
    // Frame Options
    "X-Frame-Options": "SAMEORIGIN",
  };

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Handle www to non-www redirect
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";
  
  // Check if the hostname starts with 'www.'
  if (hostname.startsWith("www.")) {
    // Create the new URL without 'www.'
    const newHostname = hostname.replace(/^www\./, "");
    url.host = newHostname;
    
    // Return a 308 Permanent Redirect
    return NextResponse.redirect(url, 308);
  }

  // Handle admin route protection
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    // If no session or not an admin, redirect to login
    if (!session || session.role !== "ADMIN") {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle client portal route protection
  if (req.nextUrl.pathname.startsWith("/client")) {
    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    // If no session, redirect to login
    if (!session) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

// Configure the paths that should be processed by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/|_next/static|_next/image|favicon.ico|public/).*)",
  ],
};