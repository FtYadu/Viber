'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Settings } from 'lucide-react';

interface CoreConfig {
  database: boolean;
  auth: boolean;
  nextauth: boolean;
}

export function InitialSetupPrompt() {
  const [open, setOpen] = useState(false);
  const [coreConfig, setCoreConfig] = useState<CoreConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkCoreConfig() {
      try {
        // Check if core environment variables are configured
        const response = await fetch('/api/admin/core-config-status');
        if (response.ok) {
          const config: CoreConfig = await response.json();
          setCoreConfig(config);
          
          // Show prompt if any core config is missing
          const hasMissing = !config.database || !config.auth || !config.nextauth;
          setOpen(hasMissing);
        }
      } catch (error) {
        console.error('Failed to check core config:', error);
        // Assume setup is needed if we can't check
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }

    checkCoreConfig();
  }, []);

  const handleContinueSetup = () => {
    setOpen(false);
    router.push('/admin/setup?step=core');
  };

  const handleSkip = () => {
    setOpen(false);
    // Store that user has seen this prompt to avoid showing it repeatedly
    localStorage.setItem('setup-prompt-seen', 'true');
  };

  if (loading || !coreConfig) {
    return null;
  }

  const coreChecks = [
    { key: 'database', label: 'Database Connection', configured: coreConfig.database },
    { key: 'auth', label: 'Authentication Provider', configured: coreConfig.auth },
    { key: 'nextauth', label: 'NextAuth Configuration', configured: coreConfig.nextauth },
  ];

  const missingCount = coreChecks.filter(check => !check.configured).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Initial Setup Required
          </DialogTitle>
          <DialogDescription>
            Some core environment variables need to be configured before you can use all features.
          </DialogDescription>
        </DialogHeader>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-orange-800">
              Core Configuration Status
            </CardTitle>
            <CardDescription className="text-orange-700">
              {missingCount} of {coreChecks.length} core configurations need attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {coreChecks.map((check) => (
              <div
                key={check.key}
                className="flex items-center justify-between p-2 bg-white rounded border"
              >
                <div className="flex items-center gap-2">
                  {check.configured ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-sm font-medium">{check.label}</span>
                </div>
                <Badge variant={check.configured ? 'default' : 'secondary'}>
                  {check.configured ? 'Ready' : 'Needs Setup'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button onClick={handleSkip} variant="outline" className="flex-1">
            Skip for Now
          </Button>
          <Button onClick={handleContinueSetup} className="flex-1">
            <Settings className="mr-2 h-4 w-4" />
            Configure Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
