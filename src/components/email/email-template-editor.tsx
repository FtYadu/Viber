'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, X } from 'lucide-react';

// Define template schema
const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  subject: z.string().min(1, 'Subject is required'),
  html: z.string().min(1, 'HTML content is required'),
  text: z.string().min(1, 'Text content is required'),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  html?: string;
  text?: string;
  lastModified: Date;
}

interface EmailTemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: EmailTemplate) => void;
  template?: EmailTemplate; // If provided, we're editing an existing template
}

export function EmailTemplateEditor({
  isOpen,
  onClose,
  onSave,
  template,
}: EmailTemplateEditorProps) {
  const [activeTab, setActiveTab] = useState('html');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  
  const isEditing = !!template;
  
  // Set up form with default values
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template?.name || '',
      description: template?.description || '',
      subject: template?.subject || '',
      html: template?.html || getDefaultHtml(),
      text: template?.text || getDefaultText(),
    },
  });
  
  // Update form values when template changes
  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        description: template.description,
        subject: template.subject,
        html: template.html || getDefaultHtml(),
        text: template.text || getDefaultText(),
      });
      
      // Update preview
      setPreviewHtml(template.html || getDefaultHtml());
    } else {
      form.reset({
        name: '',
        description: '',
        subject: '',
        html: getDefaultHtml(),
        text: getDefaultText(),
      });
      
      // Update preview
      setPreviewHtml(getDefaultHtml());
    }
  }, [template, form]);
  
  // Update preview when HTML changes
  useEffect(() => {
    const html = form.watch('html');
    setPreviewHtml(html);
  }, [form.watch('html')]);
  
  const handleSubmit = async (values: TemplateFormValues) => {
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call an API to save the template
      // For now, we'll just simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedTemplate: EmailTemplate = {
        id: template?.id || `template_${Date.now()}`,
        name: values.name,
        description: values.description,
        subject: values.subject,
        html: values.html,
        text: values.text,
        lastModified: new Date(),
      };
      
      onSave(savedTemplate);
      
      toast({
        title: 'Success',
        description: `Email template ${isEditing ? 'updated' : 'created'} successfully`,
        variant: 'default',
      });
      
      onClose();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} email template:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} email template`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get default HTML template
  function getDefaultHtml() {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
    }
    h1 {
      color: #0f172a;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      background-color: #0f172a;
      color: white;
      padding: 12px 20px;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>{{title}}</h1>
  <p>Hello {{name}},</p>
  <p>{{message}}</p>
  <a href="{{buttonUrl}}" class="button">{{buttonText}}</a>
  <p>If you have any questions, feel free to contact us.</p>
  <p>Best regards,<br>Yadu Krishnan</p>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Yadu Krishnan Services. All rights reserved.</p>
  </div>
</body>
</html>
    `.trim();
  }
  
  // Get default text template
  function getDefaultText() {
    return `
Hello {{name}},

{{message}}

{{buttonText}}: {{buttonUrl}}

If you have any questions, feel free to contact us.

Best regards,
Yadu Krishnan

© ${new Date().getFullYear()} Yadu Krishnan Services. All rights reserved.
    `.trim();
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Email Template' : 'Create Email Template'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Template Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                placeholder="Welcome Email"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                placeholder="Welcome to Yadu Krishnan Services"
                {...form.register('subject')}
              />
              {form.formState.errors.subject && (
                <p className="text-sm text-red-500">{form.formState.errors.subject.message}</p>
              )}
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Sent to new clients when they are added to the system"
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>
          
          {/* Template Content */}
          <div className="space-y-2">
            <Label>Template Content</Label>
            <Tabs
              defaultValue="html"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="text">Plain Text</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="html">
                <Textarea
                  id="html"
                  placeholder="HTML content"
                  className="min-h-[300px] font-mono"
                  {...form.register('html')}
                />
                {form.formState.errors.html && (
                  <p className="text-sm text-red-500 mt-2">{form.formState.errors.html.message}</p>
                )}
              </TabsContent>
              
              <TabsContent value="text">
                <Textarea
                  id="text"
                  placeholder="Plain text content"
                  className="min-h-[300px] font-mono"
                  {...form.register('text')}
                />
                {form.formState.errors.text && (
                  <p className="text-sm text-red-500 mt-2">{form.formState.errors.text.message}</p>
                )}
              </TabsContent>
              
              <TabsContent value="preview">
                <div className="border rounded-md p-4 min-h-[300px] bg-white">
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-[300px] border-0"
                    title="Email Preview"
                  />
                </div>
              </TabsContent>
            </Tabs>
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
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Template' : 'Create Template'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}