'use client';

import { useState, useEffect } from 'react';
import { DNSRecord } from '@prisma/client';
import { DNSType } from '@/types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { createDNSRecordSchema, updateDNSRecordSchema } from '@/lib/validations';

type DNSRecordFormValues = z.infer<typeof createDNSRecordSchema>;

interface DNSRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (record: DNSRecord) => void;
  record?: DNSRecord; // If provided, we're editing an existing record
}

export function DNSRecordForm({ isOpen, onClose, onSuccess, record }: DNSRecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!record;
  
  // Set up form with default values
  const form = useForm<DNSRecordFormValues>({
    resolver: zodResolver(isEditing ? updateDNSRecordSchema : createDNSRecordSchema),
    defaultValues: {
      domain: record?.domain || '',
      type: (record?.type as DNSType) || DNSType.A,
      name: record?.name || '',
      content: record?.content || '',
      ttl: record?.ttl || 3600,
      priority: record?.priority || undefined,
    },
  });
  
  // Update form values when record changes
  useEffect(() => {
    if (record) {
      form.reset({
        domain: record.domain,
        type: record.type as DNSType,
        name: record.name,
        content: record.content,
        ttl: record.ttl,
        priority: record.priority || undefined,
      });
    } else {
      form.reset({
        domain: '',
        type: DNSType.A,
        name: '',
        content: '',
        ttl: 3600,
        priority: undefined,
      });
    }
  }, [record, form]);
  
  const handleSubmit = async (values: DNSRecordFormValues) => {
    setIsSubmitting(true);
    
    try {
      const url = isEditing ? `/api/dns/${record.id}` : '/api/dns';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} DNS record`);
      }
      
      const newRecord = await response.json();
      
      toast({
        title: 'Success',
        description: `DNS record ${isEditing ? 'updated' : 'created'} successfully`,
        variant: 'default',
      });
      
      onSuccess(newRecord);
      onClose();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} DNS record:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} DNS record`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show MX priority field only for MX records
  const showPriority = form.watch('type') === DNSType.MX;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit DNS Record' : 'Add DNS Record'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
          {/* Domain Field */}
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              placeholder="example.com"
              {...form.register('domain')}
              disabled={isEditing} // Can't change domain when editing
            />
            {form.formState.errors.domain && (
              <p className="text-sm text-red-500">{form.formState.errors.domain.message}</p>
            )}
          </div>
          
          {/* Record Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Record Type</Label>
            <Select
              value={form.watch('type')}
              onValueChange={(value) => form.setValue('type', value as DNSType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select record type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DNSType.A}>A</SelectItem>
                <SelectItem value={DNSType.AAAA}>AAAA</SelectItem>
                <SelectItem value={DNSType.CNAME}>CNAME</SelectItem>
                <SelectItem value={DNSType.MX}>MX</SelectItem>
                <SelectItem value={DNSType.TXT}>TXT</SelectItem>
                <SelectItem value={DNSType.NS}>NS</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
            )}
          </div>
          
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="www"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          
          {/* Content Field */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Input
              id="content"
              placeholder={
                form.watch('type') === DNSType.A ? '192.168.1.1' :
                form.watch('type') === DNSType.AAAA ? '2001:db8::1' :
                form.watch('type') === DNSType.CNAME ? 'example.com' :
                form.watch('type') === DNSType.MX ? 'mail.example.com' :
                form.watch('type') === DNSType.TXT ? 'v=spf1 include:_spf.example.com ~all' :
                form.watch('type') === DNSType.NS ? 'ns1.example.com' : ''
              }
              {...form.register('content')}
            />
            {form.formState.errors.content && (
              <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
            )}
          </div>
          
          {/* TTL Field */}
          <div className="space-y-2">
            <Label htmlFor="ttl">TTL (seconds)</Label>
            <Input
              id="ttl"
              type="number"
              placeholder="3600"
              {...form.register('ttl', { valueAsNumber: true })}
            />
            {form.formState.errors.ttl && (
              <p className="text-sm text-red-500">{form.formState.errors.ttl.message}</p>
            )}
          </div>
          
          {/* Priority Field (MX only) */}
          {showPriority && (
            <div className="space-y-2">
              <Label htmlFor="priority">Priority (MX only)</Label>
              <Input
                id="priority"
                type="number"
                placeholder="10"
                {...form.register('priority', { valueAsNumber: true })}
              />
              {form.formState.errors.priority && (
                <p className="text-sm text-red-500">{form.formState.errors.priority.message}</p>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Record' : 'Create Record'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}