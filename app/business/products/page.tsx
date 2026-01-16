'use client'

import { useState, useEffect } from 'react';
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
  TrendingDown,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
  AlertCircle,
  Undo,
  CheckCircle2,
  XCircle,
  Trophy
} from 'lucide-react';
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

export default function ProductsPage() {
  const { user } = useAuth();
  const { displayCurrency, setDisplayCurrency, isConverted } = useDisplayCurrency();
  const [activeTab, setActiveTab] = useState('products');

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

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchStockMovements();
      fetchTopPerformer();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', user?.id)
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
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockMovements = async () => {
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
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const stockMovements = (data || []) as StockMovement[];
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
    } catch (error) {
      console.error('Error loading stock movements:', error);
    }
  };

  const calculateStats = (formattedProducts: any[], rawData: any[]) => {
    const totalValue = rawData.reduce((sum, item) =>
      sum + ((item.quantity_on_hand || 0) * (item.cost_price || 0)), 0
    );

    setStats(prev => ({
      ...prev,
      total: formattedProducts.length,
      inStock: formattedProducts.filter(p => p.status === 'in-stock').length,
      lowStock: formattedProducts.filter(p => p.status === 'low-stock').length,
      outOfStock: formattedProducts.filter(p => p.status === 'out-of-stock').length,
      totalValue
    }));
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
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 transition-colors group cursor-pointer"
          title="Click to adjust stock"
        >
          <Package className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
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
          <div className="text-slate-200">{value?.name || 'Unknown'}</div>
          <div className="text-xs text-slate-500">{value?.sku || '-'}</div>
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
      render: (value: number) => <span className="text-slate-300">{value}</span>
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (value: string) => value ? (
        <span className="text-slate-400 text-sm truncate max-w-xs block">{value}</span>
      ) : <span className="text-slate-500">-</span>
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-cyan-300 opacity-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-100">Products & Inventory</h1>
          <p className="text-slate-400 mt-1">Manage your products and track stock movements</p>
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
          {activeTab === 'products' && (
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
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

      {/* Stats Cards - Modern Gradient Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Stock Health Card - Featured */}
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 p-5 hover:border-cyan-500/40 transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-cyan-400 uppercase tracking-wider mb-1">Stock Health</p>
              <p className="text-3xl font-bold text-slate-50">{stockHealthPercentage}%</p>
            </div>
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          {/* Stock breakdown bar */}
          <div className="mt-3">
            <div className="flex h-2 rounded-full overflow-hidden bg-slate-800">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.inStock / stats.total) * 100 : 0}%` }}
              />
              <div
                className="bg-amber-500 transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.lowStock / stats.total) * 100 : 0}%` }}
              />
              <div
                className="bg-rose-500 transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.outOfStock / stats.total) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {stats.inStock} OK
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                {stats.lowStock} Low
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                {stats.outOfStock} Out
              </span>
            </div>
          </div>
        </Card>

        {/* Inventory Value */}
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 p-5 hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2">Inventory Value</p>
              <p className="text-2xl font-bold text-slate-50">{formatCurrency(stats.totalValue, displayCurrency)}</p>
              <p className="text-xs text-slate-500 mt-2">{stats.total} products</p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </Card>

        {/* Stock In Today */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-5 hover:border-blue-500/40 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-2">Stock In Today</p>
              <p className="text-2xl font-bold text-slate-50">+{stats.stockInToday}</p>
              <p className="text-xs text-slate-500 mt-2">Units received</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <ArrowDown className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Stock Out Today */}
        <Card className="bg-gradient-to-br from-rose-500/10 to-rose-600/5 border border-rose-500/20 p-5 hover:border-rose-500/40 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-rose-400 uppercase tracking-wider mb-2">Stock Out Today</p>
              <p className="text-2xl font-bold text-slate-50">-{stats.stockOutToday}</p>
              <p className="text-xs text-slate-500 mt-2">Units dispatched</p>
            </div>
            <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center">
              <ArrowUp className="w-5 h-5 text-rose-400" />
            </div>
          </div>
        </Card>

        {/* Top Performer */}
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-5 hover:border-amber-500/40 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-2">Top Performer</p>
              {stats.topPerformer ? (
                <>
                  <p className="text-lg font-bold text-slate-50 truncate" title={stats.topPerformer.name}>
                    {stats.topPerformer.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    {formatCurrency(stats.topPerformer.profit, displayCurrency)} from {stats.topPerformer.unitsSold} units
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-slate-500">No sales yet</p>
                  <p className="text-xs text-slate-600 mt-2">Sell products to see top performer</p>
                </>
              )}
            </div>
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Low Stock Alert - Only show if there are items needing attention */}
      {stats.lowStock > 0 || stats.outOfStock > 0 ? (
        <Card className="bg-gradient-to-r from-amber-950/30 to-slate-900/50 border border-amber-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200">Stock Alert</p>
              <p className="text-xs text-slate-400">
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
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="products" className="data-[state=active]:bg-slate-700">
            <Package className="w-4 h-4 mr-2" />
            Products ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="movements" className="data-[state=active]:bg-slate-700">
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Stock Movements ({movements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <DataTable
            columns={productColumns}
            data={products}
            searchPlaceholder="Search products..."
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="movements" className="mt-6">
          {movements.length > 0 ? (
            <DataTable
              columns={movementColumns}
              data={movements}
              searchPlaceholder="Search movements..."
            />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No stock movements recorded yet</p>
              <p className="text-slate-500 text-sm mt-2">
                Stock movements will appear here when inventory changes occur
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
