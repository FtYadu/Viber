"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { format, subDays } from "date-fns";

// Mock uptime data (in a real app, this would come from UptimeRobot API)
const mockUptimeData = {
  overall: {
    uptime: 99.95,
    status: "up",
    lastIncident: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  monitors: [
    {
      id: "monitor-1",
      name: "Main Website",
      url: "https://yadukrishnan.com",
      status: "up",
      uptime: 99.98,
      responseTime: 245,
      lastCheck: new Date().toISOString(),
    },
    {
      id: "monitor-2",
      name: "Admin Panel",
      url: "https://yadukrishnan.com/admin",
      status: "up",
      uptime: 99.95,
      responseTime: 312,
      lastCheck: new Date().toISOString(),
    },
    {
      id: "monitor-3",
      name: "API Health",
      url: "https://yadukrishnan.com/api/health",
      status: "up",
      uptime: 99.92,
      responseTime: 89,
      lastCheck: new Date().toISOString(),
    },
    {
      id: "monitor-4",
      name: "Database Connection",
      url: "Internal Monitor",
      status: "up",
      uptime: 99.99,
      responseTime: 12,
      lastCheck: new Date().toISOString(),
    },
  ],
  incidents: [
    {
      id: "incident-1",
      title: "Database Connection Timeout",
      status: "resolved",
      severity: "major",
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      endTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 15).toISOString(),
      duration: 15, // minutes
      affectedServices: ["API Health", "Database Connection"],
    },
    {
      id: "incident-2",
      title: "Slow Response Times",
      status: "resolved",
      severity: "minor",
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      endTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 45).toISOString(),
      duration: 45, // minutes
      affectedServices: ["Main Website", "Admin Panel"],
    },
  ],
  // Generate mock uptime history for the last 30 days
  history: Array.from({ length: 30 }, (_, i) => ({
    date: subDays(new Date(), 29 - i).toISOString().split('T')[0],
    uptime: Math.random() > 0.05 ? 100 : Math.random() * 20 + 80, // 95% chance of 100% uptime
  })),
};

export function UptimeMonitoring() {
  const [data, setData] = useState(mockUptimeData);
  const [loading, setLoading] = useState(false);

  // Simulate fetching uptime data
  const fetchUptimeData = async () => {
    setLoading(true);
    
    // In a real app, this would be API calls to UptimeRobot
    setTimeout(() => {
      setData(mockUptimeData);
      setLoading(false);
    }, 1000);
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "up":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "down":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "up":
        return "success";
      case "down":
        return "destructive";
      case "degraded":
        return "warning";
      default:
        return "secondary";
    }
  };

  // Get severity badge variant
  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "major":
        return "destructive";
      case "minor":
        return "warning";
      default:
        return "secondary";
    }
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Uptime Monitoring</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUptimeData}
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

      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getStatusIcon(data.overall.status)}
                <span className="ml-2">Overall Status</span>
              </CardTitle>
              <CardDescription>
                System-wide uptime and availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{data.overall.uptime}%</div>
                  <div className="text-sm text-muted-foreground">30-Day Uptime</div>
                </div>
                <div className="text-center">
                  <Badge variant={getStatusBadgeVariant(data.overall.status)} className="text-lg px-4 py-1">
                    {data.overall.status.toUpperCase()}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">Current Status</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">
                    {format(new Date(data.overall.lastIncident), "MMM d, yyyy")}
                  </div>
                  <div className="text-sm text-muted-foreground">Last Incident</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Monitors */}
          <Card>
            <CardHeader>
              <CardTitle>Service Monitors</CardTitle>
              <CardDescription>
                Individual service status and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.monitors.map((monitor) => (
                  <div key={monitor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(monitor.status)}
                      <div>
                        <div className="font-medium">{monitor.name}</div>
                        <div className="text-sm text-muted-foreground">{monitor.url}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{monitor.uptime}%</div>
                        <div className="text-muted-foreground">Uptime</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{monitor.responseTime}ms</div>
                        <div className="text-muted-foreground">Response</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">
                          {format(new Date(monitor.lastCheck), "HH:mm")}
                        </div>
                        <div className="text-muted-foreground">Last Check</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Uptime History */}
          <Card>
            <CardHeader>
              <CardTitle>30-Day Uptime History</CardTitle>
              <CardDescription>
                Daily uptime percentage over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end space-x-1 h-20">
                {data.history.map((day, index) => (
                  <div
                    key={day.date}
                    className="flex-1 bg-gray-200 rounded-sm relative group cursor-pointer"
                    style={{
                      height: `${Math.max(day.uptime, 10)}%`,
                      backgroundColor: day.uptime >= 99 ? '#10b981' : day.uptime >= 95 ? '#f59e0b' : '#ef4444',
                    }}
                    title={`${day.date}: ${day.uptime.toFixed(2)}% uptime`}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {format(new Date(day.date), "MMM d")}: {day.uptime.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Incidents */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>
                Recent service disruptions and their resolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.incidents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent incidents
                </div>
              ) : (
                <div className="space-y-4">
                  {data.incidents.map((incident) => (
                    <div key={incident.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{incident.title}</h4>
                          <Badge variant={getSeverityBadgeVariant(incident.severity)}>
                            {incident.severity}
                          </Badge>
                          <Badge variant="outline">
                            {incident.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDuration(incident.duration)}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {format(new Date(incident.startTime), "MMM d, yyyy HH:mm")} - {format(new Date(incident.endTime), "MMM d, yyyy HH:mm")}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Affected services:</span> {incident.affectedServices.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* External Links */}
          <div className="flex justify-center space-x-4">
            <Button variant="outline" asChild>
              <a
                href="https://uptimerobot.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View UptimeRobot Dashboard
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://status.yadukrishnan.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Public Status Page
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}