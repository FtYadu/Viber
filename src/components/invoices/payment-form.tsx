'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { InvoiceWithClient } from '@/lib/services/invoice-service';
import { formatCurrency } from '@/lib/utils/invoice-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

// Import Stripe.js
declare global {
  interface Window {
    Stripe?: any;
  }
}

interface PaymentFormProps {
  invoice: InvoiceWithClient;
  stripePublishableKey: string;
}

function PaymentFormContent({ invoice, stripePublishableKey }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'succeeded' | 'failed' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get('client_secret');
  
  useEffect(() => {
    // Initialize Stripe
    if (!window.Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => {
        initializeStripe();
      };
      document.body.appendChild(script);
    } else {
      initializeStripe();
    }
  }, []);
  
  const initializeStripe = async () => {
    if (!clientSecret) {
      setErrorMessage('Missing payment information. Please try again.');
      setIsLoading(false);
      return;
    }
    
    try {
      const stripe = window.Stripe(stripePublishableKey);
      
      // Create payment element
      const elements = stripe.elements({
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0f172a',
          },
        },
      });
      
      // Create and mount the Payment Element
      const paymentElement = elements.create('payment');
      paymentElement.mount('#payment-element');
      
      // Handle form submission
      const form = document.getElementById('payment-form') as HTMLFormElement;
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        setPaymentStatus('processing');
        
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/invoices/${invoice.id}/confirmation`,
          },
          redirect: 'if_required',
        });
        
        if (error) {
          setPaymentStatus('failed');
          setErrorMessage(error.message || 'Payment failed. Please try again.');
        } else {
          setPaymentStatus('succeeded');
          
          // Refresh the page after a short delay
          setTimeout(() => {
            router.push(`/invoices/${invoice.id}/confirmation`);
          }, 2000);
        }
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      setErrorMessage('Failed to initialize payment form. Please try again.');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.push('/invoices')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Invoices
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Pay Invoice #{invoice.invoiceNumber}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Invoice Summary */}
          <div className="border rounded-md p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bill To:</p>
                <p className="font-medium">{invoice.client.name}</p>
                <p>{invoice.client.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Invoice Date:</p>
                <p>{format(new Date(invoice.createdAt), 'MMMM dd, yyyy')}</p>
                <p className="text-sm font-medium text-muted-foreground mt-2">Due Date:</p>
                <p>{format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between">
                <p className="font-medium">Total Amount:</p>
                <p className="font-bold">{formatCurrency(invoice.amount, invoice.currency)}</p>
              </div>
            </div>
          </div>
          
          {/* Payment Form */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : errorMessage ? (
            <div className="bg-red-50 p-4 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{errorMessage}</p>
              </div>
            </div>
          ) : (
            <form id="payment-form">
              <div id="payment-element" className="mb-6"></div>
              
              {paymentStatus === 'processing' && (
                <div className="flex items-center justify-center mb-4">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <p>Processing payment...</p>
                </div>
              )}
              
              {paymentStatus === 'succeeded' && (
                <div className="bg-green-50 p-4 rounded-md mb-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-700">Payment successful! Redirecting...</p>
                  </div>
                </div>
              )}
              
              {paymentStatus === 'failed' && (
                <div className="bg-red-50 p-4 rounded-md mb-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-red-700">{errorMessage}</p>
                  </div>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                disabled={paymentStatus === 'processing' || paymentStatus === 'succeeded'}
              >
                {paymentStatus === 'processing' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${formatCurrency(invoice.amount, invoice.currency)}`
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function PaymentForm({ invoice, stripePublishableKey }: PaymentFormProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading payment form...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentFormContent invoice={invoice} stripePublishableKey={stripePublishableKey} />
    </Suspense>
  );
}