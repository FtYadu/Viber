'use client';

import { useState } from 'react';
import { DNSRecord } from '@prisma/client';
import { DNSRecordsList } from './dns-records-list';
import { DNSRecordForm } from './dns-record-form';
import { DNSOverview } from './dns-overview';

interface DNSManagerProps {
  initialRecords: DNSRecord[];
}

export function DNSManager({ initialRecords }: DNSManagerProps) {
  const [records, setRecords] = useState<DNSRecord[]>(initialRecords);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DNSRecord | undefined>(undefined);
  
  // Group records by domain
  const domains = [...new Set(records.map(record => record.domain))];
  
  // Count records by status
  const activeRecords = records.filter(record => record.status === 'ACTIVE').length;
  const pendingRecords = records.filter(record => record.status === 'PENDING').length;
  const errorRecords = records.filter(record => record.status === 'ERROR').length;
  
  // Count records by type
  const recordsByType = records.reduce((acc, record) => {
    acc[record.type] = (acc[record.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const handleAddRecord = () => {
    setSelectedRecord(undefined);
    setIsFormOpen(true);
  };
  
  const handleEditRecord = (record: DNSRecord) => {
    setSelectedRecord(record);
    setIsFormOpen(true);
  };
  
  const handleRecordSuccess = (record: DNSRecord) => {
    if (selectedRecord) {
      // Update existing record
      setRecords(records.map(r => (r.id === record.id ? record : r)));
    } else {
      // Add new record
      setRecords([...records, record]);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <DNSOverview
        totalRecords={records.length}
        activeRecords={activeRecords}
        pendingRecords={pendingRecords}
        errorRecords={errorRecords}
        domains={domains.length}
        recordsByType={recordsByType}
      />
      
      {/* DNS Records List */}
      <DNSRecordsList
        records={records}
        onAddRecord={handleAddRecord}
        onEditRecord={handleEditRecord}
      />
      
      {/* DNS Record Form Dialog */}
      <DNSRecordForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleRecordSuccess}
        record={selectedRecord}
      />
    </div>
  );
}