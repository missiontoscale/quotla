'use client'

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddProductDialog } from '@/components/products/AddProductDialog';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductsPage() {
  const { user } = useAuth();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [dialogMode, setDialogMode] = useState<'create' | 'view' | 'edit'>('create');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  });

  useEffect(() => {
    if (user) {
      fetchProducts();
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
        stock: item.quantity_on_hand,
        status: item.quantity_on_hand <= 0 ? 'out-of-stock' :
                item.quantity_on_hand <= (item.low_stock_threshold || 10) ? 'low-stock' : 'in-stock'
      }));

      setProducts(formattedProducts);
      calculateStats(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    setStats({
      total: data.length,
      inStock: data.filter(p => p.status === 'in-stock').length,
      lowStock: data.filter(p => p.status === 'low-stock').length,
      outOfStock: data.filter(p => p.status === 'out-of-stock').length
    });
  };

  const handleProductAdded = () => {
    fetchProducts();
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

  const columns = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    {
      key: 'price',
      label: 'Price',
      render: (value: number) => value ? `$${value.toFixed(2)}` : '$0.00'
    },
    { key: 'stock', label: 'Stock' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors = {
          'in-stock': 'bg-emerald-500/20 text-emerald-400',
          'low-stock': 'bg-amber-500/20 text-amber-400',
          'out-of-stock': 'bg-rose-500/20 text-rose-400',
        };
        return (
          <Badge className={statusColors[value as keyof typeof statusColors] || statusColors['in-stock']}>
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
          <h1 className="text-3xl text-slate-100">Products</h1>
          <p className="text-slate-400 mt-1">Manage your product catalog and inventory</p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Total Products</p>
          <h3 className="text-2xl text-slate-100 mt-2">{stats.total}</h3>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">In Stock</p>
          <h3 className="text-2xl text-emerald-400 mt-2">{stats.inStock}</h3>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Low Stock</p>
          <h3 className="text-2xl text-amber-400 mt-2">{stats.lowStock}</h3>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Out of Stock</p>
          <h3 className="text-2xl text-rose-400 mt-2">{stats.outOfStock}</h3>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder="Search products..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
