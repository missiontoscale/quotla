'use client'

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  RefreshCw,
  Package,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
  AlertCircle,
  Undo,
  CheckCircle2,
  XCircle,
  Trophy
} from 'lucide-react';
import { AVITPFMetric, LargeAVITPFMetric, CompactAVITPFMetric } from '@/components/analytics';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, differenceInDays } from 'date-fns';
import { DateFilterProvider } from '@/contexts/DateFilterContext';
import { useDateFilter } from '@/hooks/useDateFilter';
import { PageDateFilter } from '@/components/filters';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { FilterSelect } from '@/components/filters';
import { AddProductDialog } from '@/components/products/AddProductDialog';
import { AdjustStockDialog } from '@/components/products/AdjustStockDialog';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDisplayCurrency } from '@/hooks/useUserCurrency';
import { formatCurrency } from '@/lib/utils/currency';
import { CURRENCIES } from '@/types';
import { StockMovement } from '@/types/inventory';
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

type ProductStatusFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
type MovementTypeFilter = 'all' | 'purchase' | 'sale' | 'adjustment' | 'return' | 'damage' | 'transfer';

export default function ProductsPage() {
  return (
    <DateFilterProvider>
      <ProductsContent />
    </DateFilterProvider>
  )
}

function ProductsContent() {
  const { user } = useAuth();
  const { displayCurrency, setDisplayCurrency, isConverted } = useDisplayCurrency();
  const { dateRange, isFilterActive, filterArrayByDate, formattedDateRange } = useDateFilter();
  const [activeTab, setActiveTab] = useState('products');

  // Filter states
  const [productStatusFilter, setProductStatusFilter] = useState<ProductStatusFilter>('all');
  const [movementTypeFilter, setMovementTypeFilter] = useState<MovementTypeFilter>('all');

  // Product dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [dialogMode, setDialogMode] = useState<'create' | 'view' | 'edit'>('create');
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    sku: string;
    stock: number;
  } | null>(null);

  // Data state
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  // Combined stats
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
    stockInToday: 0,
    stockOutToday: 0,
    adjustmentsToday: 0,
    topPerformer: null as { name: string; profit: number; unitsSold: number } | null
  });

  // Monthly stock movement trend data
  const [monthlyStockData, setMonthlyStockData] = useState<{
    month: string;
    stockIn: number;
    stockOut: number;
    inventoryValue: number;
  }[]>([]);

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchStockMovements();
      fetchTopPerformer();
    }
  }, [user, dateRange]);

  const fetchProducts = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_type', 'product')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts = (data || []).map((item: any) => ({
        id: item.id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        price: item.unit_price,
        costPrice: item.cost_price,
        stock: item.quantity_on_hand,
        status: item.quantity_on_hand <= 0 ? 'out-of-stock' :
                item.quantity_on_hand <= (item.low_stock_threshold || 10) ? 'low-stock' : 'in-stock'
      }));

      setProducts(formattedProducts);
      calculateStats(formattedProducts, data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error?.message || error?.code || String(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchStockMovements = async () => {
    if (!user?.id) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          inventory_item:inventory_items(
            id,
            name,
            sku,
            item_type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Apply date filter to stock movements if active
      const filteredMovements = isFilterActive
        ? filterArrayByDate(data || [], (m: any) => m.created_at)
        : data || [];

      const stockMovements = filteredMovements as StockMovement[];
      setMovements(stockMovements);

      // Calculate today's stats
      const today = new Date().toISOString().split('T')[0];
      const todayMovements = stockMovements.filter(m =>
        m.created_at.startsWith(today)
      );

      setStats(prev => ({
        ...prev,
        stockInToday: todayMovements
          .filter(m => ['purchase', 'return'].includes(m.movement_type))
          .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0),
        stockOutToday: todayMovements
          .filter(m => ['sale', 'damage'].includes(m.movement_type))
          .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0),
        adjustmentsToday: todayMovements
          .filter(m => ['adjustment', 'transfer'].includes(m.movement_type))
          .length
      }));
    } catch (error: any) {
      console.error('Error loading stock movements:', error?.message || error?.code || String(error));
    }
  };

  const calculateStats = (formattedProducts: any[], rawData: any[]) => {
    const totalValue = rawData.reduce((sum, item) =>
      sum + ((item.quantity_on_hand || 0) * (item.cost_price || 0)), 0
    );

    // NEW: Calculate inventory turnover rate
    // Get sales from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = movements.filter(m =>
      m.movement_type === 'sale' &&
      new Date(m.created_at) >= thirtyDaysAgo
    );

    const costOfGoodsSold = recentSales.reduce((sum, m) => {
      const product = formattedProducts.find(p => p.id === m.inventory_item_id);
      return sum + ((product?.costPrice || 0) * Math.abs(m.quantity_change));
    }, 0);

    // Annualize COGS (30 days to 365 days)
    const annualizedCOGS = costOfGoodsSold * (365 / 30);
    const inventoryTurnover = totalValue > 0 ? annualizedCOGS / totalValue : 0;

    // NEW: Identify deadstock (no sales in 90+ days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const deadstockProducts = formattedProducts.filter(p => {
      const lastSale = movements
        .filter(m => m.inventory_item_id === p.id && m.movement_type === 'sale')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

      return !lastSale || new Date(lastSale.created_at) < ninetyDaysAgo;
    });

    // NEW: Calculate average stock age
    const avgStockAge = formattedProducts.length > 0
      ? formattedProducts.reduce((sum, p) => {
          const firstPurchase = movements
            .filter(m => m.inventory_item_id === p.id && m.movement_type === 'purchase')
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];

          if (!firstPurchase) return sum;
          return sum + differenceInDays(new Date(), new Date(firstPurchase.created_at));
        }, 0) / formattedProducts.length
      : 0;

    setStats(prev => ({
      ...prev,
      total: formattedProducts.length,
      inStock: formattedProducts.filter(p => p.status === 'in-stock').length,
      lowStock: formattedProducts.filter(p => p.status === 'low-stock').length,
      outOfStock: formattedProducts.filter(p => p.status === 'out-of-stock').length,
      totalValue,
      inventoryTurnover,
      deadstockCount: deadstockProducts.length,
      avgStockAge: Math.round(avgStockAge)
    } as any));
  };

  const fetchTopPerformer = async () => {
    try {
      // Fetch paid invoices
      const { data: paidInvoices } = await supabase
        .from('invoices')
        .select('id')
        .eq('user_id', user?.id)
        .eq('status', 'paid');

      if (!paidInvoices || paidInvoices.length === 0) {
        return;
      }

      const paidInvoiceIds = paidInvoices.map(inv => inv.id);

      // Fetch invoice items for paid invoices
      const { data: invoiceItems } = await supabase
        .from('invoice_items')
        .select('quantity, unit_price, inventory_item_id')
        .in('invoice_id', paidInvoiceIds)
        .not('inventory_item_id', 'is', null);

      if (!invoiceItems || invoiceItems.length === 0) {
        return;
      }

      // Get unique inventory item IDs
      const inventoryItemIds = [...new Set(
        (invoiceItems as any[])
          .map((item: any) => item.inventory_item_id)
          .filter((id: string | null): id is string => id !== null)
      )];

      if (inventoryItemIds.length === 0) {
        return;
      }

      // Fetch inventory items with cost prices
      const { data: inventoryData } = await supabase
        .from('inventory_items')
        .select('id, name, cost_price')
        .in('id', inventoryItemIds);

      if (!inventoryData) {
        return;
      }

      // Build a map of inventory item id -> { name, cost_price }
      const inventoryMap = (inventoryData as any[]).reduce((acc: Record<string, { name: string; costPrice: number }>, item: any) => {
        acc[item.id] = { name: item.name, costPrice: item.cost_price || 0 };
        return acc;
      }, {});

      // Calculate profit per product
      const productProfits: Record<string, { name: string; profit: number; unitsSold: number }> = {};

      for (const item of invoiceItems as any[]) {
        if (!item.inventory_item_id) continue;

        const inventoryItem = inventoryMap[item.inventory_item_id];
        if (!inventoryItem) continue;

        const profit = (item.unit_price - inventoryItem.costPrice) * item.quantity;

        if (!productProfits[item.inventory_item_id]) {
          productProfits[item.inventory_item_id] = {
            name: inventoryItem.name,
            profit: 0,
            unitsSold: 0
          };
        }

        productProfits[item.inventory_item_id].profit += profit;
        productProfits[item.inventory_item_id].unitsSold += item.quantity;
      }

      // Find top performer
      let topPerformer: { name: string; profit: number; unitsSold: number } | null = null;
      for (const productId of Object.keys(productProfits)) {
        const product = productProfits[productId];
        if (!topPerformer || product.profit > topPerformer.profit) {
          topPerformer = product;
        }
      }

      setStats(prev => ({
        ...prev,
        topPerformer
      }));
    } catch (error) {
      console.error('Error fetching top performer:', error);
    }
  };

  const calculateStockMovementTrend = () => {
    const sixMonthsAgo = subMonths(new Date(), 5);
    const months = eachMonthOfInterval({
      start: startOfMonth(sixMonthsAgo),
      end: new Date()
    });

    const monthlyTrend = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthMovements = movements.filter(m => {
        const date = new Date(m.created_at);
        return date >= monthStart && date <= monthEnd;
      });

      const stockIn = monthMovements
        .filter(m => ['purchase', 'return'].includes(m.movement_type))
        .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0);

      const stockOut = monthMovements
        .filter(m => ['sale', 'damage'].includes(m.movement_type))
        .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0);

      // Calculate month-end inventory value (simplified)
      const monthEndValue = products.reduce((sum, p) => {
        // Get quantity at end of month
        const relevantMovements = movements.filter(mv =>
          mv.inventory_item_id === p.id &&
          new Date(mv.created_at) <= monthEnd
        );

        const quantityAtMonthEnd = relevantMovements.length > 0
          ? relevantMovements[relevantMovements.length - 1].quantity_after
          : p.stock;

        return sum + (quantityAtMonthEnd * p.costPrice);
      }, 0);

      return {
        month: format(month, 'MMM'),
        stockIn,
        stockOut,
        inventoryValue: monthEndValue
      };
    });

    setMonthlyStockData(monthlyTrend);
  };

  // Call calculateStockMovementTrend when movements or products data changes
  useEffect(() => {
    if (movements.length > 0 && products.length > 0) {
      calculateStockMovementTrend();
    }
  }, [movements, products]);

  const handleProductAdded = () => {
    fetchProducts();
    fetchStockMovements();
  };

  const handleView = (row: any) => {
    setSelectedProductId(row.id);
    setDialogMode('view');
    setEditDialogOpen(true);
  };

  const handleEdit = (row: any) => {
    setSelectedProductId(row.id);
    setDialogMode('edit');
    setEditDialogOpen(true);
  };

  const handleDelete = async (row: any) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', row.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleAdjustStock = (row: any) => {
    setSelectedProduct({
      id: row.id,
      name: row.name,
      sku: row.sku,
      stock: row.stock,
    });
    setStockDialogOpen(true);
  };

  const getMovementTypeInfo = (type: string) => {
    const types: Record<string, { color: string, icon: any, label: string }> = {
      purchase: { color: 'bg-emerald-500/20 text-emerald-400', icon: ArrowDown, label: 'Purchase' },
      sale: { color: 'bg-rose-500/20 text-rose-400', icon: ArrowUp, label: 'Sale' },
      adjustment: { color: 'bg-amber-500/20 text-amber-400', icon: RefreshCw, label: 'Adjustment' },
      return: { color: 'bg-blue-500/20 text-blue-400', icon: Undo, label: 'Return' },
      damage: { color: 'bg-red-500/20 text-red-400', icon: AlertCircle, label: 'Damage' },
      transfer: { color: 'bg-violet-500/20 text-violet-400', icon: ArrowLeftRight, label: 'Transfer' },
    };
    return types[type] || types['adjustment'];
  };

  // Calculate stock health percentage for the visual indicator
  const stockHealthPercentage = stats.total > 0
    ? Math.round((stats.inStock / stats.total) * 100)
    : 0;

  // Filter products based on status
  const filteredProducts = useMemo(() => {
    if (productStatusFilter === 'all') return products;
    return products.filter(p => p.status === productStatusFilter);
  }, [products, productStatusFilter]);

  // Filter movements based on type
  const filteredMovements = useMemo(() => {
    if (movementTypeFilter === 'all') return movements;
    return movements.filter(m => m.movement_type === movementTypeFilter);
  }, [movements, movementTypeFilter]);

  // Filter options for products
  const productStatusOptions = [
    { value: 'in-stock', label: 'In Stock', color: 'emerald' as const },
    { value: 'low-stock', label: 'Low Stock', color: 'amber' as const },
    { value: 'out-of-stock', label: 'Out of Stock', color: 'rose' as const },
  ];

  // Filter options for movements
  const movementTypeOptions = [
    { value: 'purchase', label: 'Purchase', color: 'emerald' as const },
    { value: 'sale', label: 'Sale', color: 'rose' as const },
    { value: 'adjustment', label: 'Adjustment', color: 'amber' as const },
    { value: 'return', label: 'Return', color: 'blue' as const },
    { value: 'damage', label: 'Damage', color: 'rose' as const },
    { value: 'transfer', label: 'Transfer', color: 'cyan' as const },
  ];

  const productColumns = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    {
      key: 'price',
      label: 'Price',
      render: (value: number) => formatCurrency(value || 0, displayCurrency)
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (value: number, row: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAdjustStock(row);
          }}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary-700 hover:bg-primary-600 border border-primary-600 hover:border-quotla-orange/50 transition-colors group cursor-pointer"
          title="Click to adjust stock"
        >
          <Package className="w-3.5 h-3.5 text-primary-400 group-hover:text-quotla-orange" />
          <span className="font-medium">{value}</span>
        </button>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusConfig = {
          'in-stock': { color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle2 },
          'low-stock': { color: 'bg-amber-500/20 text-amber-400', icon: AlertTriangle },
          'out-of-stock': { color: 'bg-rose-500/20 text-rose-400', icon: XCircle },
        };
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig['in-stock'];
        const Icon = config.icon;
        return (
          <Badge className={`${config.color} inline-flex items-center gap-1`}>
            <Icon className="w-3 h-3" />
            {value}
          </Badge>
        );
      },
    },
  ];

  const movementColumns = [
    {
      key: 'created_at',
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    {
      key: 'movement_type',
      label: 'Type',
      render: (value: string) => {
        const typeInfo = getMovementTypeInfo(value);
        const Icon = typeInfo.icon;
        return (
          <Badge className={typeInfo.color}>
            <Icon className="w-3 h-3 mr-1" />
            {typeInfo.label}
          </Badge>
        );
      },
    },
    {
      key: 'inventory_item',
      label: 'Product',
      render: (value: any) => (
        <div>
          <div className="text-primary-100">{value?.name || 'Unknown'}</div>
          <div className="text-xs text-primary-400">{value?.sku || '-'}</div>
        </div>
      ),
    },
    {
      key: 'quantity_change',
      label: 'Quantity',
      render: (value: number) => (
        <span className={value > 0 ? 'text-emerald-400' : 'text-rose-400'}>
          {value > 0 ? '+' : ''}{value}
        </span>
      ),
    },
    {
      key: 'quantity_after',
      label: 'Stock After',
      render: (value: number) => <span className="text-primary-200">{value}</span>
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (value: string) => value ? (
        <span className="text-primary-400 text-sm truncate max-w-xs block">{value}</span>
      ) : <span className="text-primary-400">-</span>
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className={cn(components.spinner, 'h-16 w-16')} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-primary-50">Products & Inventory</h1>
          <p className="text-primary-400 mt-1">
            {isFilterActive ? formattedDateRange : 'Manage your products and track stock movements'}
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
          {activeTab === 'products' && (
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="bg-quotla-orange hover:bg-secondary-400 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddProductDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleProductAdded}
      />
      <AddProductDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleProductAdded}
        productId={selectedProductId}
        mode={dialogMode}
      />
      <AdjustStockDialog
        open={stockDialogOpen}
        onOpenChange={setStockDialogOpen}
        onSuccess={handleProductAdded}
        product={selectedProduct}
      />

      {/* Enhanced Product Metrics */}

      {/* Row 1: Stock Health Card (Enhanced) */}
      <div className="mb-4">
        <Card className="bg-quotla-dark/90 border-primary-600 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-quotla-green/15 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-quotla-green" />
            </div>
            <div>
              <p className="text-xs text-primary-400 uppercase tracking-wider">Stock Health</p>
              <p className="text-2xl font-bold text-primary-50">
                {Math.round((stats.inStock / stats.total) * 100)}%
              </p>
            </div>
          </div>

          {/* Visual breakdown bar */}
          <div className="mb-3">
            <div className="h-2 bg-primary-700 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${(stats.inStock / stats.total) * 100}%` }}
              />
              <div
                className="bg-amber-500 transition-all duration-500"
                style={{ width: `${(stats.lowStock / stats.total) * 100}%` }}
              />
              <div
                className="bg-rose-500 transition-all duration-500"
                style={{ width: `${(stats.outOfStock / stats.total) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span className="text-primary-400">In Stock:</span>
              <span className="font-medium text-primary-200">{stats.inStock}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span className="text-primary-400">Low:</span>
              <span className="font-medium text-primary-200">{stats.lowStock}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-rose-500" />
              <span className="text-primary-400">Out:</span>
              <span className="font-medium text-primary-200">{stats.outOfStock}</span>
            </div>
          </div>

          {/* NEW: Inventory Turnover Rate */}
          <div className="mt-4 pt-4 border-t border-primary-600">
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary-400">Inventory Turnover</span>
              <span className="text-sm font-semibold text-quotla-green">
                {(stats as any).inventoryTurnover?.toFixed(1) || '0.0'}x
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Inventory Performance Overview (Full-width) */}
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
              <p className="text-xs font-medium uppercase tracking-wider text-primary-400">Inventory Performance</p>
            </div>
          </div>

          {/* AVITPF Metric Layout - First Row: Inventory Value (large) + Turnover/Stock Age (stacked) */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Inventory Value - Large */}
            <div className={cn(
              'flex-1 p-4 rounded-xl border backdrop-blur-sm transition-all duration-200',
              'bg-primary-700/30 border-quotla-green/20 hover:border-quotla-green/40'
            )}>
              <LargeAVITPFMetric
                label="Inventory Value"
                value={stats.totalValue}
                change={null}
                currency={displayCurrency}
                colorScheme="green"
              />
            </div>

            {/* Turnover + Stock Age - Stacked */}
            <div className="flex flex-col gap-3">
              <div className={cn(
                'p-3 rounded-xl border backdrop-blur-sm transition-all duration-200',
                'bg-primary-700/30 border-emerald-500/20 hover:border-emerald-500/40'
              )}>
                <CompactAVITPFMetric
                  label="Turnover Rate"
                  value={Number(((stats as any).inventoryTurnover || 0).toFixed(1))}
                  change={null}
                  isInteger
                  colorScheme="emerald"
                  className="[&>div>span:first-child]:after:content-['x']"
                />
              </div>
              <div className={cn(
                'p-3 rounded-xl border backdrop-blur-sm transition-all duration-200',
                'bg-primary-700/30 border-amber-500/20 hover:border-amber-500/40'
              )}>
                <CompactAVITPFMetric
                  label="Avg Stock Age"
                  value={(stats as any).avgStockAge || 0}
                  change={null}
                  isInteger
                  colorScheme="orange"
                  className="[&>div>span:first-child]:after:content-['_days']"
                />
              </div>
            </div>
          </div>

          {/* Second Row: Total Stock (large) + Stock In/Out (stacked) */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Total Stock - Large */}
            <div className={cn(
              'flex-1 p-4 rounded-xl border backdrop-blur-sm transition-all duration-200',
              'bg-primary-700/30 border-quotla-orange/20 hover:border-quotla-orange/40'
            )}>
              <LargeAVITPFMetric
                label="Total Products"
                value={stats.total}
                change={null}
                isInteger
                colorScheme="orange"
              />
              <div className="mt-2 text-xs text-primary-400">
                {stats.inStock} in stock • {stats.lowStock} low • {stats.outOfStock} out
              </div>
            </div>

            {/* Stock In/Out + Deadstock - Stacked */}
            <div className="flex flex-col gap-3">
              <div className={cn(
                'p-3 rounded-xl border backdrop-blur-sm transition-all duration-200',
                'bg-primary-700/30 border-emerald-500/20 hover:border-emerald-500/40'
              )}>
                <CompactAVITPFMetric
                  label="Stock In Today"
                  value={stats.stockInToday}
                  change={null}
                  isInteger
                  colorScheme="emerald"
                />
              </div>
              <div className={cn(
                'p-3 rounded-xl border backdrop-blur-sm transition-all duration-200',
                'bg-primary-700/30 border-rose-500/20 hover:border-rose-500/40'
              )}>
                <CompactAVITPFMetric
                  label="Stock Out Today"
                  value={stats.stockOutToday}
                  change={null}
                  isInteger
                  colorScheme="rose"
                />
              </div>
            </div>
          </div>

          {/* Stock Movement Trend Chart */}
          <div className="h-[200px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyStockData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8a8a66', fontSize: 11 }}
                />
                <YAxis
                  yAxisId="quantity"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8a8a66', fontSize: 11 }}
                  label={{ value: 'Units', angle: -90, position: 'insideLeft', style: { fill: '#8a8a66', fontSize: 10 } }}
                />
                <YAxis
                  yAxisId="value"
                  orientation="right"
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
                    if (name === 'inventoryValue') {
                      return [formatCurrency(value, displayCurrency), 'Inventory Value'];
                    }
                    return [value, name === 'stockIn' ? 'Stock In' : 'Stock Out'];
                  }}
                />
                <Bar yAxisId="quantity" dataKey="stockIn" fill="#10b981" name="Stock In" />
                <Bar yAxisId="quantity" dataKey="stockOut" fill="#ef4444" name="Stock Out" />
                <Line
                  yAxisId="value"
                  type="monotone"
                  dataKey="inventoryValue"
                  stroke="#ce6203"
                  strokeWidth={2}
                  dot={{ fill: '#ce6203', r: 3 }}
                  name="Inventory Value"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded" />
              <span className="text-xs text-primary-300">Stock In</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500 rounded" />
              <span className="text-xs text-primary-300">Stock Out</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-quotla-orange" style={{ width: '16px' }} />
              <span className="text-xs text-primary-300">Inventory Value</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Product Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Top Performer Card */}
        <Card className="bg-quotla-dark/90 border-primary-600 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-primary-400 uppercase tracking-wider">Top Performer</p>
              {stats.topPerformer ? (
                <p className="text-lg font-bold text-primary-50 truncate">{stats.topPerformer.name}</p>
              ) : (
                <p className="text-lg font-bold text-primary-400">No sales yet</p>
              )}
            </div>
          </div>
          {stats.topPerformer && (
            <div className="flex items-center justify-between pt-3 border-t border-primary-600">
              <div>
                <p className="text-xs text-primary-400">Profit</p>
                <p className="text-sm font-semibold text-emerald-400">{formatCurrency(stats.topPerformer.profit, displayCurrency)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-primary-400">Units Sold</p>
                <p className="text-sm font-medium text-primary-200">{stats.topPerformer.unitsSold}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Stock In Today Card */}
        <Card className="bg-quotla-dark/90 border-primary-600 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <ArrowDown className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-primary-400 uppercase tracking-wider">Stock In Today</p>
              <p className="text-2xl font-bold text-primary-50">{stats.stockInToday}</p>
            </div>
          </div>
          <p className="text-xs text-primary-400">Units received</p>
        </Card>

        {/* Stock Out Today Card */}
        <Card className="bg-quotla-dark/90 border-primary-600 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
              <ArrowUp className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-xs text-primary-400 uppercase tracking-wider">Stock Out Today</p>
              <p className="text-2xl font-bold text-primary-50">{stats.stockOutToday}</p>
            </div>
          </div>
          <p className="text-xs text-primary-400">Units sold/removed</p>
        </Card>
      </div>

      {/* Low Stock Alert - Only show if there are items needing attention */}
      {stats.lowStock > 0 || stats.outOfStock > 0 ? (
        <Card className="bg-gradient-to-r from-amber-950/30 to-quotla-dark/50 border border-amber-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary-100">Stock Alert</p>
              <p className="text-xs text-primary-400">
                {stats.lowStock > 0 && `${stats.lowStock} item${stats.lowStock > 1 ? 's' : ''} running low`}
                {stats.lowStock > 0 && stats.outOfStock > 0 && ' • '}
                {stats.outOfStock > 0 && `${stats.outOfStock} item${stats.outOfStock > 1 ? 's' : ''} out of stock`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 shrink-0"
              onClick={() => setActiveTab('products')}
            >
              View Items
            </Button>
          </div>
        </Card>
      ) : null}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-primary-700 border-primary-600">
          <TabsTrigger value="products" className="data-[state=active]:bg-quotla-green/20 data-[state=active]:text-quotla-green">
            <Package className="w-4 h-4 mr-2" />
            Products ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="movements" className="data-[state=active]:bg-quotla-green/20 data-[state=active]:text-quotla-green">
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Stock Movements ({movements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <DataTable
            columns={productColumns}
            data={filteredProducts}
            searchPlaceholder="Search products..."
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            filters={
              <FilterSelect
                options={productStatusOptions}
                value={productStatusFilter}
                onChange={(v) => setProductStatusFilter(v as ProductStatusFilter)}
                placeholder="Status"
                allLabel="All Status"
              />
            }
          />
        </TabsContent>

        <TabsContent value="movements" className="mt-6">
          {movements.length > 0 ? (
            <DataTable
              columns={movementColumns}
              data={filteredMovements}
              searchPlaceholder="Search movements..."
              filters={
                <FilterSelect
                  options={movementTypeOptions}
                  value={movementTypeFilter}
                  onChange={(v) => setMovementTypeFilter(v as MovementTypeFilter)}
                  placeholder="Type"
                  allLabel="All Types"
                />
              }
            />
          ) : (
            <div className="bg-quotla-dark/90 border border-primary-600 rounded-lg p-12 text-center">
              <Package className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <p className="text-primary-400">No stock movements recorded yet</p>
              <p className="text-primary-400 text-sm mt-2">
                Stock movements will appear here when inventory changes occur
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
