import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { InvoiceService } from '@/lib/services/invoice-service';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

// Initialize Stripe with the API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil',
});

// The webhook secret for verifying the event
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') as string;
    
    if (!webhookSecret) {
      logger.error('Missing Stripe webhook secret');
      return NextResponse.json(
        { error: 'Webhook secret is not configured' },
        { status: 500 }
      );
    }
    
    // Verify the event came from Stripe
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logger.error(`Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.info(`Payment succeeded: ${paymentIntent.id}`);
        
        // Get the invoice ID from the metadata
        const invoiceId = paymentIntent.metadata.invoiceId;
        
        if (invoiceId) {
          // Mark the invoice as paid
          await InvoiceService.markAsPaid(invoiceId);
          logger.info(`Invoice ${invoiceId} marked as paid`);
        }
        
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.error(`Payment failed: ${paymentIntent.id}`);
        
        // You could update the invoice status or notify the admin here
        break;
      }
      
      default:
        // Unexpected event type
        logger.info(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Error processing Stripe webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}