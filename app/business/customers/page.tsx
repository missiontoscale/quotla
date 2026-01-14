'use client'

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddCustomerDialog } from '@/components/customers/AddCustomerDialog';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomersPage() {
  const { user } = useAuth();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const [dialogMode, setDialogMode] = useState<'create' | 'view' | 'edit'>('create');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalOutstanding: 0,
    thisMonth: 0
  });

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCustomers = (data || []).map((customer: any) => ({
        id: customer.id,
        name: customer.company_name || customer.full_name,
        contact: customer.contact_person,
        email: customer.email,
        phone: customer.phone,
        status: customer.is_active ? 'active' : 'inactive',
        balance: customer.outstanding_balance || 0
      }));

      setCustomers(formattedCustomers);
      calculateStats(formattedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    const totalOutstanding = data.reduce((sum, c) => sum + (c.balance || 0), 0);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    setStats({
      total: data.length,
      active: data.filter(c => c.status === 'active').length,
      totalOutstanding: totalOutstanding,
      thisMonth: 0
    });
  };

  const handleCustomerAdded = () => {
    fetchCustomers();
  };

  const handleView = (row: any) => {
    setSelectedCustomerId(row.id);
    setDialogMode('view');
    setEditDialogOpen(true);
  };

  const handleEdit = (row: any) => {
    setSelectedCustomerId(row.id);
    setDialogMode('edit');
    setEditDialogOpen(true);
  };

  const handleDelete = async (row: any) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', row.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer');
    }
  };

  const columns = [
    { key: 'name', label: 'Customer Name' },
    { key: 'contact', label: 'Contact Person' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors = {
          active: 'bg-emerald-500/20 text-emerald-400',
          inactive: 'bg-slate-500/20 text-slate-400',
        };
        return (
          <Badge className={statusColors[value as keyof typeof statusColors]}>
            {value}
          </Badge>
        );
      },
    },
    {
      key: 'balance',
      label: 'Outstanding Balance',
      render: (value: number) => value ? `$${value.toFixed(2)}` : '$0.00'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-100">Customers</h1>
          <p className="text-slate-400 mt-1">Manage your customer relationships and accounts</p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <AddCustomerDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleCustomerAdded}
      />

      <AddCustomerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleCustomerAdded}
        customerId={selectedCustomerId}
        mode={dialogMode}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Total Customers</p>
          <h3 className="text-2xl text-slate-100 mt-2">{stats.total}</h3>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Active Customers</p>
          <h3 className="text-2xl text-emerald-400 mt-2">{stats.active}</h3>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Total Outstanding</p>
          <h3 className="text-2xl text-slate-100 mt-2">${stats.totalOutstanding.toFixed(2)}</h3>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">This Month</p>
          <h3 className="text-2xl text-cyan-400 mt-2">+{stats.thisMonth}</h3>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchPlaceholder="Search customers..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
