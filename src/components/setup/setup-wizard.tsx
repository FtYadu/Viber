'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Settings, CreditCard, Mail, Cloud, Cpu, Globe, Shield, Loader2 } from 'lucide-react';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  category: 'core' | 'business' | 'advanced';
  fields: SetupField[];
}

interface SetupField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'url';
  placeholder: string;
  description?: string;
  required: boolean;
}

const setupSteps: SetupStep[] = [
  {
    id: 'payment',
    title: 'Payment Processing',
    description: 'Enable invoice payments and subscriptions',
    icon: <CreditCard className="h-5 w-5" />,
    required: false,
    category: 'business',
    fields: [
      {
        key: 'STRIPE_SECRET_KEY',
        label: 'Stripe Secret Key',
        type: 'password',
        placeholder: 'sk_live_... or sk_test_...',
        description: 'Your Stripe secret key for processing payments',
        required: true
      },
      {
        key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        label: 'Stripe Publishable Key',
        type: 'text',
        placeholder: 'pk_live_... or pk_test_...',
        description: 'Your Stripe publishable key for client-side integration',
        required: true
      },
      {
        key: 'STRIPE_WEBHOOK_SECRET',
        label: 'Stripe Webhook Secret',
        type: 'password',
        placeholder: 'whsec_...',
        description: 'Webhook secret for Stripe event verification',
        required: true
      }
    ]
  },
  {
    id: 'email',
    title: 'Email Services',
    description: 'Send automated emails and notifications',
    icon: <Mail className="h-5 w-5" />,
    required: false,
    category: 'business',
    fields: [
      {
        key: 'RESEND_API_KEY',
        label: 'Resend API Key',
        type: 'password',
        placeholder: 're_...',
        description: 'API key for Resend email service',
        required: true
      },
      {
        key: 'FROM_EMAIL',
        label: 'From Email Address',
        type: 'email',
        placeholder: 'noreply@yourdomain.com',
        description: 'Email address to send emails from',
        required: true
      },
      {
        key: 'ADMIN_EMAIL',
        label: 'Admin Email',
        type: 'email',
        placeholder: 'admin@yourdomain.com',
        description: 'Admin email for notifications',
        required: false
      }
    ]
  },
  {
    id: 'storage',
    title: 'File Storage',
    description: 'Upload and manage files and images',
    icon: <Cloud className="h-5 w-5" />,
    required: false,
    category: 'business',
    fields: [
      {
        key: 'CLOUDINARY_CLOUD_NAME',
        label: 'Cloudinary Cloud Name',
        type: 'text',
        placeholder: 'your-cloud-name',
        description: 'Your Cloudinary cloud name',
        required: true
      },
      {
        key: 'CLOUDINARY_API_KEY',
        label: 'Cloudinary API Key',
        type: 'text',
        placeholder: '123456789012345',
        description: 'Your Cloudinary API key',
        required: true
      },
      {
        key: 'CLOUDINARY_API_SECRET',
        label: 'Cloudinary API Secret',
        type: 'password',
        placeholder: 'your-api-secret',
        description: 'Your Cloudinary API secret',
        required: true
      }
    ]
  },
  {
    id: 'ai',
    title: 'AI Services',
    description: 'Enable AI-powered content generation',
    icon: <Cpu className="h-5 w-5" />,
    required: false,
    category: 'advanced',
    fields: [
      {
        key: 'OPENAI_API_KEY',
        label: 'OpenAI API Key',
        type: 'password',
        placeholder: 'sk-...',
        description: 'Your OpenAI API key for AI-powered features',
        required: true
      },
      {
        key: 'LANGFLOW_API_URL',
        label: 'Langflow API URL',
        type: 'url',
        placeholder: 'https://your-langflow-instance.com',
        description: 'URL to your Langflow instance for AI workflows',
        required: false
      },
      {
        key: 'LANGFLOW_API_KEY',
        label: 'Langflow API Key',
        type: 'password',
        placeholder: 'your-langflow-api-key',
        description: 'API key for Langflow authentication',
        required: false
      }
    ]
  },
  {
    id: 'dns',
    title: 'DNS Management',
    description: 'Manage DNS records via Cloudflare',
    icon: <Globe className="h-5 w-5" />,
    required: false,
    category: 'advanced',
    fields: [
      {
        key: 'CLOUDFLARE_API_TOKEN',
        label: 'Cloudflare API Token',
        type: 'password',
        placeholder: 'your-cloudflare-api-token',
        description: 'API token for Cloudflare DNS management',
        required: true
      },
      {
        key: 'CLOUDFLARE_ZONE_ID',
        label: 'Cloudflare Zone ID',
        type: 'text',
        placeholder: 'your-zone-id',
        description: 'Zone ID for your domain in Cloudflare',
        required: true
      }
    ]
  },
  {
    id: 'monitoring',
    title: 'Monitoring & Analytics',
    description: 'Error tracking and performance monitoring',
    icon: <Shield className="h-5 w-5" />,
    required: false,
    category: 'advanced',
    fields: [
      {
        key: 'NEXT_PUBLIC_SENTRY_DSN',
        label: 'Sentry DSN',
        type: 'text',
        placeholder: 'https://your-sentry-dsn@sentry.io/project-id',
        description: 'Sentry DSN for error tracking',
        required: false
      },
      {
        key: 'UPSTASH_REDIS_REST_URL',
        label: 'Upstash Redis URL',
        type: 'url',
        placeholder: 'https://your-redis-url.upstash.io',
        description: 'Redis URL for rate limiting and caching',
        required: false
      },
      {
        key: 'UPSTASH_REDIS_REST_TOKEN',
        label: 'Upstash Redis Token',
        type: 'password',
        placeholder: 'your-redis-token',
        description: 'Redis token for authentication',
        required: false
      }
    ]
  }
];

interface SetupWizardProps {
  focusStep?: string | null;
}

export default function SetupWizard({ focusStep }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [configurations, setConfigurations] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadExistingSettings();
  }, []);

  useEffect(() => {
    if (focusStep) {
      const stepIndex = setupSteps.findIndex(step => step.id === focusStep);
      if (stepIndex !== -1) {
        setCurrentStep(stepIndex);
      }
    }
  }, [focusStep]);

  const loadExistingSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const { settings } = await response.json();
        
        // Load existing configurations
        const existingConfigs: Record<string, string> = {};
        const completed = new Set<string>();
        
        Object.entries(settings).forEach(([key, setting]: [string, any]) => {
          if (setting.value && setting.value !== '****') {
            existingConfigs[key] = setting.value;
          }
        });
        
        // Check which steps are completed
        setupSteps.forEach(step => {
          const hasAllRequired = step.fields
            .filter(field => field.required)
            .every(field => existingConfigs[field.key]);
          
          if (hasAllRequired) {
            completed.add(step.id);
          }
        });
        
        setConfigurations(existingConfigs);
        setCompletedSteps(completed);
      }
    } catch (error) {
      console.error('Failed to load existing settings:', error);
      toast({
        title: "Error",
        description: "Failed to load existing settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setConfigurations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStepComplete = async (stepId: string) => {
    const step = setupSteps.find(s => s.id === stepId);
    if (!step) return;

    // Validate required fields
    const missingFields = step.fields
      .filter(field => field.required && !configurations[field.key])
      .map(field => field.label);

    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      // Save configuration to database
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId,
          settings: step.fields.reduce((acc, field) => {
            if (configurations[field.key]) {
              acc[field.key] = configurations[field.key];
            }
            return acc;
          }, {} as Record<string, string>)
        })
      });

      if (response.ok) {
        setCompletedSteps(prev => new Set(prev).add(stepId));
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  };

  const skipStep = (stepId: string) => {
    setCompletedSteps(prev => new Set(prev).add(stepId));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Setup Your Application</h1>
        <p className="text-muted-foreground">
          Configure integrations to unlock powerful features. You can always set these up later.
        </p>
      </div>

      <div className="grid gap-6">
        {setupSteps.map((step, index) => (
          <Card key={step.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {step.icon}
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {step.title}
                      {step.required && <Badge variant="destructive">Required</Badge>}
                      {completedSteps.has(step.id) && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!completedSteps.has(step.id) && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => skipStep(step.id)}
                      >
                        Skip for Now
                      </Button>
                      <Button
                        onClick={() => handleStepComplete(step.id)}
                      >
                        Save Configuration
                      </Button>
                    </>
                  )}
                  {completedSteps.has(step.id) && (
                    <Button
                      variant="outline"
                      onClick={() => setCompletedSteps(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(step.id);
                        return newSet;
                      })}
                    >
                      Reconfigure
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {step.fields.map((field) => (
                  <div key={field.key} className="grid gap-2">
                    <Label htmlFor={field.key}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      id={field.key}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={configurations[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      disabled={completedSteps.has(step.id)}
                    />
                    {field.description && (
                      <p className="text-sm text-muted-foreground">
                        {field.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Configuration Status</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Completed: {completedSteps.size} of {setupSteps.length} integrations
        </p>
      </div>
    </div>
  );
}
