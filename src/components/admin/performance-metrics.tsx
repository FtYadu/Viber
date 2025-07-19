"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format } from "date-fns";

// Mock performance data (in a real app, this would come from Vercel Analytics API)
const mockPerformanceData = {
  lighthouse: {
    performance: 92,
    accessibility: 98,
    bestPractices: 95,
    seo: 100,
    lastUpdated: new Date().toISOString(),
  },
  webVitals: {
    lcp: { value: 1.2, rating: "good", trend: "up" }, // Largest Contentful Paint
    fid: { value: 8, rating: "good", trend: "stable" }, // First Input Delay
    cls: { value: 0.05, rating: "good", trend: "down" }, // Cumulative Layout Shift
    fcp: { value: 0.9, rating: "good", trend: "up" }, // First Contentful Paint
    ttfb: { value: 180, rating: "good", trend: "stable" }, // Time to First Byte
  },
  pageViews: {
    total: 15420,
    unique: 8930,
    bounceRate: 32.5,
    avgSessionDuration: 245, // seconds
    topPages: [
      { path: "/", views: 5420, uniqueViews: 3210 },
      { path: "/portfolio", views: 3890, uniqueViews: 2340 },
      { path: "/admin", views: 2110, uniqueViews: 890 },
      { path: "/client", views: 1890, uniqueViews: 1120 },
      { path: "/contact", views: 2110, uniqueViews: 1370 },
    ],
  },
  errors: {
    total: 23,
    rate: 0.15, // percentage
    trend: "down",
  },
};

export function PerformanceMetrics() {
  const [data, setData] = useState(mockPerformanceData);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");

  // Simulate fetching performance data
  const fetchPerformanceData = async () => {
    setLoading(true);
    
    // In a real app, this would be API calls to Vercel Analytics, Lighthouse CI, etc.
    setTimeout(() => {
      setData(mockPerformanceData);
      setLoading(false);
    }, 1000);
  };

  // Get badge variant based on Lighthouse score
  const getLighthouseScoreVariant = (score: number) => {
    if (score >= 90) return "success";
    if (score >= 70) return "warning";
    return "destructive";
  };

  // Get Web Vitals rating color
  const getWebVitalsColor = (rating: string) => {
    switch (rating) {
      case "good":
        return "text-green-600";
      case "needs-improvement":
        return "text-yellow-600";
      case "poor":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Performance Metrics</h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPerformanceData}
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
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Lighthouse Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Lighthouse Scores</CardTitle>
              <CardDescription>
                Last updated: {format(new Date(data.lighthouse.lastUpdated), "PPpp")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{data.lighthouse.performance}</div>
                  <Badge variant={getLighthouseScoreVariant(data.lighthouse.performance)}>
                    Performance
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{data.lighthouse.accessibility}</div>
                  <Badge variant={getLighthouseScoreVariant(data.lighthouse.accessibility)}>
                    Accessibility
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{data.lighthouse.bestPractices}</div>
                  <Badge variant={getLighthouseScoreVariant(data.lighthouse.bestPractices)}>
                    Best Practices
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{data.lighthouse.seo}</div>
                  <Badge variant={getLighthouseScoreVariant(data.lighthouse.seo)}>
                    SEO
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Core Web Vitals */}
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals</CardTitle>
              <CardDescription>
                Key metrics that measure user experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <span className={`text-2xl font-bold ${getWebVitalsColor(data.webVitals.lcp.rating)}`}>
                      {data.webVitals.lcp.value}s
                    </span>
                    <div className="ml-2">
                      {getTrendIcon(data.webVitals.lcp.trend)}
                    </div>
                  </div>
                  <div className="text-sm font-medium">LCP</div>
                  <div className="text-xs text-muted-foreground">Largest Contentful Paint</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <span className={`text-2xl font-bold ${getWebVitalsColor(data.webVitals.fid.rating)}`}>
                      {data.webVitals.fid.value}ms
                    </span>
                    <div className="ml-2">
                      {getTrendIcon(data.webVitals.fid.trend)}
                    </div>
                  </div>
                  <div className="text-sm font-medium">FID</div>
                  <div className="text-xs text-muted-foreground">First Input Delay</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <span className={`text-2xl font-bold ${getWebVitalsColor(data.webVitals.cls.rating)}`}>
                      {data.webVitals.cls.value}
                    </span>
                    <div className="ml-2">
                      {getTrendIcon(data.webVitals.cls.trend)}
                    </div>
                  </div>
                  <div className="text-sm font-medium">CLS</div>
                  <div className="text-xs text-muted-foreground">Cumulative Layout Shift</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <span className={`text-2xl font-bold ${getWebVitalsColor(data.webVitals.fcp.rating)}`}>
                      {data.webVitals.fcp.value}s
                    </span>
                    <div className="ml-2">
                      {getTrendIcon(data.webVitals.fcp.trend)}
                    </div>
                  </div>
                  <div className="text-sm font-medium">FCP</div>
                  <div className="text-xs text-muted-foreground">First Contentful Paint</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <span className={`text-2xl font-bold ${getWebVitalsColor(data.webVitals.ttfb.rating)}`}>
                      {data.webVitals.ttfb.value}ms
                    </span>
                    <div className="ml-2">
                      {getTrendIcon(data.webVitals.ttfb.trend)}
                    </div>
                  </div>
                  <div className="text-sm font-medium">TTFB</div>
                  <div className="text-xs text-muted-foreground">Time to First Byte</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Overview</CardTitle>
                <CardDescription>
                  Website traffic for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{data.pageViews.total.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Page Views</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{data.pageViews.unique.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Unique Visitors</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{data.pageViews.bounceRate}%</div>
                    <div className="text-sm text-muted-foreground">Bounce Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatDuration(data.pageViews.avgSessionDuration)}</div>
                    <div className="text-sm text-muted-foreground">Avg. Session</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>
                  Most visited pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.pageViews.topPages.map((page, index) => (
                    <div key={page.path} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">#{index + 1}</span>
                        <span className="text-sm font-mono">{page.path}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{page.views.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {page.uniqueViews.toLocaleString()} unique
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Rate */}
          <Card>
            <CardHeader>
              <CardTitle>Error Rate</CardTitle>
              <CardDescription>
                Application error statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold mr-2">{data.errors.total}</span>
                    {getTrendIcon(data.errors.trend)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Errors</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{data.errors.rate}%</div>
                  <div className="text-sm text-muted-foreground">Error Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}