'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Settings } from 'lucide-react';
import { FeatureConfig } from '@/lib/feature-gates';

interface FeatureGateProps {
  feature: keyof FeatureConfig;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showSetupPrompt?: boolean;
}

interface FeatureStatusResponse {
  payment: boolean;
  email: boolean;
  storage: boolean;
  ai: boolean;
  dns: boolean;
  monitoring: boolean;
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  showSetupPrompt = true 
}: FeatureGateProps) {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkFeatureStatus() {
      try {
        const response = await fetch('/api/admin/feature-status');
        if (response.ok) {
          const status: FeatureStatusResponse = await response.json();
          setIsConfigured(status[feature]);
        } else {
          setIsConfigured(false);
        }
      } catch (error) {
        console.error('Failed to check feature status:', error);
        setIsConfigured(false);
      } finally {
        setLoading(false);
      }
    }

    checkFeatureStatus();
  }, [feature]);

  if (loading) {
    return <div className="animate-pulse h-4 bg-muted rounded" />;
  }

  if (isConfigured) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showSetupPrompt) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Feature Not Configured
        </CardTitle>
        <CardDescription className="text-orange-700">
          The {feature} feature requires additional configuration before it can be used.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" className="border-orange-300 text-orange-800 hover:bg-orange-100">
          <Link href={`/admin/setup?step=${feature}`}>
            <Settings className="mr-2 h-4 w-4" />
            Configure {feature.charAt(0).toUpperCase() + feature.slice(1)}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface RequireFeatureProps {
  feature: keyof FeatureConfig;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Higher-order component that requires a feature to be configured
 */
export function RequireFeature({ feature, children, fallback }: RequireFeatureProps) {
  return (
    <FeatureGate 
      feature={feature} 
      fallback={fallback}
      showSetupPrompt={!fallback}
    >
      {children}
    </FeatureGate>
  );
}
