'use client'

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, FileText, DollarSign, Clock, RefreshCw, ChevronRight, Receipt, TrendingUp } from 'lucide-react';
import { restoreStockForInvoice } from '@/lib/inventory/stock-operations';
import { AddCustomerDialog } from '@/components/customers/AddCustomerDialog';
import { CustomerPreviewCard } from '@/components/customers/CustomerPreviewCard';
import { CustomerListModal } from '@/components/customers/CustomerListModal';
import { AddInvoiceDialog } from '@/components/invoices/AddInvoiceDialog';
import { InvoicePreviewCard } from '@/components/invoices/InvoicePreviewCard';
import { InvoiceListModal } from '@/components/invoices/InvoiceListModal';
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

interface CustomerRow {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  status: string;
  balance: number;
  totalEarnings: number;
  hasActiveQuotes: boolean;
}

interface QuoteRow {
  id: string;
  quote_number: string;
  client: string;
  client_id: string | null;
  title: string;
  status: string;
  total: number;
  issue_date: string;
}

interface InvoiceRow {
  id: string;
  invoice_number: string;
  client_name: string;
  client_id: string | null;
  title: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  total: number;
  issue_date: string;
  due_date: string | null;
}

type QuoteFilter = 'all' | 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
type InvoiceFilter = 'all' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
type LeftPaneTab = 'invoices' | 'quotes';

export default function SalesPage() {
  const { user } = useAuth();
  const { displayCurrency, setDisplayCurrency, isConverted } = useDisplayCurrency();

  // Left pane tab state
  const [leftPaneTab, setLeftPaneTab] = useState<LeftPaneTab>('invoices');

  // Filter states
  const [quoteFilter, setQuoteFilter] = useState<QuoteFilter>('all');
  const [invoiceFilter, setInvoiceFilter] = useState<InvoiceFilter>('all');

  // Customer dialog state
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [editCustomerOpen, setEditCustomerOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const [customerDialogMode, setCustomerDialogMode] = useState<'create' | 'view' | 'edit'>('create');

  // Customer list modal state
  const [customerListModalOpen, setCustomerListModalOpen] = useState(false);

  // Invoice dialog state
  const [addInvoiceOpen, setAddInvoiceOpen] = useState(false);
  const [editInvoiceOpen, setEditInvoiceOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | undefined>(undefined);
  const [invoiceDialogMode, setInvoiceDialogMode] = useState<'create' | 'view' | 'edit'>('create');

  // Invoice list modal state
  const [invoiceListModalOpen, setInvoiceListModalOpen] = useState(false);

  // Data state
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingInvoices: 0,
    activeCustomers: 0,
    outstanding: 0,
    grossProfit: 0,
    profitMargin: 0
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchCustomers(), fetchQuotes(), fetchInvoices()]);
    setLoading(false);
  };

  const fetchCustomers = async () => {
    try {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;

      // Fetch quotes and invoices to calculate earnings
      const { data: quotesData } = await supabase
        .from('quotes')
        .select('client_id, status, total')
        .eq('user_id', user?.id);

      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('client_id, status, total')
        .eq('user_id', user?.id);

      // Calculate stats per customer
      const customerStats: Record<string, { totalEarnings: number; activeQuotes: number }> = {};

      (quotesData || []).forEach((q: any) => {
        if (q.client_id) {
          if (!customerStats[q.client_id]) {
            customerStats[q.client_id] = { totalEarnings: 0, activeQuotes: 0 };
          }
          if (q.status === 'approved') {
            customerStats[q.client_id].totalEarnings += q.total || 0;
          }
          if (q.status === 'draft' || q.status === 'sent') {
            customerStats[q.client_id].activeQuotes += 1;
          }
        }
      });

      // Add paid invoice earnings
      (invoicesData || []).forEach((inv: any) => {
        if (inv.client_id) {
          if (!customerStats[inv.client_id]) {
            customerStats[inv.client_id] = { totalEarnings: 0, activeQuotes: 0 };
          }
          if (inv.status === 'paid') {
            customerStats[inv.client_id].totalEarnings += inv.total || 0;
          }
        }
      });

      const formatted: CustomerRow[] = (customersData || []).map((c: any) => ({
        id: c.id,
        name: c.company_name || c.full_name,
        contact: c.contact_person,
        email: c.email,
        phone: c.phone,
        status: c.is_active ? 'active' : 'inactive',
        balance: c.outstanding_balance || 0,
        totalEarnings: customerStats[c.id]?.totalEarnings || 0,
        hasActiveQuotes: (customerStats[c.id]?.activeQuotes || 0) > 0,
      }));

      setCustomers(formatted);

      const outstanding = formatted.reduce((sum, c) => sum + (c.balance || 0), 0);
      const active = formatted.filter(c => c.status === 'active').length;

      setStats(prev => ({
        ...prev,
        activeCustomers: active,
        outstanding
      }));
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchQuotes = async () => {
    try {
      // Fetch quotes first
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (quotesError) throw quotesError;

      // Fetch customer names separately to avoid FK cache issues
      const clientIds = (quotesData || [])
        .map((q: any) => q.client_id)
        .filter((id: string | null): id is string => id !== null);

      let customerMap: Record<string, { full_name: string; company_name: string | null }> = {};
      if (clientIds.length > 0) {
        const { data: customersData } = await supabase
          .from('customers')
          .select('id, full_name, company_name')
          .in('id', clientIds);

        customerMap = (customersData || []).reduce((acc: any, c: any) => {
          acc[c.id] = { full_name: c.full_name, company_name: c.company_name };
          return acc;
        }, {});
      }

      const formatted: QuoteRow[] = (quotesData || []).map((q: any) => {
        const customer = q.client_id ? customerMap[q.client_id] : null;
        return {
          id: q.id,
          quote_number: q.quote_number,
          client: customer?.company_name || customer?.full_name || 'No client',
          client_id: q.client_id,
          title: q.title || '-',
          status: q.status,
          total: q.total,
          issue_date: new Date(q.issue_date).toLocaleDateString()
        };
      });

      setQuotes(formatted);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message :
        (typeof error === 'object' && error !== null && 'message' in error) ? String((error as { message: unknown }).message) :
        'Unknown error';
      console.error('Error fetching quotes:', errorMessage, error);
    }
  };

  const fetchInvoices = async () => {
    try {
      // Fetch invoices first
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      // Fetch customer names separately to avoid FK cache issues
      const clientIds = (invoicesData || [])
        .map((inv: any) => inv.client_id)
        .filter((id: string | null): id is string => id !== null);

      let customerMap: Record<string, { full_name: string; company_name: string | null }> = {};
      if (clientIds.length > 0) {
        const { data: customersData } = await supabase
          .from('customers')
          .select('id, full_name, company_name')
          .in('id', clientIds);

        customerMap = (customersData || []).reduce((acc: any, c: any) => {
          acc[c.id] = { full_name: c.full_name, company_name: c.company_name };
          return acc;
        }, {});
      }

      const formatted: InvoiceRow[] = (invoicesData || []).map((inv: any) => {
        const customer = inv.client_id ? customerMap[inv.client_id] : null;
        return {
          id: inv.id,
          invoice_number: inv.invoice_number,
          client_name: customer?.company_name || customer?.full_name || 'No customer',
          client_id: inv.client_id,
          title: inv.title || '-',
          status: inv.status,
          total: inv.total,
          issue_date: inv.issue_date,
          due_date: inv.due_date,
        };
      });

      setInvoices(formatted);

      // Calculate stats
      const pending = formatted.filter(inv => inv.status === 'sent' || inv.status === 'overdue').length;
      const paidInvoices = (invoicesData || []).filter((inv: any) => inv.status === 'paid');
      const revenue = paidInvoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);

      // Calculate gross profit from paid invoices
      let totalCogs = 0;
      if (paidInvoices.length > 0) {
        const paidInvoiceIds = paidInvoices.map((inv: any) => inv.id);

        // Fetch invoice items for paid invoices with their inventory cost prices
        const { data: invoiceItemsData } = await supabase
          .from('invoice_items')
          .select(`
            quantity,
            unit_price,
            amount,
            inventory_item_id
          `)
          .in('invoice_id', paidInvoiceIds);

        if (invoiceItemsData && invoiceItemsData.length > 0) {
          // Get unique inventory item IDs
          const inventoryItemIds = (invoiceItemsData as any[])
            .map((item: any) => item.inventory_item_id)
            .filter((id: string | null): id is string => id !== null);

          // Fetch cost prices for inventory items
          let costPriceMap: Record<string, number> = {};
          if (inventoryItemIds.length > 0) {
            const { data: inventoryData } = await supabase
              .from('inventory_items')
              .select('id, cost_price')
              .in('id', inventoryItemIds);

            costPriceMap = (inventoryData || []).reduce((acc: Record<string, number>, item: any) => {
              acc[item.id] = item.cost_price || 0;
              return acc;
            }, {});
          }

          // Calculate COGS
          totalCogs = (invoiceItemsData as any[]).reduce((sum: number, item: any) => {
            const costPrice = item.inventory_item_id ? (costPriceMap[item.inventory_item_id] || 0) : 0;
            return sum + (costPrice * item.quantity);
          }, 0);
        }
      }

      const grossProfit = revenue - totalCogs;
      const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

      setStats(prev => ({
        ...prev,
        pendingInvoices: pending,
        totalRevenue: revenue,
        grossProfit,
        profitMargin
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message :
        (typeof error === 'object' && error !== null && 'message' in error) ? String((error as { message: unknown }).message) :
        'Unknown error';
      console.error('Error fetching invoices:', errorMessage, error);
    }
  };

  // Filter data
  const filteredQuotes = useMemo(() => {
    if (quoteFilter === 'all') return quotes;
    return quotes.filter(q => q.status === quoteFilter);
  }, [quotes, quoteFilter]);

  const filteredInvoices = useMemo(() => {
    if (invoiceFilter === 'all') return invoices;
    return invoices.filter(inv => inv.status === invoiceFilter);
  }, [invoices, invoiceFilter]);

  // Customer handlers
  const handleCustomerAdded = () => {
    fetchCustomers();
  };

  const handleViewCustomer = (row: CustomerRow) => {
    setSelectedCustomerId(row.id);
    setCustomerDialogMode('view');
    setEditCustomerOpen(true);
  };

  const handleEditCustomer = (row: CustomerRow) => {
    setSelectedCustomerId(row.id);
    setCustomerDialogMode('edit');
    setEditCustomerOpen(true);
  };

  const handleDeleteCustomer = async (row: CustomerRow) => {
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

  const handleAddCustomerFromModal = () => {
    setCustomerListModalOpen(false);
    setAddCustomerOpen(true);
  };

  // Invoice handlers
  const handleInvoiceAdded = () => {
    fetchInvoices();
    fetchCustomers(); // Refresh customer earnings
  };

  const handleViewInvoice = (row: InvoiceRow) => {
    setSelectedInvoiceId(row.id);
    setInvoiceDialogMode('view');
    setEditInvoiceOpen(true);
  };

  const handleEditInvoice = (row: InvoiceRow) => {
    setSelectedInvoiceId(row.id);
    setInvoiceDialogMode('edit');
    setEditInvoiceOpen(true);
  };

  const handleDeleteInvoice = async (row: InvoiceRow) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      // If invoice was sent or paid, restore stock before deleting
      if ((row.status === 'sent' || row.status === 'paid') && user?.id) {
        const result = await restoreStockForInvoice(row.id, user.id);
        if (!result.success) {
          console.error('Stock restoration failed:', result.error);
          // Continue with deletion even if stock restoration fails
        }
      }

      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', row.id)
        .eq('user_id', user?.id);

      if (error) throw error;
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Failed to delete invoice');
    }
  };

  const handleAddInvoiceFromModal = () => {
    setInvoiceListModalOpen(false);
    setAddInvoiceOpen(true);
  };

  const quoteColumns = [
    { key: 'quote_number', label: 'Quote #' },
    { key: 'client', label: 'Client' },
    { key: 'title', label: 'Title' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors: Record<string, string> = {
          draft: 'bg-slate-500/20 text-slate-400',
          sent: 'bg-blue-500/20 text-blue-400',
          approved: 'bg-emerald-500/20 text-emerald-400',
          rejected: 'bg-rose-500/20 text-rose-400',
          expired: 'bg-amber-500/20 text-amber-400'
        };
        return (
          <Badge className={statusColors[value] || statusColors.draft}>
            {value}
          </Badge>
        );
      },
    },
    {
      key: 'total',
      label: 'Total',
      render: (value: number) => formatCurrency(value || 0, displayCurrency)
    },
    { key: 'issue_date', label: 'Date' },
  ];

  const invoiceColumns = [
    { key: 'invoice_number', label: 'Invoice #' },
    { key: 'client_name', label: 'Customer' },
    { key: 'title', label: 'Title' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors: Record<string, string> = {
          draft: 'bg-slate-500/20 text-slate-400',
          sent: 'bg-blue-500/20 text-blue-400',
          paid: 'bg-emerald-500/20 text-emerald-400',
          overdue: 'bg-rose-500/20 text-rose-400',
          cancelled: 'bg-slate-600/20 text-slate-500'
        };
        return (
          <Badge className={statusColors[value] || statusColors.draft}>
            {value}
          </Badge>
        );
      },
    },
    {
      key: 'total',
      label: 'Total',
      render: (value: number) => formatCurrency(value || 0, displayCurrency)
    },
    {
      key: 'issue_date',
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-100">Sales</h1>
          <p className="text-slate-400 mt-1">Manage invoices, quotes and customers</p>
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
          <Button
            onClick={() => setAddInvoiceOpen(true)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <AddCustomerDialog
        open={addCustomerOpen}
        onOpenChange={setAddCustomerOpen}
        onSuccess={handleCustomerAdded}
      />
      <AddCustomerDialog
        open={editCustomerOpen}
        onOpenChange={setEditCustomerOpen}
        onSuccess={handleCustomerAdded}
        customerId={selectedCustomerId}
        mode={customerDialogMode}
      />
      <CustomerListModal
        open={customerListModalOpen}
        onOpenChange={setCustomerListModalOpen}
        customers={customers}
        currency={displayCurrency}
        onView={handleViewCustomer}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
        onAddCustomer={handleAddCustomerFromModal}
      />
      <AddInvoiceDialog
        open={addInvoiceOpen}
        onOpenChange={setAddInvoiceOpen}
        onSuccess={handleInvoiceAdded}
      />
      <AddInvoiceDialog
        open={editInvoiceOpen}
        onOpenChange={setEditInvoiceOpen}
        onSuccess={handleInvoiceAdded}
        invoiceId={selectedInvoiceId}
        mode={invoiceDialogMode}
      />
      <InvoiceListModal
        open={invoiceListModalOpen}
        onOpenChange={setInvoiceListModalOpen}
        invoices={invoices}
        currency={displayCurrency}
        onView={handleViewInvoice}
        onEdit={handleEditInvoice}
        onDelete={handleDeleteInvoice}
        onAddInvoice={handleAddInvoiceFromModal}
      />

      {/* Stats Cards - Redesigned */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800/50 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent" />

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-5 divide-x divide-slate-700/50">
          {/* Total Revenue */}
          <div className="group p-6 hover:bg-slate-800/30 transition-all duration-300 cursor-default">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue</span>
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-semibold text-slate-100 tracking-tight">
                  {formatCurrency(stats.totalRevenue, displayCurrency)}
                </h3>
                <p className="text-xs text-emerald-400/80 mt-1">From paid invoices</p>
              </div>
            </div>
          </div>

          {/* Gross Profit */}
          <div className="group p-6 hover:bg-slate-800/30 transition-all duration-300 cursor-default">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-teal-500/20 to-teal-600/10 rounded-xl border border-teal-500/20 group-hover:border-teal-500/40 transition-colors">
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Profit</span>
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-semibold text-slate-100 tracking-tight">
                  {formatCurrency(stats.grossProfit, displayCurrency)}
                </h3>
                <p className="text-xs text-teal-400/80 mt-1">{stats.profitMargin.toFixed(1)}% margin</p>
              </div>
            </div>
          </div>

          {/* Pending Invoices */}
          <div className="group p-6 hover:bg-slate-800/30 transition-all duration-300 cursor-default">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl border border-amber-500/20 group-hover:border-amber-500/40 transition-colors">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending</span>
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-semibold text-slate-100 tracking-tight">
                  {stats.pendingInvoices}
                  <span className="text-lg text-slate-500 font-normal ml-1">invoices</span>
                </h3>
                <p className="text-xs text-amber-400/80 mt-1">Awaiting payment</p>
              </div>
            </div>
          </div>

          {/* Active Customers */}
          <div className="group p-6 hover:bg-slate-800/30 transition-all duration-300 cursor-default">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl border border-cyan-500/20 group-hover:border-cyan-500/40 transition-colors">
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Customers</span>
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-semibold text-slate-100 tracking-tight">
                  {stats.activeCustomers}
                  <span className="text-lg text-slate-500 font-normal ml-1">active</span>
                </h3>
                <p className="text-xs text-cyan-400/80 mt-1">In your network</p>
              </div>
            </div>
          </div>

          {/* Outstanding */}
          <div className="group p-6 hover:bg-slate-800/30 transition-all duration-300 cursor-default">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-rose-500/20 to-rose-600/10 rounded-xl border border-rose-500/20 group-hover:border-rose-500/40 transition-colors">
                  <FileText className="w-4 h-4 text-rose-400" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Outstanding</span>
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-semibold text-slate-100 tracking-tight">
                  {formatCurrency(stats.outstanding, displayCurrency)}
                </h3>
                <p className="text-xs text-rose-400/80 mt-1">Total owed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      </div>

      {/* Two-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Pane - Invoices/Quotes with Tabs */}
        <div className="lg:col-span-2 p-6 bg-slate-900 border border-cyan-500/20 rounded-2xl">
          <Tabs value={leftPaneTab} onValueChange={(v) => setLeftPaneTab(v as LeftPaneTab)} className="w-full">
            <div className="flex items-center justify-between">
              <TabsList className="bg-slate-800 border border-cyan-500/20">
                <TabsTrigger
                  value="invoices"
                  className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Invoices
                </TabsTrigger>
                <TabsTrigger
                  value="quotes"
                  className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Quotes
                </TabsTrigger>
              </TabsList>

              {leftPaneTab === 'invoices' ? (
                <Select value={invoiceFilter} onValueChange={(v) => setInvoiceFilter(v as InvoiceFilter)}>
                  <SelectTrigger className="w-[140px] bg-slate-800 border-cyan-500/20 text-slate-100 h-9 text-sm">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="all">All Invoices</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Select value={quoteFilter} onValueChange={(v) => setQuoteFilter(v as QuoteFilter)}>
                  <SelectTrigger className="w-[140px] bg-slate-800 border-cyan-500/20 text-slate-100 h-9 text-sm">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="all">All Quotes</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <TabsContent value="invoices" className="mt-4">
              <DataTable
                columns={invoiceColumns}
                data={filteredInvoices}
                searchPlaceholder="Search invoices..."
                onView={handleViewInvoice}
                onEdit={handleEditInvoice}
                onDelete={handleDeleteInvoice}
              />
            </TabsContent>

            <TabsContent value="quotes" className="mt-4">
              <DataTable
                columns={quoteColumns}
                data={filteredQuotes}
                searchPlaceholder="Search quotes..."
                onView={(row) => window.location.href = `/quotes/${row.id}`}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Pane - Customers Preview */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-slate-100">Customers</h2>
            <button
              onClick={() => setCustomerListModalOpen(true)}
              className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {customers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500">No customers yet</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddCustomerOpen(true)}
                  className="mt-2 text-slate-400 hover:text-slate-200"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Customer
                </Button>
              </div>
            ) : (
              customers.slice(0, 10).map((customer) => (
                <CustomerPreviewCard
                  key={customer.id}
                  customer={customer}
                  currency={displayCurrency}
                  onClick={() => handleViewCustomer(customer)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
