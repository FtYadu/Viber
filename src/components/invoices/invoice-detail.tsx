'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InvoiceWithClient } from '@/lib/services/invoice-service';
import { formatCurrency, getStatusColor, calculateDueDays } from '@/lib/utils/invoice-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, CreditCard, ArrowLeft, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface InvoiceDetailProps {
  invoice: InvoiceWithClient;
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  
  const dueDaysInfo = calculateDueDays(new Date(invoice.dueDate));
  
  // Handle download PDF
  const handleDownloadPdf = () => {
    window.open(`/api/invoices/${invoice.id}/pdf`, '_blank');
  };
  
  // Handle create payment link
  const handleCreatePaymentLink = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/payment`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment link');
      }
      
      const data = await response.json();
      
      // Redirect to the payment page
      router.push(`/invoices/${invoice.id}/payment?client_secret=${data.clientSecret}`);
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast({
        title: 'Error',
        description: 'Failed to create payment link',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle mark as paid
  const handleMarkAsPaid = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'PAID' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update invoice status');
      }
      
      toast({
        title: 'Success',
        description: 'Invoice marked as paid',
        variant: 'default',
      });
      
      // Refresh the page to show updated status
      router.refresh();
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update invoice status',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push('/invoices')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          
          {invoice.status !== 'PAID' && (
            <>
              <Button variant="outline" onClick={handleMarkAsPaid} disabled={isProcessing}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Paid
              </Button>
              
              <Button onClick={handleCreatePaymentLink} disabled={isProcessing}>
                <CreditCard className="mr-2 h-4 w-4" />
                Create Payment Link
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Invoice #{invoice.invoiceNumber}</CardTitle>
          <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(invoice.status)}`}>
            {invoice.status}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Bill To:</h3>
              <div>
                <p className="font-medium">{invoice.client.name}</p>
                <p>{invoice.client.email}</p>
                {invoice.client.company && <p>{invoice.client.company}</p>}
                {invoice.client.address && <p>{invoice.client.address}</p>}
              </div>
            </div>
            
            {/* Invoice Information */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Invoice Date:</span>
                <span>{format(new Date(invoice.createdAt), 'MMMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Due Date:</span>
                <span>{format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </div>
              {dueDaysInfo.overdue ? (
                <div className="flex justify-between text-red-500">
                  <span className="text-sm font-medium">Overdue:</span>
                  <span>{dueDaysInfo.days} days</span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Due in:</span>
                  <span>{dueDaysInfo.days} days</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Invoice Items */}
          <div className="border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2">Services Rendered</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(invoice.amount, invoice.currency)}</td>
                </tr>
              </tbody>
              <tfoot className="border-t">
                <tr>
                  <th className="px-4 py-2 text-left">Total</th>
                  <th className="px-4 py-2 text-right">{formatCurrency(invoice.amount, invoice.currency)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Payment Information */}
          {invoice.status === 'PAID' && invoice.paidDate && (
            <div className="bg-green-50 p-4 rounded-md">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-green-700">
                  Paid on {format(new Date(invoice.paidDate), 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}