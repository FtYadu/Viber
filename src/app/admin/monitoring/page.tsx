import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemStatus } from "@/components/admin/system-status";
import { ErrorLogs } from "@/components/admin/error-logs";
import { PerformanceMetrics } from "@/components/admin/performance-metrics";
import { UptimeMonitoring } from "@/components/admin/uptime-monitoring";

export const dynamic = "force-dynamic"; // No caching for monitoring page

export default async function MonitoringPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    notFound();
  }

  // Get application version
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || "development";
  const nodeEnv = process.env.NODE_ENV || "development";

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Monitor application health, performance, and errors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Version: {appVersion}</Badge>
          <Badge variant={nodeEnv === "production" ? "default" : "secondary"}>
            {nodeEnv}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList>
          <TabsTrigger value="status">System Status</TabsTrigger>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="uptime">Uptime</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status">
          <SystemStatus />
        </TabsContent>
        
        <TabsContent value="errors">
          <ErrorLogs />
        </TabsContent>
        
        <TabsContent value="performance">
          <PerformanceMetrics />
        </TabsContent>
        
        <TabsContent value="uptime">
          <UptimeMonitoring />
        </TabsContent>
      </Tabs>
    </div>
  );
}