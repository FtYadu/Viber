'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InvoiceWithClient } from '@/lib/services/invoice-service';
import { formatCurrency, getStatusColor, isInvoiceOverdue } from '@/lib/utils/invoice-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  FileText, 
  Download, 
  CreditCard, 
  Search, 
  Plus, 
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

interface InvoiceListProps {
  invoices: InvoiceWithClient[];
}

export function InvoiceList({ invoices: initialInvoices }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<InvoiceWithClient[]>(initialInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  
  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle invoice deletion
  const handleDeleteInvoice = async (id: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }
      
      // Remove the deleted invoice from the state
      setInvoices(invoices.filter(invoice => invoice.id !== id));
      toast({
        title: 'Success',
        description: 'Invoice deleted successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete invoice',
        variant: 'destructive',
      });
    }
  };
  
  // Handle invoice status update
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update invoice status');
      }
      
      const updatedInvoice = await response.json();
      
      // Update the invoice in the state
      setInvoices(invoices.map(invoice => 
        invoice.id === id ? { ...invoice, status: updatedInvoice.status } : invoice
      ));
      
      toast({
        title: 'Success',
        description: 'Invoice status updated',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update invoice status',
        variant: 'destructive',
      });
    }
  };
  
  // Handle download PDF
  const handleDownloadPdf = (id: string, invoiceNumber: string) => {
    window.open(`/api/invoices/${id}/pdf`, '_blank');
  };
  
  // Handle create payment link
  const handleCreatePaymentLink = async (id: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}/payment`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment link');
      }
      
      const data = await response.json();
      
      // Update the invoice status to SENT
      setInvoices(invoices.map(invoice => 
        invoice.id === id ? { ...invoice, status: 'SENT' } : invoice
      ));
      
      // Redirect to the payment page
      router.push(`/invoices/${id}/payment?client_secret=${data.clientSecret}`);
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast({
        title: 'Error',
        description: 'Failed to create payment link',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Invoices</CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => router.push('/invoices/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.client.name}</div>
                        <div className="text-sm text-muted-foreground">{invoice.client.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                    <TableCell>{format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDownloadPdf(invoice.id, invoice.invoiceNumber)}
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        {invoice.status !== 'PAID' && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCreatePaymentLink(invoice.id)}
                            title="Create Payment Link"
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}`)}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {invoice.status !== 'PAID' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(invoice.id, 'PAID')}>
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
                            {invoice.status === 'DRAFT' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(invoice.id, 'SENT')}>
                                Mark as Sent
                              </DropdownMenuItem>
                            )}
                            {invoice.status !== 'CANCELLED' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(invoice.id, 'CANCELLED')}>
                                Cancel Invoice
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}