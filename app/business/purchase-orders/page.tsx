'use client'

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function PurchaseOrdersPage() {
  const { user } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPurchaseOrders();
    }
  }, [user]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual purchase orders fetch from Supabase
      setPurchaseOrders([]);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'PO Number' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'date', label: 'Order Date' },
    { key: 'total', label: 'Total' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const colors = {
          pending: 'bg-amber-500/20 text-amber-400',
          approved: 'bg-emerald-500/20 text-emerald-400',
          received: 'bg-blue-500/20 text-blue-400',
        };
        return <Badge className={colors[value as keyof typeof colors]}>{value}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-slate-100">Purchase Orders</h1>
        <p className="text-slate-400 mt-1">Manage your purchase orders and procurement</p>
      </div>
      <DataTable
        columns={columns}
        data={purchaseOrders}
        searchPlaceholder="Search purchase orders..."
        onView={(row) => console.log('View', row)}
      />
    </div>
  );
}
