import { Shield, User, Package, FileText, CreditCard, AlertCircle } from 'lucide-react';
import { DataTable } from '../DataTable';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

const auditLogsData = [
  { id: 1, timestamp: '2025-11-01 14:32:15', user: 'John Doe', action: 'create', module: 'Invoice', details: 'Created invoice INV-2025-005', ip: '192.168.1.100' },
  { id: 2, timestamp: '2025-11-01 13:45:22', user: 'Jane Smith', action: 'update', module: 'Product', details: 'Updated product PROD-001 stock quantity', ip: '192.168.1.101' },
  { id: 3, timestamp: '2025-11-01 12:18:33', user: 'Mike Johnson', action: 'delete', module: 'Customer', details: 'Deleted customer #789', ip: '192.168.1.102' },
  { id: 4, timestamp: '2025-11-01 11:05:44', user: 'Admin', action: 'update', module: 'Settings', details: 'Updated system settings', ip: '192.168.1.1' },
  { id: 5, timestamp: '2025-11-01 10:22:55', user: 'John Doe', action: 'create', module: 'Payment', details: 'Recorded payment PAY-2025-005', ip: '192.168.1.100' },
  { id: 6, timestamp: '2025-10-31 16:48:12', user: 'Jane Smith', action: 'update', module: 'Purchase Order', details: 'Updated PO-2025-102 status to approved', ip: '192.168.1.101' },
  { id: 7, timestamp: '2025-10-31 15:33:25', user: 'Mike Johnson', action: 'create', module: 'Supplier', details: 'Added new supplier: Tech Distributors', ip: '192.168.1.102' },
];

const activitySummary = [
  { action: 'Creates', count: 127, color: 'text-emerald-400' },
  { action: 'Updates', count: 345, color: 'text-cyan-400' },
  { action: 'Deletes', count: 23, color: 'text-rose-400' },
  { action: 'Views', count: 1842, color: 'text-violet-400' },
];

export function AuditLogs() {
  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (value: string) => (
        <div>
          <div className="text-slate-200">{value.split(' ')[0]}</div>
          <div className="text-xs text-slate-500">{value.split(' ')[1]}</div>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'User',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (value: string) => {
        const actionColors = {
          create: 'bg-emerald-500/20 text-emerald-400',
          update: 'bg-cyan-500/20 text-cyan-400',
          delete: 'bg-rose-500/20 text-rose-400',
          view: 'bg-violet-500/20 text-violet-400',
        };
        return (
          <Badge className={actionColors[value as keyof typeof actionColors]}>
            {value}
          </Badge>
        );
      },
    },
    {
      key: 'module',
      label: 'Module',
      render: (value: string) => {
        const getIcon = (module: string) => {
          switch (module) {
            case 'Invoice':
              return FileText;
            case 'Product':
              return Package;
            case 'Payment':
              return CreditCard;
            case 'Customer':
            case 'Supplier':
              return User;
            case 'Settings':
              return AlertCircle;
            default:
              return Shield;
          }
        };
        const Icon = getIcon(value);
        return (
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-slate-400" />
            <span>{value}</span>
          </div>
        );
      },
    },
    { key: 'details', label: 'Details' },
    { key: 'ip', label: 'IP Address' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-slate-100">Audit Logs</h1>
        <p className="text-slate-400 mt-1">Track all system activities and user actions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {activitySummary.map((item, index) => (
          <Card key={index} className="bg-slate-900 border-slate-800 p-6">
            <p className="text-slate-400 text-sm">{item.action}</p>
            <h3 className={`text-2xl mt-2 ${item.color}`}>{item.count}</h3>
            <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
          </Card>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={auditLogsData}
        searchPlaceholder="Search audit logs..."
        onView={(row) => console.log('View', row)}
      />
    </div>
  );
}
