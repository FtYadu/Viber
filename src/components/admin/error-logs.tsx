"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Search, ExternalLink } from "lucide-react";
import { format } from "date-fns";

// Mock error log data (in a real app, this would come from Sentry API)
const mockErrorLogs = [
  {
    id: "error-1",
    message: "TypeError: Cannot read property 'id' of undefined",
    level: "error",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    url: "/admin/clients",
    user: "admin@example.com",
    browser: "Chrome 98.0.4758.102",
    os: "Windows 10",
  },
  {
    id: "error-2",
    message: "Failed to fetch data from API: Network Error",
    level: "error",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    url: "/admin/projects",
    user: "admin@example.com",
    browser: "Chrome 98.0.4758.102",
    os: "Windows 10",
  },
  {
    id: "error-3",
    message: "Warning: Each child in a list should have a unique 'key' prop",
    level: "warning",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    url: "/portfolio",
    user: "anonymous",
    browser: "Firefox 97.0",
    os: "macOS 12.2.1",
  },
  {
    id: "error-4",
    message: "Uncaught (in promise) Error: Request failed with status code 404",
    level: "error",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    url: "/api/clients/invalid-id",
    user: "admin@example.com",
    browser: "Safari 15.3",
    os: "iOS 15.3.1",
  },
  {
    id: "error-5",
    message: "Database connection error: Connection refused",
    level: "fatal",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    url: "/api/projects",
    user: "system",
    browser: "Node.js",
    os: "Ubuntu 20.04",
  },
];

export function ErrorLogs() {
  const [logs, setLogs] = useState(mockErrorLogs);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("24h");

  // Filter logs based on search query and level filter
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = searchQuery
      ? log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesLevel = levelFilter === "all" ? true : log.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  // Simulate fetching logs
  const fetchLogs = async () => {
    setLoading(true);
    
    // In a real app, this would be an API call to Sentry
    setTimeout(() => {
      setLogs(mockErrorLogs);
      setLoading(false);
    }, 1000);
  };

  // Get badge variant based on error level
  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "fatal":
        return "destructive";
      case "error":
        return "destructive";
      case "warning":
        return "warning";
      case "info":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Error Logs</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
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
          <CardDescription>
            View and filter application errors from Sentry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search errors..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="fatal">Fatal</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No error logs found matching your filters
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <Card key={log.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Badge variant={getLevelBadgeVariant(log.level)}>
                            {log.level}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="font-mono text-sm">{log.message}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">URL:</span> {log.url}
                        </div>
                        <div>
                          <span className="font-medium">User:</span> {log.user}
                        </div>
                        <div>
                          <span className="font-medium">Browser:</span> {log.browser}
                        </div>
                        <div>
                          <span className="font-medium">OS:</span> {log.os}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <a
            href="https://sentry.io/organizations/your-org/issues/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View All Errors in Sentry
          </a>
        </Button>
      </div>
    </div>
  );
}