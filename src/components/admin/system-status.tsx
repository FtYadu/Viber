"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface HealthCheckResponse {
  status: "healthy" | "unhealthy" | "error";
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: {
      ok: boolean;
      message: string;
      error?: string;
    };
    environment: {
      ok: boolean;
      message: string;
      missing?: string[];
    };
  };
}

export function SystemStatus() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Format uptime in a human-readable format
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);

    return parts.join(" ");
  };

  // Fetch health status
  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/health");
      const data = await response.json();

      setHealth(data);
      setLastChecked(new Date());
    } catch (err) {
      setError("Failed to fetch health status");
      console.error("Health check error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch health status on component mount
  useEffect(() => {
    fetchHealth();
    
    // Set up auto-refresh every 60 seconds
    const interval = setInterval(fetchHealth, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">System Health</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchHealth}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error Checking System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      ) : loading && !health ? (
        <Card>
          <CardContent className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : health ? (
        <div className="grid gap-6">
          <Card className={health.status === "healthy" ? "border-green-200" : "border-red-200"}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  {health.status === "healthy" ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      <span>System Status</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 mr-2 text-red-500" />
                      <span>System Status</span>
                    </>
                  )}
                </CardTitle>
                <Badge variant={health.status === "healthy" ? "success" : "destructive"}>
                  {health.status}
                </Badge>
              </div>
              <CardDescription>
                Last checked: {lastChecked ? format(lastChecked, "PPpp") : "Never"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Version</p>
                    <p>{health.version}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                    <p>{formatUptime(health.uptime)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {health.checks.database.ok ? (
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                      )}
                      <span>Database</span>
                    </div>
                    <Badge variant={health.checks.database.ok ? "outline" : "destructive"}>
                      {health.checks.database.ok ? "Connected" : "Error"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {health.checks.environment.ok ? (
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                      )}
                      <span>Environment</span>
                    </div>
                    <Badge variant={health.checks.environment.ok ? "outline" : "destructive"}>
                      {health.checks.environment.ok ? "OK" : "Missing Variables"}
                    </Badge>
                  </div>

                  {health.checks.environment.missing && health.checks.environment.missing.length > 0 && (
                    <div className="bg-red-50 p-3 rounded-md text-sm">
                      <p className="font-medium text-red-700">Missing Environment Variables:</p>
                      <ul className="list-disc list-inside mt-1">
                        {health.checks.environment.missing.map((variable) => (
                          <li key={variable} className="text-red-700">{variable}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {health.checks.database.error && (
                    <div className="bg-red-50 p-3 rounded-md text-sm">
                      <p className="font-medium text-red-700">Database Error:</p>
                      <p className="text-red-700 mt-1">{health.checks.database.error}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Node.js Version</p>
                    <p>{process.version}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Environment</p>
                    <p>{process.env.NODE_ENV}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Server Time</p>
                    <p>{format(new Date(), "PPpp")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Deployment</p>
                    <p>{process.env.NEXT_PUBLIC_VERCEL_ENV || "Local"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}