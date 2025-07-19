'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  FileText,
  Tag,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

interface ProjectDetailProps {
  project: any; // Using any for now, but should be properly typed
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PLANNING':
        return 'bg-purple-100 text-purple-800';
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'ON_HOLD':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get task status color
  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'TODO':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Calculate project completion percentage
  const getProjectProgress = (project: any) => {
    switch (project.status) {
      case 'COMPLETED':
        return 100;
      case 'REVIEW':
        return 85;
      case 'IN_PROGRESS':
        return 50;
      case 'PLANNING':
        return 15;
      case 'ON_HOLD':
        return 30;
      default:
        return 0;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button variant="outline" asChild>
          <Link href="/client/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </motion.div>
      
      {/* Project Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{project.title}</h1>
                  <Badge
                    className={getStatusColor(project.status)}
                    variant="secondary"
                  >
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link href="/client/support">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Support
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Project Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">
                  {getProjectProgress(project)}% Complete
                </span>
                <span className="text-muted-foreground">
                  {project.status === 'COMPLETED'
                    ? 'Completed'
                    : project.deadline
                    ? `Due ${format(new Date(project.deadline), 'MMM dd, yyyy')}`
                    : 'No deadline set'}
                </span>
              </div>
              <Progress value={getProjectProgress(project)} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Project Details Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Project Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Start Date
                      </h3>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <span>
                          {format(new Date(project.startDate), 'MMMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                    
                    {project.deadline && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                          Deadline
                        </h3>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          <span>
                            {format(new Date(project.deadline), 'MMMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {project.tags && project.tags.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                          Tags
                        </h3>
                        <div className="flex items-center flex-wrap gap-2">
                          <Tag className="h-4 w-4 mr-1 text-primary" />
                          {project.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Status
                      </h3>
                      <Badge
                        className={getStatusColor(project.status)}
                        variant="secondary"
                      >
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Last Updated
                      </h3>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        <span>
                          {format(new Date(project.updatedAt), 'MMMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                    
                    {project.priority && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                          Priority
                        </h3>
                        <Badge
                          variant="outline"
                          className={
                            project.priority === 'HIGH'
                              ? 'border-red-500 text-red-500'
                              : project.priority === 'MEDIUM'
                              ? 'border-yellow-500 text-yellow-500'
                              : 'border-green-500 text-green-500'
                          }
                        >
                          {project.priority}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Project Description */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Full Description
                  </h3>
                  <div className="bg-muted/30 p-4 rounded-md">
                    <p className="whitespace-pre-line">{project.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Project Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {project.tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                    <p className="text-muted-foreground">
                      There are no tasks associated with this project yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {project.tasks.map((task: any) => (
                      <div
                        key={task.id}
                        className="border rounded-md p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{task.title}</h3>
                          <Badge
                            className={getTaskStatusColor(task.status)}
                            variant="secondary"
                          >
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-muted-foreground text-sm mb-3">
                            {task.description}
                          </p>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Files Tab */}
          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Project Files</CardTitle>
              </CardHeader>
              <CardContent>
                {project.files.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No files found</h3>
                    <p className="text-muted-foreground">
                      There are no files associated with this project yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {project.files.map((file: any) => (
                      <div
                        key={file.id}
                        className="border rounded-md p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-primary" />
                            <div>
                              <h3 className="font-medium">{file.mimeType}</h3>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB • 
                                {format(new Date(file.createdAt), ' MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto"
                            asChild
                          >
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}