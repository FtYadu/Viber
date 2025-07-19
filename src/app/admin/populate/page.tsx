'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PopulatePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePopulate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/populate-portfolio', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Failed to populate portfolio');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Population</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Click the button below to populate the portfolio with images from the CSV file.
            This will clear existing portfolio items and create new ones with random order.
          </p>

          <Button 
            onClick={handlePopulate} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Populating...' : 'Populate Portfolio'}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-semibold text-green-800 mb-2">Success!</h3>
              <p className="text-green-700 mb-2">{result.message}</p>
              
              {result.stats && (
                <div className="text-sm text-green-600">
                  <p>• Total items: {result.stats.totalItems}</p>
                  <p>• Categories: {result.stats.categories}</p>
                  <p>• Unique tags: {result.stats.uniqueTags}</p>
                  <p>• Featured items: {result.stats.featuredItems}</p>
                  <p>• Categories: {result.stats.categoriesList?.join(', ')}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              View Portfolio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}