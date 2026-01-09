import { DollarSign, Package, AlertCircle, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { StatCard } from '../StatCard';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const salesData = [
  { month: 'Jan', sales: 45000, purchases: 32000 },
  { month: 'Feb', sales: 52000, purchases: 35000 },
  { month: 'Mar', sales: 48000, purchases: 30000 },
  { month: 'Apr', sales: 61000, purchases: 42000 },
  { month: 'May', sales: 55000, purchases: 38000 },
  { month: 'Jun', sales: 67000, purchases: 45000 },
];

const categoryData = [
  { name: 'Electronics', value: 35 },
  { name: 'Furniture', value: 25 },
  { name: 'Clothing', value: 20 },
  { name: 'Food', value: 15 },
  { name: 'Other', value: 5 },
];

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const recentActivity = [
  { id: 1, type: 'sale', description: 'Invoice #1234 created', amount: '$1,250', time: '10 mins ago' },
  { id: 2, type: 'purchase', description: 'Purchase Order #5678', amount: '$3,400', time: '25 mins ago' },
  { id: 3, type: 'payment', description: 'Payment received from ABC Corp', amount: '$2,100', time: '1 hour ago' },
  { id: 4, type: 'stock', description: 'Stock updated: Product #9876', amount: '+150 units', time: '2 hours ago' },
];

const lowStockItems = [
  { id: 1, name: 'Wireless Mouse', sku: 'WM-001', current: 12, minimum: 50, status: 'critical' },
  { id: 2, name: 'USB Cable', sku: 'UC-045', current: 28, minimum: 100, status: 'critical' },
  { id: 3, name: 'Keyboard', sku: 'KB-023', current: 45, minimum: 75, status: 'warning' },
  { id: 4, name: 'Monitor Stand', sku: 'MS-012', current: 18, minimum: 30, status: 'warning' },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl text-slate-100">Dashboard Overview</h1>
        <div className="text-sm text-slate-400">Last updated: {new Date().toLocaleString()}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value="$328,500"
          change="+12.5% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="from-violet-400 to-purple-500"
        />
        <StatCard
          title="Stock Value"
          value="$186,200"
          change="+5.2% from last month"
          changeType="positive"
          icon={Package}
          iconColor="from-cyan-400 to-blue-500"
        />
        <StatCard
          title="Outstanding Payments"
          value="$45,800"
          change="-8.1% from last month"
          changeType="positive"
          icon={AlertCircle}
          iconColor="from-amber-400 to-orange-500"
        />
        <StatCard
          title="Active Customers"
          value="1,245"
          change="+18 new this month"
          changeType="positive"
          icon={Users}
          iconColor="from-emerald-400 to-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <h3 className="text-lg text-slate-100 mb-4">Sales & Purchases Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} />
              <Line type="monotone" dataKey="purchases" stroke="#06b6d4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <h3 className="text-lg text-slate-100 mb-4">Inventory by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <h3 className="text-lg text-slate-100 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start justify-between py-3 border-b border-slate-800 last:border-0">
                <div className="flex-1">
                  <p className="text-slate-200 text-sm">{activity.description}</p>
                  <p className="text-slate-500 text-xs mt-1">{activity.time}</p>
                </div>
                <span className="text-violet-400">{activity.amount}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <h3 className="text-lg text-slate-100 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            Low Stock Alerts
          </h3>
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div key={item.id} className="p-3 bg-slate-800 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-slate-200 text-sm">{item.name}</p>
                    <p className="text-slate-500 text-xs">SKU: {item.sku}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      item.status === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Current: {item.current}</span>
                  <span>•</span>
                  <span>Min: {item.minimum}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
