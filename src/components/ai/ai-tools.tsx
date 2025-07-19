'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CaptionGenerator } from './caption-generator';
import { EmailComposer } from './email-composer';
import { ContentGenerator } from './content-generator';

export function AITools() {
  const [activeTab, setActiveTab] = useState('captions');
  
  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="captions"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-[400px] mb-6">
          <TabsTrigger value="captions">Captions</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>
        
        <TabsContent value="captions">
          <CaptionGenerator />
        </TabsContent>
        
        <TabsContent value="emails">
          <EmailComposer />
        </TabsContent>
        
        <TabsContent value="content">
          <ContentGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}