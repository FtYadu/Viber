'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Plus, 
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  Copy,
  Mail,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { EMAIL_TEMPLATES } from '@/lib/constants';

// Define template type
interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  lastModified: Date;
}

// Mock templates data
const mockTemplates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Sent to new clients when they are added to the system',
    subject: 'Welcome to Yadu Krishnan Services',
    lastModified: new Date('2023-06-15'),
  },
  {
    id: 'invoice',
    name: 'Invoice Notification',
    description: 'Sent when a new invoice is created',
    subject: 'Invoice {invoiceNumber} - Yadu Krishnan Services',
    lastModified: new Date('2023-07-22'),
  },
  {
    id: 'project_update',
    name: 'Project Update',
    description: 'Sent when a project status is updated',
    subject: 'Project Update: {projectName}',
    lastModified: new Date('2023-08-10'),
  },
  {
    id: 'password_reset',
    name: 'Password Reset',
    description: 'Sent when a user requests a password reset',
    subject: 'Password Reset - Yadu Krishnan Services',
    lastModified: new Date('2023-05-30'),
  },
  {
    id: 'contact_form',
    name: 'Contact Form Submission',
    description: 'Sent when someone submits the contact form',
    subject: 'Contact Form: {subject}',
    lastModified: new Date('2023-09-05'),
  },
];

interface EmailTemplatesListProps {
  onViewTemplate: (template: EmailTemplate) => void;
  onEditTemplate: (template: EmailTemplate) => void;
  onCreateTemplate: () => void;
  onSendTest: (template: EmailTemplate) => void;
}

export function EmailTemplatesList({
  onViewTemplate,
  onEditTemplate,
  onCreateTemplate,
  onSendTest,
}: EmailTemplatesListProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter templates based on search term
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle template deletion
  const handleDeleteTemplate = (id: string) => {
    // In a real implementation, this would call an API to delete the template
    // For now, we'll just remove it from the state
    setTemplates(templates.filter(template => template.id !== id));
    
    toast({
      title: 'Success',
      description: 'Email template deleted successfully',
      variant: 'default',
    });
  };
  
  // Handle template duplication
  const handleDuplicateTemplate = (template: EmailTemplate) => {
    // In a real implementation, this would call an API to duplicate the template
    // For now, we'll just add a new template to the state
    const newTemplate = {
      ...template,
      id: `${template.id}_copy_${Date.now()}`,
      name: `${template.name} (Copy)`,
      lastModified: new Date(),
    };
    
    setTemplates([...templates, newTemplate]);
    
    toast({
      title: 'Success',
      description: 'Email template duplicated successfully',
      variant: 'default',
    });
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Email Templates</CardTitle>
        <Button onClick={onCreateTemplate}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No email templates found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.description}</TableCell>
                    <TableCell>{template.subject}</TableCell>
                    <TableCell>{template.lastModified.toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onViewTemplate(template)}
                          title="View Template"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEditTemplate(template)}
                          title="Edit Template"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onSendTest(template)}>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Test
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}