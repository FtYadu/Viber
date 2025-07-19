'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils/invoice-utils';
import { format } from 'date-fns';
import {
  BarChart3,
  Calendar,
  CreditCard,
  FileText,
  FolderOpen,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ClientDashboardProps {
  client: any; // Using any for now, but should be properly typed
}

export function ClientDashboard({ client }: ClientDashboardProps) {
  // Calculate project statistics
  const totalProjects = client.projects.length;
  const completedProjects = client.projects.filter(
    (project: any) => project.status === 'COMPLETED'
  ).length;
  const inProgressProjects = client.projects.filter(
    (project: any) => project.status === 'IN_PROGRESS'
  ).length;
  const planningProjects = client.projects.filter(
    (project: any) => project.status === 'PLANNING'
  ).length;
  
  // Calculate invoice statistics
  const totalInvoices = client.invoices.length;
  const paidInvoices = client.invoices.filter(
    (invoice: any) => invoice.status === 'PAID'
  ).length;
  const pendingInvoices = client.invoices.filter(
    (invoice: any) => invoice.status === 'SENT'
  ).length;
  
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
  
  // Get invoice status color
  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-yellow-100 text-yellow-800';
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
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome, {client.name}</h2>
                <p className="text-muted-foreground">
                  Here's an overview of your projects and invoices
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button asChild>
                  <Link href="/client/support">Contact Support</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FolderOpen className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">{totalProjects}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-500 mr-2" />
                <div className="text-2xl font-bold">{inProgressProjects}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <div className="text-2xl font-bold">{completedProjects}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                <div className="text-2xl font-bold">{pendingInvoices}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>
                  Your most recently updated projects
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/client/projects">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {client.projects.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No projects found
                </div>
              ) : (
                client.projects.map((project: any) => (
                  <div
                    key={project.id}
                    className="border rounded-md p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Link
                        href={`/client/projects/${project.id}`}
                        className="font-medium hover:underline"
                      >
                        {project.title}
                      </Link>
                      <Badge
                        className={getStatusColor(project.status)}
                        variant="secondary"
                      >
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {project.description.length > 100
                        ? `${project.description.substring(0, 100)}...`
                        : project.description}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {format(new Date(project.updatedAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">
                          {getProjectProgress(project)}% Complete
                        </span>
                        <div className="w-24">
                          <Progress value={getProjectProgress(project)} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Recent Invoices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>
                  Your most recent invoices and payment status
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/client/invoices">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {client.invoices.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No invoices found
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-medium">Invoice #</th>
                        <th className="text-left p-3 font-medium">Date</th>
                        <th className="text-left p-3 font-medium">Amount</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-right p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {client.invoices.map((invoice: any) => (
                        <tr key={invoice.id} className="border-t">
                          <td className="p-3">{invoice.invoiceNumber}</td>
                          <td className="p-3">
                            {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                          </td>
                          <td className="p-3">
                            {formatCurrency(invoice.amount, invoice.currency)}
                          </td>
                          <td className="p-3">
                            <Badge
                              className={getInvoiceStatusColor(invoice.status)}
                              variant="secondary"
                            >
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8 w-8 p-0"
                            >
                              <Link href={`/client/invoices/${invoice.id}`}>
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Link>
                            </Button>
                            {invoice.status === 'SENT' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-8 w-8 p-0"
                              >
                                <Link href={`/client/invoices/${invoice.id}/payment`}>
                                  <CreditCard className="h-4 w-4" />
                                  <span className="sr-only">Pay</span>
                                </Link>
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}