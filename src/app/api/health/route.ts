import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic"; // No caching for health checks

export async function GET(req: NextRequest) {
  try {
    // Check database connection
    const dbStatus = await checkDatabase();
    
    // Check environment variables
    const envStatus = checkEnvironment();
    
    // Prepare response
    const status = dbStatus.ok && envStatus.ok ? "healthy" : "unhealthy";
    const statusCode = status === "healthy" ? 200 : 503;
    
    // Return health status
    return NextResponse.json(
      {
        status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.NEXT_PUBLIC_APP_VERSION || "development",
        checks: {
          database: dbStatus,
          environment: envStatus,
        },
      },
      { status: statusCode }
    );
  } catch (error) {
    console.error("Health check failed:", error);
    
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 500 }
    );
  }
}

// Check database connection
async function checkDatabase() {
  try {
    // Execute a simple query to check database connection
    await db.$queryRaw`SELECT 1`;
    
    return {
      ok: true,
      message: "Database connection successful",
    };
  } catch (error) {
    console.error("Database health check failed:", error);
    
    return {
      ok: false,
      message: "Database connection failed",
      error: (error as Error).message,
    };
  }
}

// Check required environment variables
function checkEnvironment() {
  const requiredVars = [
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
  ];
  
  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    return {
      ok: false,
      message: "Missing required environment variables",
      missing: missingVars,
    };
  }
  
  return {
    ok: true,
    message: "All required environment variables are set",
  };
}