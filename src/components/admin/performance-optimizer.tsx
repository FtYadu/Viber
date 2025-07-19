"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Loader2, 
  RefreshCw, 
  Zap, 
  Image as ImageIcon, 
  Code, 
  Globe,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from "lucide-react";

interface PerformanceMetrics {
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
  };
  bundleSize: {
    total: number;
    javascript: number;
    css: number;
    images: number;
  };
  webVitals: {
    lcp: { value: number; rating: string };
    fid: { value: number; rating: string };
    cls: { value: number; rating: string };
    fcp: { value: number; rating: string };
    ttfb: { value: number; rating: string };
  };
  recommendations: Array<{
    category: string;
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    implemented: boolean;
  }>;
}

const mockMetrics: PerformanceMetrics = {
  lighthouse: {
    performance: 94,
    accessibility: 98,
    bestPractices: 96,
    seo: 100,
    pwa: 85,
  },
  bundleSize: {
    total: 245.6, // KB
    javascript: 189.2,
    css: 34.8,
    images: 21.6,
  },
  webVitals: {
    lcp: { value: 1.8, rating: "good" },
    fid: { value: 12, rating: "good" },
    cls: { value: 0.08, rating: "good" },
    fcp: { value: 1.2, rating: "good" },
    ttfb: { value: 180, rating: "good" },
  },
  recommendations: [
    {
      category: "Images",
      title: "Optimize image formats",
      description: "Convert images to WebP format for better compression",
      impact: "high",
      implemented: true,
    },
    {
      category: "JavaScript",
      title: "Code splitting",
      description: "Split JavaScript bundles for better loading performance",
      impact: "high",
      implemented: true,
    },
    {
      category: "CSS",
      title: "Critical CSS inlining",
      description: "Inline critical CSS to reduce render-blocking resources",
      impact: "medium",
      implemented: false,
    },
    {
      category: "Caching",
      title: "Service Worker implementation",
      description: "Implement service worker for better caching strategies",
      impact: "medium",
      implemented: false,
    },
    {
      category: "Fonts",
      title: "Font optimization",
      description: "Optimize web font loading with font-display: swap",
      impact: "low",
      implemented: true,
    },
  ],
};

export function PerformanceOptimizer() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(mockMetrics);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const runLighthouseAudit = async () => {
    setAnalyzing(true);
    
    // Simulate Lighthouse audit
    setTimeout(() => {
      setMetrics(mockMetrics);
      setAnalyzing(false);
    }, 3000);
  };

  const refreshMetrics = async () => {
    setLoading(true);
    
    // Simulate fetching metrics
    setTimeout(() => {
      setMetrics(mockMetrics);
      setLoading(false);
    }, 1000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "success";
    if (score >= 70) return "warning";
    return "destructive";
  };

  const getWebVitalColor = (rating: string) => {
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

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Performance Optimizer</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshMetrics}
            disabled={loading || analyzing}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button
            onClick={runLighthouseAudit}
            disabled={loading || analyzing}
          >
            {analyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Run Audit
          </Button>
        </div>
      </div>

      <Tabs defaultValue="scores" className="space-y-6">
        <TabsList>
          <TabsTrigger value="scores">Lighthouse Scores</TabsTrigger>
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="bundle">Bundle Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="scores">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lighthouse Scores</CardTitle>
                <CardDescription>
                  Performance metrics from Google Lighthouse audit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {Object.entries(metrics.lighthouse).map(([key, score]) => (
                    <div key={key} className="text-center">
                      <div className={`text-3xl font-bold mb-2 ${getScoreColor(score)}`}>
                        {score}
                      </div>
                      <Progress value={score} className="mb-2" />
                      <Badge variant={getScoreBadge(score)}>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {analyzing && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>Running Lighthouse Audit</AlertTitle>
                <AlertDescription>
                  This may take a few minutes to complete...
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        <TabsContent value="vitals">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals</CardTitle>
              <CardDescription>
                Key metrics that measure real user experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${getWebVitalColor(metrics.webVitals.lcp.rating)}`}>
                    {metrics.webVitals.lcp.value}s
                  </div>
                  <div className="text-sm font-medium">LCP</div>
                  <div className="text-xs text-muted-foreground">Largest Contentful Paint</div>
                  <Badge variant={metrics.webVitals.lcp.rating === "good" ? "success" : "warning"} className="mt-1">
                    {metrics.webVitals.lcp.rating}
                  </Badge>
                </div>

                <div className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${getWebVitalColor(metrics.webVitals.fid.rating)}`}>
                    {metrics.webVitals.fid.value}ms
                  </div>
                  <div className="text-sm font-medium">FID</div>
                  <div className="text-xs text-muted-foreground">First Input Delay</div>
                  <Badge variant={metrics.webVitals.fid.rating === "good" ? "success" : "warning"} className="mt-1">
                    {metrics.webVitals.fid.rating}
                  </Badge>
                </div>

                <div className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${getWebVitalColor(metrics.webVitals.cls.rating)}`}>
                    {metrics.webVitals.cls.value}
                  </div>
                  <div className="text-sm font-medium">CLS</div>
                  <div className="text-xs text-muted-foreground">Cumulative Layout Shift</div>
                  <Badge variant={metrics.webVitals.cls.rating === "good" ? "success" : "warning"} className="mt-1">
                    {metrics.webVitals.cls.rating}
                  </Badge>
                </div>

                <div className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${getWebVitalColor(metrics.webVitals.fcp.rating)}`}>
                    {metrics.webVitals.fcp.value}s
                  </div>
                  <div className="text-sm font-medium">FCP</div>
                  <div className="text-xs text-muted-foreground">First Contentful Paint</div>
                  <Badge variant={metrics.webVitals.fcp.rating === "good" ? "success" : "warning"} className="mt-1">
                    {metrics.webVitals.fcp.rating}
                  </Badge>
                </div>

                <div className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${getWebVitalColor(metrics.webVitals.ttfb.rating)}`}>
                    {metrics.webVitals.ttfb.value}ms
                  </div>
                  <div className="text-sm font-medium">TTFB</div>
                  <div className="text-xs text-muted-foreground">Time to First Byte</div>
                  <Badge variant={metrics.webVitals.ttfb.rating === "good" ? "success" : "warning"} className="mt-1">
                    {metrics.webVitals.ttfb.rating}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bundle">
          <Card>
            <CardHeader>
              <CardTitle>Bundle Size Analysis</CardTitle>
              <CardDescription>
                Breakdown of your application bundle size
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Bundle Size</span>
                  <span className="text-2xl font-bold">{metrics.bundleSize.total} KB</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Code className="h-4 w-4 mr-2 text-yellow-600" />
                      <span>JavaScript</span>
                    </div>
                    <span>{metrics.bundleSize.javascript} KB</span>
                  </div>
                  <Progress 
                    value={(metrics.bundleSize.javascript / metrics.bundleSize.total) * 100} 
                    className="h-2"
                  />

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-blue-600" />
                      <span>CSS</span>
                    </div>
                    <span>{metrics.bundleSize.css} KB</span>
                  </div>
                  <Progress 
                    value={(metrics.bundleSize.css / metrics.bundleSize.total) * 100} 
                    className="h-2"
                  />

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <ImageIcon className="h-4 w-4 mr-2 text-green-600" />
                      <span>Images</span>
                    </div>
                    <span>{metrics.bundleSize.images} KB</span>
                  </div>
                  <Progress 
                    value={(metrics.bundleSize.images / metrics.bundleSize.total) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-4">
            {metrics.recommendations.map((rec, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {rec.implemented ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                        )}
                        <h4 className="font-medium">{rec.title}</h4>
                        <Badge variant="outline" className="ml-2">
                          {rec.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {rec.description}
                      </p>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground mr-2">Impact:</span>
                        <Badge 
                          variant={rec.impact === "high" ? "destructive" : rec.impact === "medium" ? "warning" : "secondary"}
                        >
                          {rec.impact}
                        </Badge>
                      </div>
                    </div>
                    <div className="ml-4">
                      {rec.implemented ? (
                        <Badge variant="success">Implemented</Badge>
                      ) : (
                        <Button size="sm" variant="outline">
                          Implement
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}