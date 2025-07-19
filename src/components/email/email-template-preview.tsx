'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  html?: string;
  text?: string;
  lastModified: Date;
}

interface EmailTemplatePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate;
}

export function EmailTemplatePreview({
  isOpen,
  onClose,
  template,
}: EmailTemplatePreviewProps) {
  const [activeTab, setActiveTab] = useState('html');
  
  // Replace template variables with sample data
  const sampleData = {
    name: 'John Doe',
    title: 'Welcome to Our Service',
    message: 'Thank you for joining Yadu Krishnan Services. We\'re excited to work with you!',
    buttonText: 'Access Client Portal',
    buttonUrl: 'https://example.com/client',
    invoiceNumber: 'INV-20230101-0001',
    amount: '$500.00',
    dueDate: 'January 31, 2023',
    projectName: 'Website Redesign',
    status: 'In Progress',
  };
  
  // Replace template variables in HTML
  const processedHtml = template.html
    ? Object.entries(sampleData).reduce(
        (html, [key, value]) => html.replace(new RegExp(`{{${key}}}`, 'g'), value),
        template.html
      )
    : '';
  
  // Replace template variables in text
  const processedText = template.text
    ? Object.entries(sampleData).reduce(
        (text, [key, value]) => text.replace(new RegExp(`{{${key}}}`, 'g'), value),
        template.text
      )
    : '';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Preview: {template.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Subject:</h3>
            <p className="font-medium">{template.subject}</p>
          </div>
          
          <Tabs
            defaultValue="html"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="text">Plain Text</TabsTrigger>
            </TabsList>
            
            <TabsContent value="html">
              <div className="border rounded-md p-4 min-h-[400px] bg-white">
                <iframe
                  srcDoc={processedHtml}
                  className="w-full h-[400px] border-0"
                  title="Email Preview"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="text">
              <div className="border rounded-md p-4 min-h-[400px] bg-white">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {processedText}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}