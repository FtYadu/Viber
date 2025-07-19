'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SetupWizard from '@/components/setup/setup-wizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function SetupContent() {
  const searchParams = useSearchParams();
  const step = searchParams?.get('step');

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Application Setup</h1>
        <p className="text-muted-foreground">
          Configure integrations and services to unlock powerful features for your application.
        </p>
      </div>

      {step && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Setup Focus</CardTitle>
            <CardDescription className="text-blue-700">
              You're configuring the <strong>{step}</strong> integration.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <SetupWizard focusStep={step} />
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8">
        <div className="text-center">Loading setup wizard...</div>
      </div>
    }>
      <SetupContent />
    </Suspense>
  );
}
