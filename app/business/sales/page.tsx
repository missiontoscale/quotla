'use client'

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Users, DollarSign, Clock, RefreshCw, ChevronRight, Receipt, Upload, TrendingUp, Target } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import {
  getYoYDateRange,
  buildPartialYoYChartData,
  calculateYoYComparison,
  analyzeTrend,
} from '@/lib/analytics';
import type { YoYMonthlyDataPoint, TrendAnalysisResult } from '@/lib/analytics';
import { TrendIndicator, InlineTrend, AVITPFMetric, LargeAVITPFMetric, CompactAVITPFMetric } from '@/components/analytics';
import { DateFilterProvider } from '@/contexts/DateFilterContext';
import { useDateFilter } from '@/hooks/useDateFilter';
import { PageDateFilter } from '@/components/filters';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/hooks/use-dashboard-theme';
import { restoreStockForInvoice } from '@/lib/inventory/stock-operations';
import { AddCustomerDialog } from '@/components/customers/AddCustomerDialog';
import { CustomerPreviewCard } from '@/components/customers/CustomerPreviewCard';
import { CustomerListModal } from '@/components/customers/CustomerListModal';
import { AddInvoiceDialog } from '@/components/invoices/AddInvoiceDialog';
import { InvoiceListModal } from '@/components/invoices/InvoiceListModal';
import { BankImportModal } from '@/components/bank-import/BankImportModal';
import { DataTableSkeleton } from '@/components/dashboard/DataTableSkeleton';
import { MetricsCardSkeleton, SmallMetricCardSkeleton } from '@/components/dashboard/MetricsCardSkeleton';
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

type InvoiceFilter = 'all' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export default function SalesPage() {
  return (
    <DateFilterProvider>
      <SalesContent />
    </DateFilterProvider>
  )
}

function SalesContent() {
  const { user } = useAuth();
  const { displayCurrency, setDisplayCurrency, isConverted } = useDisplayCurrency();
  const { dateRange, isFilterActive, filterArrayByDate, formattedDateRange } = useDateFilter();

  // Filter states
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

  // Bank import modal state
  const [bankImportModalOpen, setBankImportModalOpen] = useState(false);

  // Data state
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [rawInvoicesData, setRawInvoicesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingInvoices: 0,
    activeCustomers: 0,
    outstanding: 0,
    grossProfit: 0,
    profitMargin: 0,
    yoyRevenueGrowth: null as number | null,
    yoyProfitGrowth: null as number | null,
    salesCount: 0,
    lastMonthSalesCount: 0,
    salesCountChange: 0,
    thisMonthCustomerCount: 0,
    lastMonthCustomerCount: 0,
    customerCountChange: 0
  });

  // Monthly sales data for trend chart
  const [monthlySalesData, setMonthlySalesData] = useState<{month: string, revenue: number, profit: number}[]>([]);

  // YoY data
  const [yoyChartData, setYoyChartData] = useState<YoYMonthlyDataPoint[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<TrendAnalysisResult | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, dateRange]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch invoices first, then use that data for customer earnings calculation
    const invoicesData = await fetchInvoices();
    await fetchCustomers(invoicesData);
    setLoading(false);
  };

  const fetchCustomers = async (invoicesDataParam?: any[]) => {
    try {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;

      // Use passed invoice data or fallback to stored data (eliminates duplicate query)
      const invoicesData = invoicesDataParam || rawInvoicesData;

      // Calculate stats per customer
      const customerStats: Record<string, { totalEarnings: number }> = {};

      // Add paid invoice earnings
      (invoicesData || []).forEach((inv: any) => {
        if (inv.client_id) {
          if (!customerStats[inv.client_id]) {
            customerStats[inv.client_id] = { totalEarnings: 0 };
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

  const fetchInvoices = async (): Promise<any[]> => {
    try {
      // Fetch invoices once - this data is reused for customer earnings calculation
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      // Store raw data for reuse (eliminates duplicate query in fetchCustomers)
      setRawInvoicesData(invoicesData || []);

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

      // Apply date filter to invoices if active
      const filteredInvoicesData = isFilterActive
        ? filterArrayByDate(invoicesData || [], (inv: any) => inv.issue_date)
        : invoicesData || [];

      const formatted: InvoiceRow[] = filteredInvoicesData.map((inv: any) => {
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

      // Calculate stats (use filtered data)
      const pending = formatted.filter(inv => inv.status === 'sent' || inv.status === 'overdue').length;
      const paidInvoices = filteredInvoicesData.filter((inv: any) => inv.status === 'paid');
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

      // Month-over-month calculations
      const thisMonthStart = startOfMonth(new Date());
      const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
      const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

      const thisMonthPaid = paidInvoices.filter((inv: any) =>
        new Date(inv.issue_date) >= thisMonthStart
      );
      const thisMonthRevenue = thisMonthPaid.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
      const thisMonthSalesCount = thisMonthPaid.length;

      // Calculate this month's COGS
      let thisMonthCogs = 0;
      if (thisMonthPaid.length > 0) {
        const thisMonthIds = thisMonthPaid.map((inv: any) => inv.id);
        const { data: thisMonthItems } = await supabase
          .from('invoice_items')
          .select('quantity, inventory_item_id')
          .in('invoice_id', thisMonthIds);

        if (thisMonthItems && thisMonthItems.length > 0) {
          const inventoryIds = (thisMonthItems as any[])
            .map((item: any) => item.inventory_item_id)
            .filter((id: string | null): id is string => id !== null);

          if (inventoryIds.length > 0) {
            const { data: costs } = await supabase
              .from('inventory_items')
              .select('id, cost_price')
              .in('id', inventoryIds);

            const costMap = (costs || []).reduce((acc: Record<string, number>, item: any) => {
              acc[item.id] = item.cost_price || 0;
              return acc;
            }, {});

            thisMonthCogs = (thisMonthItems as any[]).reduce((sum: number, item: any) => {
              const costPrice = item.inventory_item_id ? (costMap[item.inventory_item_id] || 0) : 0;
              return sum + (costPrice * item.quantity);
            }, 0);
          }
        }
      }

      const thisMonthProfit = thisMonthRevenue - thisMonthCogs;

      const lastMonthPaid = paidInvoices.filter((inv: any) => {
        const date = new Date(inv.issue_date);
        return date >= lastMonthStart && date <= lastMonthEnd;
      });
      const lastMonthRevenue = lastMonthPaid.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
      const lastMonthSalesCount = lastMonthPaid.length;
      const salesCountChange = thisMonthSalesCount - lastMonthSalesCount;

      // Calculate last month's COGS
      let lastMonthCogs = 0;
      if (lastMonthPaid.length > 0) {
        const lastMonthIds = lastMonthPaid.map((inv: any) => inv.id);
        const { data: lastMonthItems } = await supabase
          .from('invoice_items')
          .select('quantity, inventory_item_id')
          .in('invoice_id', lastMonthIds);

        if (lastMonthItems && lastMonthItems.length > 0) {
          const inventoryIds = (lastMonthItems as any[])
            .map((item: any) => item.inventory_item_id)
            .filter((id: string | null): id is string => id !== null);

          if (inventoryIds.length > 0) {
            const { data: costs } = await supabase
              .from('inventory_items')
              .select('id, cost_price')
              .in('id', inventoryIds);

            const costMap = (costs || []).reduce((acc: Record<string, number>, item: any) => {
              acc[item.id] = item.cost_price || 0;
              return acc;
            }, {});

            lastMonthCogs = (lastMonthItems as any[]).reduce((sum: number, item: any) => {
              const costPrice = item.inventory_item_id ? (costMap[item.inventory_item_id] || 0) : 0;
              return sum + (costPrice * item.quantity);
            }, 0);
          }
        }
      }

      const lastMonthProfit = lastMonthRevenue - lastMonthCogs;

      // Growth percentages
      const revenueGrowth = lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : thisMonthRevenue > 0 ? 100 : 0;
      const profitGrowth = lastMonthProfit > 0
        ? ((thisMonthProfit - lastMonthProfit) / lastMonthProfit) * 100
        : thisMonthProfit > 0 ? 100 : 0;

      // Average invoice value
      const avgInvoiceValue = thisMonthPaid.length > 0
        ? thisMonthRevenue / thisMonthPaid.length
        : 0;
      const lastAvgInvoiceValue = lastMonthPaid.length > 0
        ? lastMonthRevenue / lastMonthPaid.length
        : 0;
      const avgInvoiceGrowth = lastAvgInvoiceValue > 0
        ? ((avgInvoiceValue - lastAvgInvoiceValue) / lastAvgInvoiceValue) * 100
        : avgInvoiceValue > 0 ? 100 : 0;

      // Days Sales Outstanding (DSO)
      const avgReceivable = (stats.outstanding || 0);
      const dailySales = revenue / 365;
      const dso = dailySales > 0 ? avgReceivable / dailySales : 0;

      // Conversion rate
      const totalInvoiceCount = formatted.length;
      const paidCount = paidInvoices.length;
      const conversionRate = totalInvoiceCount > 0 ? (paidCount / totalInvoiceCount) * 100 : 0;

      // Build 6-month trend data
      const sixMonthsAgo = subMonths(new Date(), 5);
      const months = eachMonthOfInterval({
        start: startOfMonth(sixMonthsAgo),
        end: new Date()
      });

      const monthlyTrend = await Promise.all(months.map(async (month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        const monthInvoices = paidInvoices.filter((inv: any) => {
          const date = new Date(inv.issue_date);
          return date >= monthStart && date <= monthEnd;
        });

        const monthRevenue = monthInvoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);

        // Calculate month's COGS
        let monthCogs = 0;
        if (monthInvoices.length > 0) {
          const monthIds = monthInvoices.map((inv: any) => inv.id);
          const { data: monthItems } = await supabase
            .from('invoice_items')
            .select('quantity, inventory_item_id')
            .in('invoice_id', monthIds);

          if (monthItems && monthItems.length > 0) {
            const inventoryIds = (monthItems as any[])
              .map((item: any) => item.inventory_item_id)
              .filter((id: string | null): id is string => id !== null);

            if (inventoryIds.length > 0) {
              const { data: costs } = await supabase
                .from('inventory_items')
                .select('id, cost_price')
                .in('id', inventoryIds);

              const costMap = (costs || []).reduce((acc: Record<string, number>, item: any) => {
                acc[item.id] = item.cost_price || 0;
                return acc;
              }, {});

              monthCogs = (monthItems as any[]).reduce((sum: number, item: any) => {
                const costPrice = item.inventory_item_id ? (costMap[item.inventory_item_id] || 0) : 0;
                return sum + (costPrice * item.quantity);
              }, 0);
            }
          }
        }

        return {
          month: format(month, 'MMM'),
          revenue: monthRevenue,
          profit: monthRevenue - monthCogs
        };
      }));

      setMonthlySalesData(monthlyTrend);

      // YoY calculations
      const yoyRange = getYoYDateRange(dateRange);
      const { data: lastYearInvoices } = await supabase
        .from('invoices')
        .select('id, total, status, issue_date')
        .eq('user_id', user?.id)
        .eq('status', 'paid')
        .gte('issue_date', format(yoyRange.previous.start, 'yyyy-MM-dd'))
        .lte('issue_date', format(yoyRange.previous.end, 'yyyy-MM-dd'));

      const lastYearRevenue = (lastYearInvoices || []).reduce(
        (sum, inv) => sum + (inv.total || 0), 0
      );
      const yoyRevenueComparison = calculateYoYComparison(revenue, lastYearRevenue);

      // Build YoY chart data
      const allInvoicesForYoY = [...paidInvoices, ...(lastYearInvoices || [])];
      const yoyData = buildPartialYoYChartData(
        allInvoicesForYoY,
        {
          dateAccessor: (inv: any) => inv.issue_date,
          valueAccessor: (inv: any) => inv.total || 0,
          aggregation: 'sum'
        }
      );
      setYoyChartData(yoyData);

      // Analyze revenue trend
      const revenueValues = monthlyTrend.map(m => m.revenue);
      const trendResult = analyzeTrend(revenueValues);
      setRevenueTrend(trendResult);

      // Calculate YoY profit (simplified)
      const lastYearProfit = lastYearRevenue > 0 && revenue > 0
        ? lastYearRevenue * (grossProfit / revenue)
        : 0;
      const yoyProfitComparison = calculateYoYComparison(grossProfit, lastYearProfit);

      setStats(prev => ({
        ...prev,
        pendingInvoices: pending,
        totalRevenue: revenue,
        grossProfit,
        profitMargin,
        thisMonthRevenue,
        lastMonthRevenue,
        revenueGrowth,
        thisMonthProfit,
        lastMonthProfit,
        profitGrowth,
        avgInvoiceValue,
        avgInvoiceGrowth,
        dso,
        conversionRate,
        yoyRevenueGrowth: yoyRevenueComparison.percentageChange,
        yoyProfitGrowth: yoyProfitComparison.percentageChange,
        salesCount: thisMonthSalesCount,
        lastMonthSalesCount,
        salesCountChange
      } as any));

      return invoicesData || [];
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message :
        (typeof error === 'object' && error !== null && 'message' in error) ? String((error as { message: unknown }).message) :
        'Unknown error';
      console.error('Error fetching invoices:', errorMessage, error);
      return [];
    }
  };

  // Filter data
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

  const invoiceColumns = [
    { key: 'invoice_number', label: 'Invoice #' },
    { key: 'client_name', label: 'Customer' },
    { key: 'title', label: 'Title' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors: Record<string, string> = {
          draft: 'bg-primary-600/20 text-primary-400',
          sent: 'bg-blue-500/20 text-blue-400',
          paid: 'bg-quotla-green/20 text-emerald-400',
          overdue: 'bg-rose-500/20 text-rose-400',
          cancelled: 'bg-primary-700/20 text-primary-400'
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
          <h1 className="text-3xl text-primary-50">Sales</h1>
          <p className="text-primary-400 mt-1">
            {isFilterActive ? formattedDateRange : 'Manage invoices and customers'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PageDateFilter />
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
          <Button
            variant="outline"
            onClick={() => setBankImportModalOpen(true)}
            className="border-quotla-green text-quotla-green hover:bg-quotla-green/10"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Statement
          </Button>
          <Button
            onClick={() => setAddInvoiceOpen(true)}
            className="bg-quotla-orange hover:bg-secondary-400 text-white"
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
      <BankImportModal
        open={bankImportModalOpen}
        onOpenChange={setBankImportModalOpen}
        onSuccess={fetchInvoices}
      />

      {/* Enhanced Sales Metrics - Row 1: Sales Performance Overview */}
      {loading ? (
        <div className="mb-4">
          <MetricsCardSkeleton />
        </div>
      ) : (
      <div className="mb-4">
        <Card className={cn(
          'p-6 border shadow-lg',
          'bg-gradient-to-br from-quotla-dark/95 to-primary-800/50',
          'border-quotla-green/20 hover:border-quotla-green/40 transition-all duration-300',
          'shadow-quotla-dark/50'
        )}>
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-primary-400">Sales Performance</p>
            </div>
          </div>

          {/* AVITPF Metric Layout - First Row: Revenue (large) + Profit/Margin (stacked) */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Revenue - Large */}
            <div className={cn(
              'flex-1 p-4 rounded-xl border backdrop-blur-sm transition-all duration-200',
              'bg-primary-700/30 border-quotla-green/20 hover:border-quotla-green/40'
            )}>
              <LargeAVITPFMetric
                label="Revenue"
                value={(stats as any).thisMonthRevenue || 0}
                change={(stats as any).revenueGrowth || null}
                currency={displayCurrency}
                colorScheme="green"
              />
              {stats.yoyRevenueGrowth !== null && (
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-[10px] text-primary-500">YoY:</span>
                  <InlineTrend value={stats.yoyRevenueGrowth} />
                </div>
              )}
            </div>

            {/* Profit + Margin - Stacked */}
            <div className="flex flex-col gap-3">
              <div className={cn(
                'p-3 rounded-xl border backdrop-blur-sm transition-all duration-200',
                'bg-primary-700/30 border-emerald-500/20 hover:border-emerald-500/40'
              )}>
                <CompactAVITPFMetric
                  label="Gross Profit"
                  value={(stats as any).thisMonthProfit || 0}
                  change={(stats as any).profitGrowth || null}
                  currency={displayCurrency}
                  colorScheme="emerald"
                />
              </div>
              <div className={cn(
                'p-3 rounded-xl border backdrop-blur-sm transition-all duration-200',
                'bg-primary-700/30 border-teal-500/20 hover:border-teal-500/40'
              )}>
                <CompactAVITPFMetric
                  label="Margin"
                  value={stats.profitMargin}
                  change={null}
                  isInteger
                  colorScheme="teal"
                  className="[&>div>span:first-child]:after:content-['%']"
                />
              </div>
            </div>
          </div>

          {/* Second Row: Sales Count (large) + Avg Invoice/Customers (stacked) */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Sales Count - Large */}
            <div className={cn(
              'flex-1 p-4 rounded-xl border backdrop-blur-sm transition-all duration-200',
              'bg-primary-700/30 border-quotla-orange/20 hover:border-quotla-orange/40'
            )}>
              <LargeAVITPFMetric
                label="Sales"
                value={(stats as any).salesCount || 0}
                change={(stats as any).salesCountChange || null}
                isInteger
                colorScheme="orange"
              />
            </div>

            {/* Avg Invoice + Customers - Stacked */}
            <div className="flex flex-col gap-3">
              <div className={cn(
                'p-3 rounded-xl border backdrop-blur-sm transition-all duration-200',
                'bg-primary-700/30 border-quotla-orange/20 hover:border-quotla-orange/40'
              )}>
                <CompactAVITPFMetric
                  label="Avg Invoice"
                  value={(stats as any).avgInvoiceValue || 0}
                  change={(stats as any).avgInvoiceGrowth || null}
                  currency={displayCurrency}
                  colorScheme="orange"
                />
              </div>
              <div className={cn(
                'p-3 rounded-xl border backdrop-blur-sm transition-all duration-200',
                'bg-primary-700/30 border-teal-500/20 hover:border-teal-500/40'
              )}>
                <CompactAVITPFMetric
                  label="Customers"
                  value={stats.activeCustomers}
                  change={null}
                  isInteger
                  colorScheme="teal"
                />
              </div>
            </div>
          </div>

          {/* 6-Month Trend Chart */}
          <div className="h-[200px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlySalesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#445642" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#445642" stopOpacity={0.05}/>
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
                    border: '1px solid #445642',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fffad6'
                  }}
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      revenue: 'Revenue',
                      profit: 'Profit'
                    };
                    return [formatCurrency(value, displayCurrency), labels[name] || name];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#445642"
                  strokeWidth={2}
                  fill="url(#salesRevenueGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-quotla-green/50 rounded-full" />
              <span className="text-xs text-primary-300">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-emerald-500" style={{ width: '16px' }} />
              <span className="text-xs text-primary-300">Profit</span>
            </div>
          </div>
        </Card>

      </div>
      )}

      {/* Row 2: Operational Metrics */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <SmallMetricCardSkeleton />
          <SmallMetricCardSkeleton />
          <SmallMetricCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Pending Invoices Card */}
          <Card className="bg-quotla-dark/90 border-primary-600 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-quotla-orange/10 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-quotla-orange" />
              </div>
              <div>
                <p className="text-xs text-primary-400 uppercase tracking-wider">Pending Invoices</p>
                <p className="text-2xl font-bold text-primary-50">{stats.pendingInvoices}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-primary-600">
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary-400">Outstanding Amount</span>
                <span className="text-sm font-semibold text-rose-400">
                  {formatCurrency(stats.outstanding, displayCurrency)}
                </span>
              </div>
            </div>
          </Card>

          {/* Days Sales Outstanding (DSO) Card */}
          <Card className="bg-quotla-dark/90 border-primary-600 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-primary-400 uppercase tracking-wider">Days Sales Outstanding</p>
                <p className="text-2xl font-bold text-primary-50">{((stats as any).dso || 0).toFixed(0)} days</p>
              </div>
            </div>
            <div className="pt-3 border-t border-primary-600">
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary-400">Industry Benchmark</span>
                <span className="text-sm font-medium text-primary-200">30-45 days</span>
              </div>
            </div>
          </Card>

          {/* Conversion Rate Card */}
          <Card className="bg-quotla-dark/90 border-primary-600 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-primary-400 uppercase tracking-wider">Conversion Rate</p>
                <p className="text-2xl font-bold text-primary-50">{((stats as any).conversionRate || 0).toFixed(1)}%</p>
              </div>
            </div>
            <div className="pt-3 border-t border-primary-600">
              <div className="w-full bg-primary-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${Math.min((stats as any).conversionRate || 0, 100)}%` }}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Row 3: Customer Insights */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <SmallMetricCardSkeleton />
          <SmallMetricCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Active Customers Card */}
          <Card className="bg-quotla-dark/90 border-primary-600 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-quotla-green/15 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-quotla-green" />
              </div>
              <div>
                <p className="text-xs text-primary-400 uppercase tracking-wider">Active Customers</p>
                <p className="text-2xl font-bold text-primary-50">{stats.activeCustomers}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-primary-600">
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary-400">Total Customers</span>
                <span className="text-sm font-medium text-primary-200">{customers.length}</span>
              </div>
            </div>
          </Card>

          {/* Customer Value Card */}
          <Card className="bg-quotla-dark/90 border-primary-600 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <p className="text-xs text-primary-400 uppercase tracking-wider">Avg Customer Value</p>
                <p className="text-2xl font-bold text-primary-50">
                  {formatCurrency(stats.activeCustomers > 0 ? stats.totalRevenue / stats.activeCustomers : 0, displayCurrency)}
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-primary-600">
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary-400">Lifetime Value</span>
                <span className="text-sm font-medium text-teal-400">Per Customer</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Two-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Pane - Invoices */}
        <div className="lg:col-span-2 p-6 bg-quotla-dark/90 border border-quotla-orange/20 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-primary-50 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-quotla-orange" />
              Invoices
            </h2>
            <Select value={invoiceFilter} onValueChange={(v) => setInvoiceFilter(v as InvoiceFilter)}>
              <SelectTrigger className="w-[140px] bg-primary-700 border-quotla-orange/20 text-primary-50 h-9 text-sm">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-quotla-dark border-primary-600">
                <SelectItem value="all">All Invoices</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {loading ? (
            <DataTableSkeleton columns={6} rows={5} showSearch={true} />
          ) : (
            <DataTable
              columns={invoiceColumns}
              data={filteredInvoices}
              searchPlaceholder="Search invoices..."
              onView={handleViewInvoice}
              onEdit={handleEditInvoice}
              onDelete={handleDeleteInvoice}
            />
          )}
        </div>

        {/* Right Pane - Customers Preview */}
        <div className="p-5 bg-quotla-dark/90 border border-primary-600 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-primary-50">Customers</h2>
            <button
              onClick={() => setCustomerListModalOpen(true)}
              className="text-sm text-quotla-orange hover:text-secondary-400 flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {loading ? (
              // Customer list skeleton
              <div className="space-y-2 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-primary-700/30 rounded-lg">
                    <div className="w-10 h-10 bg-primary-600/50 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-primary-600/50 rounded mb-2" />
                      <div className="h-3 w-16 bg-primary-600/50 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-primary-400">No customers yet</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddCustomerOpen(true)}
                  className="mt-2 text-primary-400 hover:text-primary-100"
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
