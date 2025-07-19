'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { InvoiceWithClient } from '@/lib/services/invoice-service';
import { formatCurrency, getStatusColor, calculateDueDays } from '@/lib/utils/invoice-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Download, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ClientInvoiceDetailProps {
  invoice: InvoiceWithClient;
}

export function ClientInvoiceDetail({ invoice }: ClientInvoiceDetailProps) {
  const dueDaysInfo = calculateDueDays(new Date(invoice.dueDate));
  
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button variant="outline" asChild>
          <Link href="/client/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Link>
        </Button>
      </motion.div>
      
      {/* Invoice Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invoice #{invoice.invoiceNumber}</CardTitle>
            <Badge
              className={getStatusColor(invoice.status)}
              variant="secondary"
            >
              {invoice.status}
            </Badge>
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
                  <Badge
                    className={getStatusColor(invoice.status)}
                    variant="secondary"
                  >
                    {invoice.status}
                  </Badge>
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
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="outline" className="flex-1" asChild>
                <a
                  href={`/api/invoices/${invoice.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </a>
              </Button>
              
              {invoice.status === 'SENT' && (
                <Button className="flex-1" asChild>
                  <Link href={`/client/invoices/${invoice.id}/payment`}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Now
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}