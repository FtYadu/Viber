import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { InvoiceService } from '@/lib/services/invoice-service';
import { auth } from '@/lib/auth';

// Schema for creating an invoice
const createInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().optional(),
  dueDate: z.string().transform(str => new Date(str)),
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number().positive(),
      unitPrice: z.number().positive()
    })
  ).optional(),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get client ID from query params if provided
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    
    let invoices;
    if (clientId) {
      invoices = await InvoiceService.getClientInvoices(clientId);
    } else {
      invoices = await InvoiceService.getAllInvoices();
    }
    
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = createInvoiceSchema.parse(body);
    
    // Create the invoice
    const invoice = await InvoiceService.createInvoice(validatedData);
    
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}