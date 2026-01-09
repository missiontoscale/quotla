import { useState } from 'react';
import { Plus, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { DataTable } from '../DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';

const customersData = [
  { id: 1, name: 'ABC Corporation', email: 'contact@abc.com', phone: '+1 (555) 123-4567', balance: '$12,450', status: 'active', orders: 45 },
  { id: 2, name: 'XYZ Industries', email: 'info@xyz.com', phone: '+1 (555) 234-5678', balance: '$8,320', status: 'active', orders: 32 },
  { id: 3, name: 'Tech Solutions Ltd', email: 'hello@techsol.com', phone: '+1 (555) 345-6789', balance: '$0', status: 'inactive', orders: 12 },
  { id: 4, name: 'Global Traders', email: 'sales@global.com', phone: '+1 (555) 456-7890', balance: '$25,180', status: 'active', orders: 67 },
  { id: 5, name: 'Metro Supplies', email: 'contact@metro.com', phone: '+1 (555) 567-8901', balance: '$5,670', status: 'active', orders: 28 },
];

export function Customers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Customer Name' },
    {
      key: 'email',
      label: 'Email',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-slate-500" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-slate-500" />
          <span>{value}</span>
        </div>
      ),
    },
    { key: 'orders', label: 'Total Orders' },
    { key: 'balance', label: 'Outstanding Balance' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge className={value === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}>
          {value}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-100">Customers</h1>
          <p className="text-slate-400 mt-1">Manage your customer relationships and accounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-500 hover:bg-violet-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name</Label>
                <Input id="name" placeholder="Enter customer name" className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="customer@example.com" className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+1 (555) 000-0000" className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Enter address" className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credit">Credit Limit</Label>
                <Input id="credit" type="number" placeholder="0" className="bg-slate-800 border-slate-700" />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700">
                  Cancel
                </Button>
                <Button className="bg-violet-500 hover:bg-violet-600">Save Customer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={customersData}
        searchPlaceholder="Search customers..."
        onView={(row) => console.log('View', row)}
        onEdit={(row) => console.log('Edit', row)}
        onDelete={(row) => console.log('Delete', row)}
      />
    </div>
  );
}
