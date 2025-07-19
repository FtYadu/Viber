'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailTemplatesList } from './email-templates-list';
import { EmailTemplateEditor } from './email-template-editor';
import { EmailTemplatePreview } from './email-template-preview';
import { EmailTestSend } from './email-test-send';
import { EmailQueueList } from './email-queue-list';
import { EmailAutomationRules } from './email-automation-rules';

// Define template type
interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  html?: string;
  text?: string;
  lastModified: Date;
}

export function EmailManager() {
  const [activeTab, setActiveTab] = useState('templates');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTestSendOpen, setIsTestSendOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | undefined>(undefined);
  
  // Handle template view
  const handleViewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };
  
  // Handle template edit
  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };
  
  // Handle template create
  const handleCreateTemplate = () => {
    setSelectedTemplate(undefined);
    setIsEditorOpen(true);
  };
  
  // Handle template save
  const handleSaveTemplate = (template: EmailTemplate) => {
    // In a real implementation, this would call an API to save the template
    console.log('Template saved:', template);
  };
  
  // Handle test send
  const handleSendTest = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsTestSendOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="templates"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-[400px] mb-6">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="queue">Email Queue</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          <EmailTemplatesList
            onViewTemplate={handleViewTemplate}
            onEditTemplate={handleEditTemplate}
            onCreateTemplate={handleCreateTemplate}
            onSendTest={handleSendTest}
          />
        </TabsContent>
        
        <TabsContent value="queue">
          <EmailQueueList />
        </TabsContent>
        
        <TabsContent value="automation">
          <EmailAutomationRules />
        </TabsContent>
      </Tabs>
      
      {/* Template Editor Dialog */}
      {isEditorOpen && (
        <EmailTemplateEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveTemplate}
          template={selectedTemplate}
        />
      )}
      
      {/* Template Preview Dialog */}
      {isPreviewOpen && selectedTemplate && (
        <EmailTemplatePreview
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          template={selectedTemplate}
        />
      )}
      
      {/* Test Send Dialog */}
      {isTestSendOpen && selectedTemplate && (
        <EmailTestSend
          isOpen={isTestSendOpen}
          onClose={() => setIsTestSendOpen(false)}
          template={selectedTemplate}
        />
      )}
    </div>
  );
}