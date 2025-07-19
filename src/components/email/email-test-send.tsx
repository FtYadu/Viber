'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2, Send, X } from 'lucide-react';

// Define test email schema
const testEmailSchema = z.object({
  to: z.string().email('Valid email is required'),
});

type TestEmailFormValues = z.infer<typeof testEmailSchema>;

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  html?: string;
  text?: string;
  lastModified: Date;
}

interface EmailTestSendProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate;
}

export function EmailTestSend({
  isOpen,
  onClose,
  template,
}: EmailTestSendProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set up form with default values
  const form = useForm<TestEmailFormValues>({
    resolver: zodResolver(testEmailSchema),
    defaultValues: {
      to: '',
    },
  });
  
  const handleSubmit = async (values: TestEmailFormValues) => {
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call an API to send the test email
      // For now, we'll just simulate a successful send
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Success',
        description: `Test email sent to ${values.to}`,
        variant: 'default',
      });
      
      onClose();
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test email',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Send Test Email: {template.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="to">Recipient Email</Label>
            <Input
              id="to"
              type="email"
              placeholder="test@example.com"
              {...form.register('to')}
            />
            {form.formState.errors.to && (
              <p className="text-sm text-red-500">{form.formState.errors.to.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Template Information</Label>
            <div className="border rounded-md p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Name:</span>
                <span>{template.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Subject:</span>
                <span>{template.subject}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}