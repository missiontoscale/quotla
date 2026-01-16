'use client'

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, Truck, TrendingUp, Receipt, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddExpenseDialog } from '@/components/expenses/AddExpenseDialog';
import { AddVendorDialog } from '@/components/expenses/AddVendorDialog';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDisplayCurrency } from '@/hooks/useUserCurrency';
import { formatCurrency } from '@/lib/utils/currency';
import { CURRENCIES } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExpenseRow {
  id: string;
  description: string;
  vendor: string;
  category: string;
  amount: number;
  date: string;
  status: string;
}

interface VendorRow {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  category: string;
  status: string;
}

export default function ExpensesPage() {
  const { user } = useAuth();
  const { userCurrency, displayCurrency, setDisplayCurrency, isConverted } = useDisplayCurrency();
  const [activeTab, setActiveTab] = useState('expenses');

  // Expense dialog state
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [editExpenseDialogOpen, setEditExpenseDialogOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | undefined>(undefined);
  const [expenseDialogMode, setExpenseDialogMode] = useState<'create' | 'edit'>('create');

  // Vendor dialog state
  const [addVendorDialogOpen, setAddVendorDialogOpen] = useState(false);
  const [editVendorDialogOpen, setEditVendorDialogOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | undefined>(undefined);
  const [vendorDialogMode, setVendorDialogMode] = useState<'create' | 'edit'>('create');

  // Data state
  const [expensesData, setExpensesData] = useState<ExpenseRow[]>([]);
  const [vendorsData, setVendorsData] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalExpenses: 0,
    thisMonth: 0,
    totalVendors: 0,
    activeVendors: 0,
    pendingExpenses: 0,
    categories: 0
  });

  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchVendors();
    }
  }, [user]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*, suppliers(name)')
        .eq('user_id', user?.id)
        .order('expense_date', { ascending: false });

      if (error) throw error;

      const formattedExpenses: ExpenseRow[] = (data || []).map((expense: any) => ({
        id: expense.id,
        description: expense.description,
        vendor: expense.suppliers?.name || expense.vendor_name || 'Unknown',
        category: expense.category,
        amount: expense.amount || 0,
        date: new Date(expense.expense_date).toLocaleDateString(),
        status: expense.status
      }));

      setExpensesData(formattedExpenses);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthExpenses = (data || []).filter((e: any) => new Date(e.expense_date) >= startOfMonth);
      const thisMonthTotal = thisMonthExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
      const pendingCount = (data || []).filter((e: any) => e.status === 'pending').length;
      const uniqueCategories = new Set((data || []).map((e: any) => e.category));

      setStats(prev => ({
        ...prev,
        totalExpenses: (data || []).reduce((sum: number, e: any) => sum + (e.amount || 0), 0),
        thisMonth: thisMonthTotal,
        pendingExpenses: pendingCount,
        categories: uniqueCategories.size
      }));
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedVendors: VendorRow[] = (data || []).map((vendor: any) => ({
        id: vendor.id,
        name: vendor.name,
        contact: vendor.contact_person,
        email: vendor.email,
        phone: vendor.phone,
        category: vendor.notes ? vendor.notes.replace('Category: ', '') : 'General',
        status: vendor.is_active ? 'active' : 'inactive'
      }));

      setVendorsData(formattedVendors);

      setStats(prev => ({
        ...prev,
        totalVendors: formattedVendors.length,
        activeVendors: formattedVendors.filter(v => v.status === 'active').length
      }));
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const handleExpenseAdded = () => {
    fetchExpenses();
  };

  const handleVendorAdded = () => {
    fetchVendors();
  };

  // Expense handlers
  const handleViewExpense = (row: ExpenseRow) => {
    setSelectedExpenseId(row.id);
    setExpenseDialogMode('edit');
    setEditExpenseDialogOpen(true);
  };

  const handleEditExpense = (row: ExpenseRow) => {
    setSelectedExpenseId(row.id);
    setExpenseDialogMode('edit');
    setEditExpenseDialogOpen(true);
  };

  const handleDeleteExpense = async (row: ExpenseRow) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', row.id)
        .eq('user_id', user?.id);

      if (error) throw error;
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  // Vendor handlers
  const handleViewVendor = (row: VendorRow) => {
    setSelectedVendorId(row.id);
    setVendorDialogMode('edit');
    setEditVendorDialogOpen(true);
  };

  const handleEditVendor = (row: VendorRow) => {
    setSelectedVendorId(row.id);
    setVendorDialogMode('edit');
    setEditVendorDialogOpen(true);
  };

  const handleDeleteVendor = async (row: VendorRow) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', row.id)
        .eq('user_id', user?.id);

      if (error) throw error;
      fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert('Failed to delete vendor');
    }
  };

  const expenseColumns = [
    { key: 'description', label: 'Description' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'category', label: 'Category' },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number) => formatCurrency(value, displayCurrency)
    },
    { key: 'date', label: 'Date' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors: Record<string, string> = {
          pending: 'bg-amber-500/20 text-amber-400',
          approved: 'bg-emerald-500/20 text-emerald-400',
          reimbursed: 'bg-blue-500/20 text-blue-400',
          rejected: 'bg-rose-500/20 text-rose-400',
        };
        return (
          <Badge className={statusColors[value] || statusColors.pending}>
            {value}
          </Badge>
        );
      },
    },
  ];

  const vendorColumns = [
    { key: 'name', label: 'Vendor Name' },
    { key: 'contact', label: 'Contact Person' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'category', label: 'Category' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors: Record<string, string> = {
          active: 'bg-emerald-500/20 text-emerald-400',
          inactive: 'bg-slate-500/20 text-slate-400',
        };
        return (
          <Badge className={statusColors[value] || statusColors.active}>
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
          <h1 className="text-3xl text-slate-100">Expenses</h1>
          <p className="text-slate-400 mt-1">Track expenses and manage vendors</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
              <SelectTrigger className="w-[120px] bg-slate-800 border-slate-700 text-slate-100 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isConverted && (
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <RefreshCw className="w-3 h-3" />
                <span>Converted</span>
              </div>
            )}
          </div>
          {activeTab === 'expenses' ? (
            <Button
              onClick={() => setAddExpenseDialogOpen(true)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          ) : (
            <Button
              onClick={() => setAddVendorDialogOpen(true)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddExpenseDialog
        open={addExpenseDialogOpen}
        onOpenChange={setAddExpenseDialogOpen}
        onSuccess={handleExpenseAdded}
      />
      <AddExpenseDialog
        open={editExpenseDialogOpen}
        onOpenChange={setEditExpenseDialogOpen}
        onSuccess={handleExpenseAdded}
        expenseId={selectedExpenseId}
        mode={expenseDialogMode}
      />
      <AddVendorDialog
        open={addVendorDialogOpen}
        onOpenChange={setAddVendorDialogOpen}
        onSuccess={handleVendorAdded}
      />
      <AddVendorDialog
        open={editVendorDialogOpen}
        onOpenChange={setEditVendorDialogOpen}
        onSuccess={handleVendorAdded}
        vendorId={selectedVendorId}
        mode={vendorDialogMode}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Expenses</p>
              <h3 className="text-2xl text-slate-100">
                {formatCurrency(stats.totalExpenses, displayCurrency)}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">This Month</p>
              <h3 className="text-2xl text-cyan-400">
                {formatCurrency(stats.thisMonth, displayCurrency)}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <Truck className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Active Vendors</p>
              <h3 className="text-2xl text-slate-100">{stats.activeVendors}</h3>
            </div>
          </div>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Receipt className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Pending</p>
              <h3 className="text-2xl text-amber-400">{stats.pendingExpenses}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="expenses" className="data-[state=active]:bg-slate-700">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="vendors" className="data-[state=active]:bg-slate-700">
            Vendors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="mt-6">
          <DataTable
            columns={expenseColumns}
            data={expensesData}
            searchPlaceholder="Search expenses..."
            onView={handleViewExpense}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
          />
        </TabsContent>

        <TabsContent value="vendors" className="mt-6">
          <DataTable
            columns={vendorColumns}
            data={vendorsData}
            searchPlaceholder="Search vendors..."
            onView={handleViewVendor}
            onEdit={handleEditVendor}
            onDelete={handleDeleteVendor}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
