'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Settings, ExternalLink } from 'lucide-react';

interface FeatureStatus {
  id: string;
  name: string;
  description: string;
  isConfigured: boolean;
  requiredSettings: string[];
  setupUrl?: string;
}

const FEATURES: FeatureStatus[] = [
  {
    id: 'payments',
    name: 'Payment Processing',
    description: 'Accept payments and send invoices',
    isConfigured: false,
    requiredSettings: ['STRIPE_SECRET_KEY', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'],
    setupUrl: '/admin/setup?step=payment'
  },
  {
    id: 'email',
    name: 'Email Notifications',
    description: 'Send automated emails and notifications',
    isConfigured: false,
    requiredSettings: ['RESEND_API_KEY', 'FROM_EMAIL'],
    setupUrl: '/admin/setup?step=email'
  },
  {
    id: 'storage',
    name: 'File Storage',
    description: 'Upload and manage files',
    isConfigured: false,
    requiredSettings: ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY'],
    setupUrl: '/admin/setup?step=storage'
  },
  {
    id: 'ai',
    name: 'AI Features',
    description: 'AI-powered content generation',
    isConfigured: false,
    requiredSettings: ['OPENAI_API_KEY'],
    setupUrl: '/admin/setup?step=ai'
  },
  {
    id: 'dns',
    name: 'DNS Management',
    description: 'Manage DNS records via Cloudflare',
    isConfigured: false,
    requiredSettings: ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ZONE_ID'],
    setupUrl: '/admin/setup?step=dns'
  }
];

export default function FeatureStatus() {
  const [features, setFeatures] = useState<FeatureStatus[]>(FEATURES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkFeatureStatus();
  }, []);

  const checkFeatureStatus = async () => {
    try {
      const response = await fetch('/api/admin/feature-status');
      const { configuredSettings } = await response.json();

      setFeatures(prev => prev.map(feature => ({
        ...feature,
        isConfigured: feature.requiredSettings.every(setting => 
          configuredSettings.includes(setting)
        )
      })));
    } catch (error) {
      console.error('Failed to check feature status:', error);
    } finally {
      setLoading(false);
    }
  };

  const configuredCount = features.filter(f => f.isConfigured).length;

  if (loading) {
    return <div>Loading feature status...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Feature Configuration</h2>
          <p className="text-muted-foreground">
            {configuredCount} of {features.length} features configured
          </p>
        </div>
        <Button onClick={checkFeatureStatus} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{feature.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {feature.isConfigured ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <Badge variant={feature.isConfigured ? "default" : "destructive"}>
                    {feature.isConfigured ? "Configured" : "Not Configured"}
                  </Badge>
                </div>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Required Settings:</p>
                  <div className="flex flex-wrap gap-1">
                    {feature.requiredSettings.map((setting) => (
                      <Badge key={setting} variant="outline" className="text-xs">
                        {setting}
                      </Badge>
                    ))}
                  </div>
                </div>
                {!feature.isConfigured && feature.setupUrl && (
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.location.href = feature.setupUrl!}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {configuredCount < features.length && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">Setup Incomplete</CardTitle>
            <CardDescription className="text-amber-700">
              Some features require additional configuration to work properly.
              Complete the setup to unlock all functionality.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              Complete Setup
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
