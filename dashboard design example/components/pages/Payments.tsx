import { useState } from 'react';
import { Plus, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import { DataTable } from '../DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const paymentsData = [
  { id: 1, paymentNo: 'PAY-2025-001', date: '2025-10-28', customer: 'ABC Corporation', invoice: 'INV-2025-001', amount: '$5,450', method: 'bank-transfer', status: 'completed' },
  { id: 2, paymentNo: 'PAY-2025-002', date: '2025-10-29', customer: 'Metro Supplies', invoice: 'INV-2025-004', amount: '$3,680', method: 'credit-card', status: 'completed' },
  { id: 3, paymentNo: 'PAY-2025-003', date: '2025-10-30', customer: 'XYZ Industries', invoice: 'INV-2025-002', amount: '$8,320', method: 'check', status: 'pending' },
  { id: 4, paymentNo: 'PAY-2025-004', date: '2025-10-31', customer: 'Global Traders', invoice: 'INV-2025-003', amount: '$12,150', method: 'bank-transfer', status: 'failed' },
  { id: 5, paymentNo: 'PAY-2025-005', date: '2025-11-01', customer: 'ABC Corporation', invoice: 'INV-2025-005', amount: '$4,600', method: 'credit-card', status: 'processing' },
];

export function Payments() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const columns = [
    { key: 'paymentNo', label: 'Payment #' },
    { key: 'date', label: 'Date' },
    { key: 'customer', label: 'Customer' },
    { key: 'invoice', label: 'Invoice #' },
    { key: 'amount', label: 'Amount' },
    {
      key: 'method',
      label: 'Method',
      render: (value: string) => {
        const methods = {
          'bank-transfer': 'Bank Transfer',
          'credit-card': 'Credit Card',
          'check': 'Check',
          'cash': 'Cash',
        };
        return <span>{methods[value as keyof typeof methods]}</span>;
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors = {
          completed: 'bg-emerald-500/20 text-emerald-400',
          processing: 'bg-cyan-500/20 text-cyan-400',
          pending: 'bg-amber-500/20 text-amber-400',
          failed: 'bg-rose-500/20 text-rose-400',
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
          <h1 className="text-3xl text-slate-100">Payments</h1>
          <p className="text-slate-400 mt-1">Track and manage customer payments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-500 hover:bg-violet-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="payment-customer">Customer</Label>
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
                <Label htmlFor="payment-invoice">Invoice</Label>
                <Select>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Select invoice" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="inv1">INV-2025-001 - $5,450</SelectItem>
                    <SelectItem value="inv2">INV-2025-002 - $8,320</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-date">Payment Date</Label>
                  <Input id="payment-date" type="date" className="bg-slate-800 border-slate-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-amount">Amount</Label>
                  <Input id="payment-amount" type="number" placeholder="0.00" className="bg-slate-800 border-slate-700" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit-card">Credit Card</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-reference">Reference Number</Label>
                <Input id="payment-reference" placeholder="Transaction reference" className="bg-slate-800 border-slate-700" />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700">
                  Cancel
                </Button>
                <Button className="bg-violet-500 hover:bg-violet-600">Record Payment</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={paymentsData}
        searchPlaceholder="Search payments..."
        onView={(row) => console.log('View', row)}
        onEdit={(row) => console.log('Edit', row)}
      />
    </div>
  );
}
