'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  MoreHorizontal,
  Trash2,
  Edit,
  Play,
  Pause,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

// Define automation rule type
interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

// Mock automation rules data
const mockRules: AutomationRule[] = [
  {
    id: 'rule_1',
    name: 'Invoice Follow-up',
    description: 'Send a reminder email 3 days before invoice due date',
    trigger: 'Invoice due date approaching (3 days)',
    action: 'Send invoice reminder email',
    enabled: true,
  },
  {
    id: 'rule_2',
    name: 'Welcome Email',
    description: 'Send a welcome email when a new client is added',
    trigger: 'New client created',
    action: 'Send welcome email',
    enabled: true,
  },
  {
    id: 'rule_3',
    name: 'Project Status Update',
    description: 'Notify client when project status changes',
    trigger: 'Project status changed',
    action: 'Send project update email',
    enabled: true,
  },
  {
    id: 'rule_4',
    name: 'Overdue Invoice',
    description: 'Send a reminder email when an invoice is overdue',
    trigger: 'Invoice status changed to OVERDUE',
    action: 'Send overdue invoice email',
    enabled: false,
  },
  {
    id: 'rule_5',
    name: 'Project Deadline',
    description: 'Send a notification when a project deadline is approaching',
    trigger: 'Project deadline approaching (7 days)',
    action: 'Send deadline notification email',
    enabled: true,
  },
];

export function EmailAutomationRules() {
  const [rules, setRules] = useState<AutomationRule[]>(mockRules);
  
  // Handle toggle rule
  const handleToggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
    
    const rule = rules.find(r => r.id === id);
    if (rule) {
      toast({
        title: 'Success',
        description: `Automation rule "${rule.name}" ${rule.enabled ? 'disabled' : 'enabled'}`,
        variant: 'default',
      });
    }
  };
  
  // Handle delete rule
  const handleDeleteRule = (id: string) => {
    const rule = rules.find(r => r.id === id);
    setRules(rules.filter(rule => rule.id !== id));
    
    if (rule) {
      toast({
        title: 'Success',
        description: `Automation rule "${rule.name}" deleted`,
        variant: 'default',
      });
    }
  };
  
  // Handle edit rule
  const handleEditRule = (id: string) => {
    // In a real implementation, this would open a dialog to edit the rule
    toast({
      title: 'Info',
      description: 'Edit rule functionality would be implemented here',
      variant: 'default',
    });
  };
  
  // Handle add rule
  const handleAddRule = () => {
    // In a real implementation, this would open a dialog to add a new rule
    toast({
      title: 'Info',
      description: 'Add rule functionality would be implemented here',
      variant: 'default',
    });
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Automation Rules</CardTitle>
        <Button onClick={handleAddRule}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No automation rules found
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{rule.description}</TableCell>
                    <TableCell>{rule.trigger}</TableCell>
                    <TableCell>{rule.action}</TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => handleToggleRule(rule.id)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleRule(rule.id)}
                          title={rule.enabled ? 'Disable' : 'Enable'}
                        >
                          {rule.enabled ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditRule(rule.id)}
                          title="Edit Rule"
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
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteRule(rule.id)}
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