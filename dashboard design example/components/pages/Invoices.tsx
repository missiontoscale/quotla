import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { DataTable } from '../DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const invoicesData = [
  { id: 1, invoiceNo: 'INV-2025-001', customer: 'ABC Corporation', date: '2025-10-28', dueDate: '2025-11-27', amount: '$5,450', status: 'paid' },
  { id: 2, invoiceNo: 'INV-2025-002', customer: 'XYZ Industries', date: '2025-10-29', dueDate: '2025-11-28', amount: '$8,320', status: 'pending' },
  { id: 3, invoiceNo: 'INV-2025-003', customer: 'Global Traders', date: '2025-10-30', dueDate: '2025-11-29', amount: '$12,150', status: 'overdue' },
  { id: 4, invoiceNo: 'INV-2025-004', customer: 'Metro Supplies', date: '2025-10-31', dueDate: '2025-11-30', amount: '$3,680', status: 'pending' },
  { id: 5, invoiceNo: 'INV-2025-005', customer: 'ABC Corporation', date: '2025-11-01', dueDate: '2025-12-01', amount: '$9,200', status: 'draft' },
];

export function Invoices() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const columns = [
    { key: 'invoiceNo', label: 'Invoice #' },
    { key: 'customer', label: 'Customer' },
    { key: 'date', label: 'Date' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'amount', label: 'Amount' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors = {
          paid: 'bg-emerald-500/20 text-emerald-400',
          pending: 'bg-amber-500/20 text-amber-400',
          overdue: 'bg-rose-500/20 text-rose-400',
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
          <h1 className="text-3xl text-slate-100">Invoices</h1>
          <p className="text-slate-400 mt-1">Manage sales invoices and billing</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-500 hover:bg-violet-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-customer">Customer</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="abc">ABC Corporation</SelectItem>
                      <SelectItem value="xyz">XYZ Industries</SelectItem>
                      <SelectItem value="global">Global Traders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice-date">Invoice Date</Label>
                  <Input id="invoice-date" type="date" className="bg-slate-800 border-slate-700" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-due">Due Date</Label>
                  <Input id="invoice-due" type="date" className="bg-slate-800 border-slate-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice-terms">Payment Terms</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="net30">Net 30</SelectItem>
                      <SelectItem value="net60">Net 60</SelectItem>
                      <SelectItem value="due">Due on Receipt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Line Items</Label>
                <div className="border border-slate-800 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-12 gap-2 text-sm text-slate-400">
                    <div className="col-span-5">Product</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2">Price</div>
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
                    + Add Line Item
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
                    <span>Tax (10%):</span>
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
                <Button className="bg-violet-500 hover:bg-violet-600">Create Invoice</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={invoicesData}
        searchPlaceholder="Search invoices..."
        onView={(row) => console.log('View', row)}
        onEdit={(row) => console.log('Edit', row)}
        onDelete={(row) => console.log('Delete', row)}
      />
    </div>
  );
}
