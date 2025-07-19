'use client';

import { useRouter } from 'next/navigation';
import { InvoiceWithClient } from '@/lib/services/invoice-service';
import { formatCurrency } from '@/lib/utils/invoice-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Download, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentConfirmationProps {
  invoice: InvoiceWithClient;
}

export function PaymentConfirmation({ invoice }: PaymentConfirmationProps) {
  const router = useRouter();
  
  // Handle download PDF
  const handleDownloadPdf = () => {
    window.open(`/api/invoices/${invoice.id}/pdf`, '_blank');
  };
  
  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.push('/invoices')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Invoices
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Confirmation</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-green-50 p-6 rounded-md flex flex-col items-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h2>
            <p className="text-green-600">
              Thank you for your payment of {formatCurrency(invoice.amount, invoice.currency)}
            </p>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-4">Payment Details</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Number:</span>
                <span className="font-medium">{invoice.invoiceNumber}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Date:</span>
                <span className="font-medium">
                  {invoice.paidDate 
                    ? format(new Date(invoice.paidDate), 'MMMM dd, yyyy')
                    : format(new Date(), 'MMMM dd, yyyy')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-medium">{formatCurrency(invoice.amount, invoice.currency)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status:</span>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                  PAID
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-center text-muted-foreground">
            <p>A receipt has been sent to your email address.</p>
            <p>You can also download a copy of your invoice below.</p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}