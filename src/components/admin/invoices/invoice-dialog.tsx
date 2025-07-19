'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface InvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any | null;
  clients: any[];
  onSave: (invoice: any, isNew: boolean) => void;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export function InvoiceDialog({ isOpen, onClose, invoice, clients, onSave }: InvoiceDialogProps) {
  const [formData, setFormData] = useState({
    id: '',
    amount: 0,
    currency: 'USD',
    status: 'DRAFT',
    dueDate: '',
    clientId: '',
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0 }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens/closes or invoice changes
  useEffect(() => {
    if (isOpen) {
      if (invoice) {
        setFormData({
          id: invoice.id,
          amount: invoice.amount,
          currency: invoice.currency,
          status: invoice.status,
          dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
          clientId: invoice.clientId,
        });
        // In a real implementation, you would fetch invoice items here
        setItems([{ description: 'Professional Services', quantity: 1, unitPrice: invoice.amount }]);
      } else {
        const today = new Date();
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + 30); // Due in 30 days by default
        
        setFormData({
          id: '',
          amount: 0,
          currency: 'USD',
          status: 'DRAFT',
          dueDate: dueDate.toISOString().split('T')[0],
          clientId: clients.length > 0 ? clients[0].id : '',
        });
        setItems([{ description: 'Professional Services', quantity: 1, unitPrice: 0 }]);
      }
      setErrors({});
    }
  }, [isOpen, invoice, clients]);

  // Calculate total amount from items
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    setFormData(prev => ({ ...prev, amount: total }));
  }, [items]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for the field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index][field] = Number(value) || 0;
    } else {
      newItems[index][field] = value as string;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.clientId) {
      newErrors.clientId = 'Client is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    // Validate items
    let hasItemError = false;
    items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item_${index}_description`] = 'Description is required';
        hasItemError = true;
      }
      
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
        hasItemError = true;
      }
      
      if (item.unitPrice <= 0) {
        newErrors[`item_${index}_unitPrice`] = 'Unit price must be greater than 0';
        hasItemError = true;
      }
    });
    
    if (hasItemError) {
      newErrors.items = 'Please fix errors in invoice items';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave(
        {
          id: formData.id,
          amount: formData.amount,
          currency: formData.currency,
          status: formData.status,
          dueDate: formData.dueDate,
          clientId: formData.clientId,
          items: items,
        },
        !formData.id
      );
      
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Client */}
            <div className="grid gap-2">
              <Label htmlFor="clientId" className="required">Client</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => handleChange('clientId', value)}
              >
                <SelectTrigger id="clientId" className={errors.clientId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.company ? `(${client.company})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-sm text-red-500">{errors.clientId}</p>
              )}
            </div>
            
            {/* Status and Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="dueDate" className="required">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  className={errors.dueDate ? 'border-red-500' : ''}
                />
                {errors.dueDate && (
                  <p className="text-sm text-red-500">{errors.dueDate}</p>
                )}
              </div>
            </div>
            
            {/* Currency */}
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleChange('currency', value)}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Invoice Items */}
            <div className="grid gap-2">
              <Label>Invoice Items</Label>
              {errors.items && (
                <p className="text-sm text-red-500">{errors.items}</p>
              )}
              
              <div className="border rounded-md p-4 space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Label htmlFor={`item-${index}-description`} className="text-xs">Description</Label>
                      <Input
                        id={`item-${index}-description`}
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className={errors[`item_${index}_description`] ? 'border-red-500' : ''}
                      />
                      {errors[`item_${index}_description`] && (
                        <p className="text-xs text-red-500">{errors[`item_${index}_description`]}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor={`item-${index}-quantity`} className="text-xs">Quantity</Label>
                      <Input
                        id={`item-${index}-quantity`}
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className={errors[`item_${index}_quantity`] ? 'border-red-500' : ''}
                      />
                      {errors[`item_${index}_quantity`] && (
                        <p className="text-xs text-red-500">{errors[`item_${index}_quantity`]}</p>
                      )}
                    </div>
                    
                    <div className="col-span-3">
                      <Label htmlFor={`item-${index}-unitPrice`} className="text-xs">Unit Price</Label>
                      <Input
                        id={`item-${index}-unitPrice`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className={errors[`item_${index}_unitPrice`] ? 'border-red-500' : ''}
                      />
                      {errors[`item_${index}_unitPrice`] && (
                        <p className="text-xs text-red-500">{errors[`item_${index}_unitPrice`]}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2 flex items-center justify-end">
                      <span className="text-sm font-medium mr-2">
                        {(item.quantity * item.unitPrice).toFixed(2)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
            
            {/* Total Amount */}
            <div className="flex justify-end items-center">
              <Label htmlFor="amount" className="mr-4">Total Amount:</Label>
              <div className="text-xl font-bold">
                {formData.currency} {formData.amount.toFixed(2)}
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
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {invoice ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                invoice ? 'Update Invoice' : 'Create Invoice'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}