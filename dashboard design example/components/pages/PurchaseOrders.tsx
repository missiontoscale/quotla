import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { DataTable } from '../DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const purchaseOrdersData = [
  { id: 1, poNo: 'PO-2025-101', supplier: 'Acme Wholesale', date: '2025-10-25', expectedDate: '2025-11-05', amount: '$15,600', status: 'received' },
  { id: 2, poNo: 'PO-2025-102', supplier: 'Global Imports', date: '2025-10-27', expectedDate: '2025-11-10', amount: '$22,400', status: 'pending' },
  { id: 3, poNo: 'PO-2025-103', supplier: 'Eastern Trading', date: '2025-10-29', expectedDate: '2025-11-12', amount: '$18,750', status: 'approved' },
  { id: 4, poNo: 'PO-2025-104', supplier: 'Prime Suppliers Co', date: '2025-10-30', expectedDate: '2025-11-15', amount: '$9,200', status: 'draft' },
  { id: 5, poNo: 'PO-2025-105', supplier: 'Western Supply Hub', date: '2025-11-01', expectedDate: '2025-11-18', amount: '$31,500', status: 'approved' },
];

export function PurchaseOrders() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const columns = [
    { key: 'poNo', label: 'PO #' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'date', label: 'Order Date' },
    { key: 'expectedDate', label: 'Expected Delivery' },
    { key: 'amount', label: 'Amount' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors = {
          received: 'bg-emerald-500/20 text-emerald-400',
          approved: 'bg-cyan-500/20 text-cyan-400',
          pending: 'bg-amber-500/20 text-amber-400',
          draft: 'bg-slate-500/20 text-slate-400',
        };
        return (
          <Badge className={statusColors[value as keyof typeof statusColors]}>
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
          <h1 className="text-3xl text-slate-100">Purchase Orders</h1>
          <p className="text-slate-400 mt-1">Manage procurement and supplier orders</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create PO
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="po-supplier">Supplier</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="acme">Acme Wholesale</SelectItem>
                      <SelectItem value="global">Global Imports</SelectItem>
                      <SelectItem value="eastern">Eastern Trading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="po-date">Order Date</Label>
                  <Input id="po-date" type="date" className="bg-slate-800 border-slate-700" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="po-delivery">Expected Delivery</Label>
                  <Input id="po-delivery" type="date" className="bg-slate-800 border-slate-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="po-warehouse">Delivery Location</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="main">Main Warehouse</SelectItem>
                      <SelectItem value="secondary">Secondary Warehouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Order Items</Label>
                <div className="border border-slate-800 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-12 gap-2 text-sm text-slate-400">
                    <div className="col-span-5">Product</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2">Cost</div>
                    <div className="col-span-2">Total</div>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <Select>
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800">
                          <SelectItem value="prod1">Wireless Mouse</SelectItem>
                          <SelectItem value="prod2">USB-C Cable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input type="number" placeholder="0" className="bg-slate-800 border-slate-700" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" placeholder="0.00" className="bg-slate-800 border-slate-700" />
                    </div>
                    <div className="col-span-2">
                      <Input placeholder="0.00" disabled className="bg-slate-800 border-slate-700" />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-slate-700">
                    + Add Item
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping:</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between text-lg text-slate-100 pt-2 border-t border-slate-800">
                    <span>Total:</span>
                    <span>$0.00</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700">
                  Cancel
                </Button>
                <Button variant="outline" className="border-slate-700">
                  Save as Draft
                </Button>
                <Button className="bg-cyan-500 hover:bg-cyan-600">Create PO</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={purchaseOrdersData}
        searchPlaceholder="Search purchase orders..."
        onView={(row) => console.log('View', row)}
        onEdit={(row) => console.log('Edit', row)}
        onDelete={(row) => console.log('Delete', row)}
      />
    </div>
  );
}
