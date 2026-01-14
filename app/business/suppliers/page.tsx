'use client'

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddSupplierDialog } from '@/components/suppliers/AddSupplierDialog';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function SuppliersPage() {
  const { user } = useAuth();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | undefined>(undefined);
  const [dialogMode, setDialogMode] = useState<'create' | 'view' | 'edit'>('create');
  const [suppliersData, setSuppliersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    categories: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    if (user) {
      fetchSuppliers();
    }
  }, [user]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedSuppliers = (data || []).map((supplier: any) => ({
        id: supplier.id,
        name: supplier.name,
        contact: supplier.contact_person,
        email: supplier.email,
        phone: supplier.phone,
        category: supplier.notes ? supplier.notes.replace('Category: ', '') : 'General',
        status: supplier.is_active ? 'active' : 'inactive'
      }));

      setSuppliersData(formattedSuppliers);

      const uniqueCategories = new Set(formattedSuppliers.map((s: any) => s.category));
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      setStats({
        total: formattedSuppliers.length,
        active: formattedSuppliers.filter((s: any) => s.status === 'active').length,
        categories: uniqueCategories.size,
        newThisMonth: 0
      });
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierAdded = () => {
    fetchSuppliers();
  };

  const handleView = (row: any) => {
    setSelectedSupplierId(row.id);
    setDialogMode('view');
    setEditDialogOpen(true);
  };

  const handleEdit = (row: any) => {
    setSelectedSupplierId(row.id);
    setDialogMode('edit');
    setEditDialogOpen(true);
  };

  const handleDelete = async (row: any) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', row.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Failed to delete supplier');
    }
  };

  const columns = [
    { key: 'name', label: 'Supplier Name' },
    { key: 'contact', label: 'Contact Person' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'category', label: 'Category' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors = {
          active: 'bg-emerald-500/20 text-emerald-400',
          inactive: 'bg-slate-500/20 text-slate-400',
        };
        return (
          <Badge className={statusColors[value as keyof typeof statusColors] || statusColors.active}>
            {value}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-100">Suppliers</h1>
          <p className="text-slate-400 mt-1">Manage your supplier relationships and procurement</p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <AddSupplierDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleSupplierAdded}
      />

      <AddSupplierDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleSupplierAdded}
        supplierId={selectedSupplierId}
        mode={dialogMode}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Total Suppliers</p>
          <h3 className="text-2xl text-slate-100 mt-2">{stats.total}</h3>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Active Suppliers</p>
          <h3 className="text-2xl text-emerald-400 mt-2">{stats.active}</h3>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Categories</p>
          <h3 className="text-2xl text-slate-100 mt-2">{stats.categories}</h3>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">New This Month</p>
          <h3 className="text-2xl text-cyan-400 mt-2">+{stats.newThisMonth}</h3>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={suppliersData}
        searchPlaceholder="Search suppliers..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
