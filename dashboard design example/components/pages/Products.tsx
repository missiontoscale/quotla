import { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { DataTable } from '../DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const productsData = [
  { id: 1, sku: 'PROD-001', name: 'Wireless Mouse', category: 'Electronics', stock: 245, price: '$29.99', cost: '$15.00', status: 'in-stock' },
  { id: 2, sku: 'PROD-002', name: 'USB-C Cable', category: 'Accessories', stock: 12, price: '$12.99', cost: '$6.50', status: 'low-stock' },
  { id: 3, sku: 'PROD-003', name: 'Laptop Stand', category: 'Furniture', stock: 87, price: '$45.99', cost: '$22.00', status: 'in-stock' },
  { id: 4, sku: 'PROD-004', name: 'Mechanical Keyboard', category: 'Electronics', stock: 0, price: '$89.99', cost: '$45.00', status: 'out-of-stock' },
  { id: 5, sku: 'PROD-005', name: 'Monitor 27"', category: 'Electronics', stock: 156, price: '$299.99', cost: '$180.00', status: 'in-stock' },
];

export function Products() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const columns = [
    { key: 'sku', label: 'SKU' },
    {
      key: 'name',
      label: 'Product Name',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center">
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <span>{value}</span>
        </div>
      ),
    },
    { key: 'category', label: 'Category' },
    { key: 'stock', label: 'Stock' },
    { key: 'price', label: 'Price' },
    { key: 'cost', label: 'Cost' },
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
          <Badge className={statusColors[value as keyof typeof statusColors]}>
            {value.replace('-', ' ')}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-100">Products & Inventory</h1>
          <p className="text-slate-400 mt-1">Manage your product catalog and stock levels</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-500 hover:bg-violet-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-sku">SKU</Label>
                  <Input id="product-sku" placeholder="PROD-XXX" className="bg-slate-800 border-slate-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-category">Category</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input id="product-name" placeholder="Enter product name" className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-description">Description</Label>
                <Textarea id="product-description" placeholder="Product description" className="bg-slate-800 border-slate-700" rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-cost">Cost Price</Label>
                  <Input id="product-cost" type="number" placeholder="0.00" className="bg-slate-800 border-slate-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-price">Selling Price</Label>
                  <Input id="product-price" type="number" placeholder="0.00" className="bg-slate-800 border-slate-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-stock">Initial Stock</Label>
                  <Input id="product-stock" type="number" placeholder="0" className="bg-slate-800 border-slate-700" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-min">Minimum Stock</Label>
                  <Input id="product-min" type="number" placeholder="0" className="bg-slate-800 border-slate-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-max">Maximum Stock</Label>
                  <Input id="product-max" type="number" placeholder="0" className="bg-slate-800 border-slate-700" />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700">
                  Cancel
                </Button>
                <Button className="bg-violet-500 hover:bg-violet-600">Save Product</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={productsData}
        searchPlaceholder="Search products..."
        onView={(row) => console.log('View', row)}
        onEdit={(row) => console.log('Edit', row)}
        onDelete={(row) => console.log('Delete', row)}
      />
    </div>
  );
}
