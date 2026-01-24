'use client'

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, Truck, TrendingUp, Receipt, RefreshCw, Upload, ArrowUpRight, ArrowDownRight, Calendar, Percent, BarChart3 } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterSelect } from '@/components/filters';
import { AddExpenseDialog } from '@/components/expenses/AddExpenseDialog';
import { AddVendorDialog } from '@/components/expenses/AddVendorDialog';
import { BankImportModal } from '@/components/bank-import/BankImportModal';
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
import {
  dashboardColors as colors,
  dashboardComponents as components,
  cn
} from '@/hooks/use-dashboard-theme';

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

type ExpenseStatusFilter = 'all' | 'pending' | 'approved' | 'reimbursed' | 'rejected';
type VendorStatusFilter = 'all' | 'active' | 'inactive';

export default function ExpensesPage() {
  const { user } = useAuth();
  const { userCurrency, displayCurrency, setDisplayCurrency, isConverted } = useDisplayCurrency();
  const [activeTab, setActiveTab] = useState('expenses');

  // Filter states
  const [expenseStatusFilter, setExpenseStatusFilter] = useState<ExpenseStatusFilter>('all');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');
  const [vendorStatusFilter, setVendorStatusFilter] = useState<VendorStatusFilter>('all');

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

  // Bank import modal state
  const [bankImportModalOpen, setBankImportModalOpen] = useState(false);

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

  // Monthly expense trend data
  const [monthlyExpenseData, setMonthlyExpenseData] = useState<{month: string, total: number}[]>([]);

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

      // Current calculations
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthExpenses = (data || []).filter((e: any) => new Date(e.expense_date) >= thisMonthStart);
      const thisMonthTotal = thisMonthExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
      const pendingCount = (data || []).filter((e: any) => e.status === 'pending').length;
      const uniqueCategories = new Set((data || []).map((e: any) => e.category));

      // NEW: Month-over-month comparison
      const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
      const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

      const lastMonthExpenses = (data || []).filter((e: any) => {
        const date = new Date(e.expense_date);
        return date >= lastMonthStart && date <= lastMonthEnd;
      });
      const lastMonthTotal = lastMonthExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

      const expensesGrowth = lastMonthTotal > 0
        ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        : thisMonthTotal > 0 ? 100 : 0;

      // NEW: Average daily expense
      const daysInMonth = new Date().getDate();
      const avgDailyExpense = thisMonthTotal / daysInMonth;

      // NEW: Status breakdown
      const statusBreakdown = {
        pending: (data || []).filter((e: any) => e.status === 'pending').length,
        approved: (data || []).filter((e: any) => e.status === 'approved').length,
        reimbursed: (data || []).filter((e: any) => e.status === 'reimbursed').length,
        rejected: (data || []).filter((e: any) => e.status === 'rejected').length
      };

      // NEW: Category totals for top categories
      const categoryTotals = (data || []).reduce((acc: any, exp: any) => {
        if (!acc[exp.category]) {
          acc[exp.category] = 0;
        }
        acc[exp.category] += exp.amount || 0;
        return acc;
      }, {});

      const topCategories = Object.entries(categoryTotals)
        .map(([category, amount]) => ({ category, amount: amount as number }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // NEW: 6-month trend data
      const sixMonthsAgo = subMonths(new Date(), 5);
      const months = eachMonthOfInterval({ start: startOfMonth(sixMonthsAgo), end: new Date() });

      const monthlyTrend = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const monthExpenses = (data || []).filter((exp: any) => {
          const date = new Date(exp.expense_date);
          return date >= monthStart && date <= monthEnd;
        });

        return {
          month: format(month, 'MMM'),
          total: monthExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
        };
      });

      setMonthlyExpenseData(monthlyTrend);

      // Update stats state with new metrics
      setStats(prev => ({
        ...prev,
        totalExpenses: (data || []).reduce((sum: number, e: any) => sum + (e.amount || 0), 0),
        thisMonth: thisMonthTotal,
        pendingExpenses: pendingCount,
        categories: uniqueCategories.size,
        lastMonthTotal,
        expensesGrowth,
        avgDailyExpense,
        statusBreakdown,
        topCategories
      } as any));
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

  // Get unique categories from expenses
  const expenseCategories = useMemo(() => {
    const categories = [...new Set(expensesData.map(e => e.category).filter(Boolean))];
    return categories.map(cat => ({ value: cat, label: cat }));
  }, [expensesData]);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expensesData.filter(expense => {
      const matchesStatus = expenseStatusFilter === 'all' || expense.status === expenseStatusFilter;
      const matchesCategory = expenseCategoryFilter === 'all' || expense.category === expenseCategoryFilter;
      return matchesStatus && matchesCategory;
    });
  }, [expensesData, expenseStatusFilter, expenseCategoryFilter]);

  // Filter vendors
  const filteredVendors = useMemo(() => {
    if (vendorStatusFilter === 'all') return vendorsData;
    return vendorsData.filter(v => v.status === vendorStatusFilter);
  }, [vendorsData, vendorStatusFilter]);

  // Filter options
  const expenseStatusOptions = [
    { value: 'pending', label: 'Pending', color: 'amber' as const },
    { value: 'approved', label: 'Approved', color: 'emerald' as const },
    { value: 'reimbursed', label: 'Reimbursed', color: 'blue' as const },
    { value: 'rejected', label: 'Rejected', color: 'rose' as const },
  ];

  const vendorStatusOptions = [
    { value: 'active', label: 'Active', color: 'emerald' as const },
    { value: 'inactive', label: 'Inactive', color: 'slate' as const },
  ];

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
          active: 'bg-quotla-green/20 text-emerald-400',
          inactive: 'bg-primary-600/20 text-primary-400',
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
          <h1 className="text-3xl text-primary-50">Expenses</h1>
          <p className="text-primary-400 mt-1">Track expenses and manage vendors</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
              <SelectTrigger className="w-[120px] bg-primary-700 border-primary-600 text-primary-50 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-quotla-dark border-primary-600">
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setBankImportModalOpen(true)}
                className="border-quotla-green text-quotla-green hover:bg-quotla-green/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Statement
              </Button>
              <Button
                onClick={() => setAddExpenseDialogOpen(true)}
                className="bg-quotla-orange hover:bg-secondary-400 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setAddVendorDialogOpen(true)}
              className="bg-quotla-orange hover:bg-secondary-400 text-white"
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
      <BankImportModal
        open={bankImportModalOpen}
        onOpenChange={setBankImportModalOpen}
        onSuccess={fetchExpenses}
      />

      {/* Enhanced Expense Metrics */}

      {/* Row 1: Expense Overview Card (Full-width) */}
      <div className="mb-4">
        <Card className={cn(
          'p-6 border shadow-lg',
          'bg-gradient-to-br from-quotla-dark/95 to-primary-800/50',
          'border-rose-500/20 hover:border-rose-500/40 transition-all duration-300',
          'shadow-quotla-dark/50'
        )}>
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-primary-400">Expense Overview</p>
            </div>
          </div>

          {/* Metric Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {/* Total Expenses Pill */}
            <div className={cn(
              'p-3 rounded-xl border backdrop-blur-sm transition-all duration-200',
              'bg-primary-700/30 border-rose-500/20 hover:border-rose-500/40'
            )}>
              <p className="text-xs text-primary-400 mb-1">Total Expenses</p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold text-primary-50">
                  {formatCurrency(stats.totalExpenses, displayCurrency)}
                </p>
              </div>
            </div>

            {/* This Month Pill */}
            <div className={cn(
              'p-3 rounded-xl border backdrop-blur-sm transition-all duration-200',
              'bg-primary-700/30 border-amber-500/20 hover:border-amber-500/40'
            )}>
              <p className="text-xs text-primary-400 mb-1">This Month</p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold text-primary-50">
                  {formatCurrency(stats.thisMonth, displayCurrency)}
                </p>
                {(stats as any).expensesGrowth !== undefined && (stats as any).expensesGrowth !== 0 && (
                  <span className={cn(
                    'flex items-center gap-0.5 text-xs font-medium',
                    (stats as any).expensesGrowth > 0 ? 'text-rose-400' : 'text-emerald-400'
                  )}>
                    {(stats as any).expensesGrowth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs((stats as any).expensesGrowth).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>

            {/* Avg Daily Expense Pill */}
            <div className={cn(
              'p-3 rounded-xl border backdrop-blur-sm transition-all duration-200',
              'bg-primary-700/30 border-quotla-orange/20 hover:border-quotla-orange/40'
            )}>
              <p className="text-xs text-primary-400 mb-1">Avg Daily</p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold text-primary-50">
                  {formatCurrency((stats as any).avgDailyExpense || 0, displayCurrency)}
                </p>
              </div>
            </div>

            {/* Categories Pill */}
            <div className={cn(
              'p-3 rounded-xl border backdrop-blur-sm transition-all duration-200',
              'bg-primary-700/30 border-teal-500/20 hover:border-teal-500/40'
            )}>
              <p className="text-xs text-primary-400 mb-1">Categories</p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold text-primary-50">
                  {stats.categories}
                </p>
              </div>
            </div>
          </div>

          {/* 6-Month Trend Chart */}
          <div className="h-[200px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyExpenseData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8a8a66', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8a8a66', fontSize: 11 }}
                  tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0e1616',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fffad6'
                  }}
                  formatter={(value: number) => [formatCurrency(value, displayCurrency), 'Expenses']}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#expenseGradient)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500/50 rounded-full" />
              <span className="text-xs text-primary-300">Total Expenses</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Category & Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Top Categories Card */}
        <Card className="bg-quotla-dark/90 border-primary-600 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-quotla-orange/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-quotla-orange" />
            </div>
            <div>
              <p className="text-xs text-primary-400 uppercase tracking-wider">Top Categories</p>
            </div>
          </div>
          <div className="space-y-2">
            {((stats as any).topCategories || []).map((cat: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-primary-200">{cat.category}</span>
                <span className="text-sm font-semibold text-rose-400">
                  {formatCurrency(cat.amount, displayCurrency)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Status Breakdown Card */}
        <Card className="bg-quotla-dark/90 border-primary-600 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-primary-400 uppercase tracking-wider">Status Breakdown</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-400">Pending</span>
              <span className="text-sm font-medium text-amber-400">
                {((stats as any).statusBreakdown?.pending || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-400">Approved</span>
              <span className="text-sm font-medium text-emerald-400">
                {((stats as any).statusBreakdown?.approved || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-400">Reimbursed</span>
              <span className="text-sm font-medium text-teal-400">
                {((stats as any).statusBreakdown?.reimbursed || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-400">Rejected</span>
              <span className="text-sm font-medium text-rose-400">
                {((stats as any).statusBreakdown?.rejected || 0)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Vendors Card (Enhanced) */}
      <div className="mb-4">
        <Card className="bg-quotla-dark/90 border-primary-600 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-quotla-green/15 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-quotla-green" />
            </div>
            <div>
              <p className="text-xs text-primary-400 uppercase tracking-wider">Vendors</p>
              <p className="text-2xl font-bold text-primary-50">{stats.activeVendors} active</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-primary-600">
            <div>
              <p className="text-xs text-primary-400">Total Vendors</p>
              <p className="text-sm font-medium text-primary-200">{stats.totalVendors}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-primary-400">Network</p>
              <p className="text-sm font-medium text-quotla-green">Active</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-primary-700 border-primary-600">
          <TabsTrigger value="expenses" className="data-[state=active]:bg-quotla-orange/20 data-[state=active]:text-quotla-orange">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="vendors" className="data-[state=active]:bg-quotla-orange/20 data-[state=active]:text-quotla-orange">
            Vendors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="mt-6">
          <DataTable
            columns={expenseColumns}
            data={filteredExpenses}
            searchPlaceholder="Search expenses..."
            onView={handleViewExpense}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            filters={
              <div className="flex gap-2">
                <FilterSelect
                  options={expenseStatusOptions}
                  value={expenseStatusFilter}
                  onChange={(v) => setExpenseStatusFilter(v as ExpenseStatusFilter)}
                  placeholder="Status"
                  allLabel="All Status"
                />
                <FilterSelect
                  options={expenseCategories}
                  value={expenseCategoryFilter}
                  onChange={setExpenseCategoryFilter}
                  placeholder="Category"
                  allLabel="All Categories"
                />
              </div>
            }
          />
        </TabsContent>

        <TabsContent value="vendors" className="mt-6">
          <DataTable
            columns={vendorColumns}
            data={filteredVendors}
            searchPlaceholder="Search vendors..."
            onView={handleViewVendor}
            onEdit={handleEditVendor}
            onDelete={handleDeleteVendor}
            filters={
              <FilterSelect
                options={vendorStatusOptions}
                value={vendorStatusFilter}
                onChange={(v) => setVendorStatusFilter(v as VendorStatusFilter)}
                placeholder="Status"
                allLabel="All Status"
              />
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
