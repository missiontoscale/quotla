'use client'

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual payments fetch from Supabase
      setPayments([]);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'invoice', label: 'Invoice' },
    { key: 'customer', label: 'Customer' },
    { key: 'amount', label: 'Amount' },
    {
      key: 'method',
      label: 'Payment Method',
      render: (value: string) => <Badge>{value}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const colors = {
          completed: 'bg-emerald-500/20 text-emerald-400',
          pending: 'bg-amber-500/20 text-amber-400',
          failed: 'bg-rose-500/20 text-rose-400',
        };
        return <Badge className={colors[value as keyof typeof colors]}>{value}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-slate-100">Payments</h1>
        <p className="text-slate-400 mt-1">Track and manage all payment transactions</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Total Received</p>
          <h3 className="text-2xl text-slate-100 mt-2">$0.00</h3>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Pending</p>
          <h3 className="text-2xl text-amber-400 mt-2">$0.00</h3>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">This Month</p>
          <h3 className="text-2xl text-emerald-400 mt-2">$0.00</h3>
        </Card>
      </div>
      <DataTable
        columns={columns}
        data={payments}
        searchPlaceholder="Search payments..."
        onView={(row) => console.log('View', row)}
      />
    </div>
  );
}
