'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  BarChart3,
} from 'lucide-react';

interface DNSOverviewProps {
  totalRecords: number;
  activeRecords: number;
  pendingRecords: number;
  errorRecords: number;
  domains: number;
  recordsByType: Record<string, number>;
}

export function DNSOverview({
  totalRecords,
  activeRecords,
  pendingRecords,
  errorRecords,
  domains,
  recordsByType,
}: DNSOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Records */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                <h3 className="text-2xl font-bold mt-1">{totalRecords}</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Across {domains} domain{domains !== 1 ? 's' : ''}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Active Records */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Records</p>
                <h3 className="text-2xl font-bold mt-1">{activeRecords}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {Math.round((activeRecords / totalRecords) * 100) || 0}% of total records
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Pending Records */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Records</p>
                <h3 className="text-2xl font-bold mt-1">{pendingRecords}</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {Math.round((pendingRecords / totalRecords) * 100) || 0}% of total records
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Error Records */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Records</p>
                <h3 className="text-2xl font-bold mt-1">{errorRecords}</h3>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {Math.round((errorRecords / totalRecords) * 100) || 0}% of total records
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}