import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { DataTable } from '../DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';

const suppliersData = [
  { id: 1, name: 'Acme Wholesale', contact: 'John Smith', email: 'john@acme.com', phone: '+1 (555) 111-2222', totalOrders: 128, status: 'verified' },
  { id: 2, name: 'Global Imports', contact: 'Sarah Johnson', email: 'sarah@global.com', phone: '+1 (555) 222-3333', totalOrders: 95, status: 'verified' },
  { id: 3, name: 'Prime Suppliers Co', contact: 'Mike Davis', email: 'mike@prime.com', phone: '+1 (555) 333-4444', totalOrders: 67, status: 'pending' },
  { id: 4, name: 'Eastern Trading', contact: 'Lisa Chen', email: 'lisa@eastern.com', phone: '+1 (555) 444-5555', totalOrders: 143, status: 'verified' },
  { id: 5, name: 'Western Supply Hub', contact: 'Tom Wilson', email: 'tom@western.com', phone: '+1 (555) 555-6666', totalOrders: 89, status: 'verified' },
];

export function Suppliers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Supplier Name' },
    { key: 'contact', label: 'Contact Person' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'totalOrders', label: 'Total Orders' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge className={value === 'verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}>
          {value}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-100">Suppliers</h1>
          <p className="text-slate-400 mt-1">Manage your supplier relationships and procurement</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="supplier-name">Supplier Name</Label>
                <Input id="supplier-name" placeholder="Enter supplier name" className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-person">Contact Person</Label>
                <Input id="contact-person" placeholder="Enter contact name" className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-email">Email</Label>
                <Input id="supplier-email" type="email" placeholder="supplier@example.com" className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-phone">Phone</Label>
                <Input id="supplier-phone" placeholder="+1 (555) 000-0000" className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-address">Address</Label>
                <Input id="supplier-address" placeholder="Enter address" className="bg-slate-800 border-slate-700" />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700">
                  Cancel
                </Button>
                <Button className="bg-cyan-500 hover:bg-cyan-600">Save Supplier</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={suppliersData}
        searchPlaceholder="Search suppliers..."
        onView={(row) => console.log('View', row)}
        onEdit={(row) => console.log('Edit', row)}
        onDelete={(row) => console.log('Delete', row)}
      />
    </div>
  );
}
