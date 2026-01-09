import { Card } from '../ui/card';
import { DataTable } from '../DataTable';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const accountsData = [
  { id: 1, code: '1000', name: 'Cash', type: 'Asset', balance: '$45,230', category: 'Current Assets' },
  { id: 2, code: '1100', name: 'Accounts Receivable', type: 'Asset', balance: '$68,450', category: 'Current Assets' },
  { id: 3, code: '1200', name: 'Inventory', type: 'Asset', balance: '$186,200', category: 'Current Assets' },
  { id: 4, code: '2000', name: 'Accounts Payable', type: 'Liability', balance: '$32,180', category: 'Current Liabilities' },
  { id: 5, code: '3000', name: 'Owner Equity', type: 'Equity', balance: '$250,000', category: 'Equity' },
  { id: 6, code: '4000', name: 'Sales Revenue', type: 'Revenue', balance: '$328,500', category: 'Revenue' },
  { id: 7, code: '5000', name: 'Cost of Goods Sold', type: 'Expense', balance: '$182,300', category: 'Cost of Sales' },
];

const journalEntriesData = [
  { id: 1, date: '2025-11-01', reference: 'JE-001', description: 'Sales - Invoice INV-2025-001', debit: 'Accounts Receivable', credit: 'Sales Revenue', amount: '$5,450' },
  { id: 2, date: '2025-10-31', reference: 'JE-002', description: 'Payment received - ABC Corp', debit: 'Cash', credit: 'Accounts Receivable', amount: '$3,680' },
  { id: 3, date: '2025-10-31', reference: 'JE-003', description: 'Inventory Purchase - PO-2025-101', debit: 'Inventory', credit: 'Accounts Payable', amount: '$15,600' },
  { id: 4, date: '2025-10-30', reference: 'JE-004', description: 'Cost of goods sold - INV-2025-003', debit: 'COGS', credit: 'Inventory', amount: '$8,200' },
];

export function Accounts() {
  const accountColumns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Account Name' },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => {
        const typeColors: Record<string, string> = {
          Asset: 'bg-emerald-500/20 text-emerald-400',
          Liability: 'bg-rose-500/20 text-rose-400',
          Equity: 'bg-violet-500/20 text-violet-400',
          Revenue: 'bg-cyan-500/20 text-cyan-400',
          Expense: 'bg-amber-500/20 text-amber-400',
        };
        return <Badge className={typeColors[value]}>{value}</Badge>;
      },
    },
    { key: 'category', label: 'Category' },
    { key: 'balance', label: 'Balance' },
  ];

  const journalColumns = [
    { key: 'date', label: 'Date' },
    { key: 'reference', label: 'Reference' },
    { key: 'description', label: 'Description' },
    { key: 'debit', label: 'Debit Account' },
    { key: 'credit', label: 'Credit Account' },
    { key: 'amount', label: 'Amount' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-slate-100">Accounts & Journal</h1>
        <p className="text-slate-400 mt-1">Manage chart of accounts and journal entries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Total Assets</p>
          <h3 className="text-2xl text-slate-100 mt-2">$299,880</h3>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Total Liabilities</p>
          <h3 className="text-2xl text-slate-100 mt-2">$32,180</h3>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Total Equity</p>
          <h3 className="text-2xl text-slate-100 mt-2">$250,000</h3>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Net Income</p>
          <h3 className="text-2xl text-slate-100 mt-2">$146,200</h3>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="accounts" className="data-[state=active]:bg-slate-800">
            Chart of Accounts
          </TabsTrigger>
          <TabsTrigger value="journal" className="data-[state=active]:bg-slate-800">
            Journal Entries
          </TabsTrigger>
        </TabsList>
        <TabsContent value="accounts" className="mt-6">
          <DataTable
            columns={accountColumns}
            data={accountsData}
            searchPlaceholder="Search accounts..."
            onView={(row) => console.log('View', row)}
            onEdit={(row) => console.log('Edit', row)}
          />
        </TabsContent>
        <TabsContent value="journal" className="mt-6">
          <DataTable
            columns={journalColumns}
            data={journalEntriesData}
            searchPlaceholder="Search journal entries..."
            onView={(row) => console.log('View', row)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
