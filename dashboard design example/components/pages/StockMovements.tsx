import { ArrowUp, ArrowDown, Package } from 'lucide-react';
import { DataTable } from '../DataTable';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

const stockMovementsData = [
  { id: 1, date: '2025-11-01', product: 'Wireless Mouse', sku: 'PROD-001', type: 'in', quantity: 100, reference: 'PO-1234', user: 'John Doe' },
  { id: 2, date: '2025-10-31', product: 'USB-C Cable', sku: 'PROD-002', type: 'out', quantity: 50, reference: 'INV-5678', user: 'Jane Smith' },
  { id: 3, date: '2025-10-31', product: 'Laptop Stand', sku: 'PROD-003', type: 'in', quantity: 75, reference: 'PO-1235', user: 'John Doe' },
  { id: 4, date: '2025-10-30', product: 'Monitor 27"', sku: 'PROD-005', type: 'out', quantity: 25, reference: 'INV-5679', user: 'Mike Johnson' },
  { id: 5, date: '2025-10-30', product: 'Mechanical Keyboard', sku: 'PROD-004', type: 'adjustment', quantity: -5, reference: 'ADJ-001', user: 'Admin' },
];

export function StockMovements() {
  const columns = [
    { key: 'date', label: 'Date' },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => {
        const types = {
          in: { color: 'bg-emerald-500/20 text-emerald-400', icon: ArrowDown, label: 'Stock In' },
          out: { color: 'bg-rose-500/20 text-rose-400', icon: ArrowUp, label: 'Stock Out' },
          adjustment: { color: 'bg-amber-500/20 text-amber-400', icon: Package, label: 'Adjustment' },
        };
        const type = types[value as keyof typeof types];
        const Icon = type.icon;
        return (
          <Badge className={type.color}>
            <Icon className="w-3 h-3 mr-1" />
            {type.label}
          </Badge>
        );
      },
    },
    {
      key: 'product',
      label: 'Product',
      render: (value: string, row: any) => (
        <div>
          <div className="text-slate-200">{value}</div>
          <div className="text-xs text-slate-500">{row.sku}</div>
        </div>
      ),
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (value: number) => (
        <span className={value > 0 ? 'text-emerald-400' : 'text-rose-400'}>
          {value > 0 ? '+' : ''}{value}
        </span>
      ),
    },
    { key: 'reference', label: 'Reference' },
    { key: 'user', label: 'User' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-100">Stock Movements</h1>
          <p className="text-slate-400 mt-1">Track all inventory movements and adjustments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Stock In (Today)</p>
              <h3 className="text-2xl text-slate-100 mt-1">+175</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <ArrowDown className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Stock Out (Today)</p>
              <h3 className="text-2xl text-slate-100 mt-1">-75</h3>
            </div>
            <div className="w-12 h-12 bg-rose-500/20 rounded-lg flex items-center justify-center">
              <ArrowUp className="w-6 h-6 text-rose-400" />
            </div>
          </div>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Adjustments (Today)</p>
              <h3 className="text-2xl text-slate-100 mt-1">3</h3>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={stockMovementsData}
        searchPlaceholder="Search movements..."
        onView={(row) => console.log('View', row)}
      />
    </div>
  );
}
