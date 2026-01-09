'use client'

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function AuditPage() {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAuditLogs();
    }
  }, [user]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual audit logs fetch from Supabase
      setAuditLogs([]);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'user', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'resource', label: 'Resource' },
    { key: 'details', label: 'Details' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-slate-100">Audit Log</h1>
        <p className="text-slate-400 mt-1">Track all system activities and changes</p>
      </div>
      <DataTable
        columns={columns}
        data={auditLogs}
        searchPlaceholder="Search audit logs..."
        onView={(row) => console.log('View', row)}
      />
    </div>
  );
}
