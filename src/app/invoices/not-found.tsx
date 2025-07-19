import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileX } from 'lucide-react';

export default function InvoiceNotFound() {
  return (
    <div className="container mx-auto py-20 flex flex-col items-center justify-center">
      <FileX className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-3xl font-bold mb-2">Invoice Not Found</h1>
      <p className="text-muted-foreground mb-6">
        The invoice you're looking for doesn't exist or you don't have permission to view it.
      </p>
      <Button asChild>
        <Link href="/invoices">Back to Invoices</Link>
      </Button>
    </div>
  );
}