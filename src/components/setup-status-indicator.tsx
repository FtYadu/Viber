'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Settings } from 'lucide-react';

interface SetupStatus {
  payment: boolean;
  email: boolean;
  storage: boolean;
  ai: boolean;
  dns: boolean;
  monitoring: boolean;
}

export function SetupStatusIndicator() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/admin/feature-status');
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch setup status:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, []);

  if (loading || !status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Setup Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const features = [
    { key: 'payment', label: 'Payment Processing', configured: status.payment },
    { key: 'email', label: 'Email Service', configured: status.email },
    { key: 'storage', label: 'Cloud Storage', configured: status.storage },
    { key: 'ai', label: 'AI Integration', configured: status.ai },
    { key: 'dns', label: 'DNS Management', configured: status.dns },
    { key: 'monitoring', label: 'Monitoring', configured: status.monitoring },
  ];

  const configuredCount = features.filter(f => f.configured).length;
  const totalCount = features.length;
  const progressPercentage = Math.round((configuredCount / totalCount) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Setup Status
          <Badge variant={progressPercentage === 100 ? 'default' : 'secondary'}>
            {configuredCount}/{totalCount}
          </Badge>
        </CardTitle>
        <CardDescription>
          {progressPercentage === 100 
            ? 'All features are configured and ready to use'
            : `${configuredCount} of ${totalCount} features configured`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          {features.map((feature) => (
            <div
              key={feature.key}
              className="flex items-center justify-between p-2 rounded-lg border"
            >
              <div className="flex items-center gap-2">
                {feature.configured ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                )}
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
              {!feature.configured && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/setup?step=${feature.key}`}>
                    Setup
                  </Link>
                </Button>
              )}
            </div>
          ))}
        </div>

        {progressPercentage < 100 && (
          <Button asChild className="w-full">
            <Link href="/admin/setup">
              <Settings className="mr-2 h-4 w-4" />
              Continue Setup
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
