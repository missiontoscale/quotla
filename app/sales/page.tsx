'use client'

import { useState, useEffect } from 'react';
import { ArrowUp, DollarSign, ShoppingCart } from 'lucide-react';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';

export default function SalesPage() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    salesCount: 0,
    averageSale: 0
  });

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual sales data fetch from Supabase
      // const { data, error } = await supabase.from('sales').select('*');
      // if (error) throw error;
      // setSalesData(data || []);

      // For now, set empty data
      setSalesData([]);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'customer', label: 'Customer' },
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
        <span className="text-slate-200">{value}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number) => (
        <span className="text-emerald-400">${value.toFixed(2)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const colors = {
          completed: 'bg-emerald-500/20 text-emerald-400',
          pending: 'bg-amber-500/20 text-amber-400',
          cancelled: 'bg-rose-500/20 text-rose-400',
        };
        return (
          <Badge className={colors[value as keyof typeof colors] || colors.pending}>
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
          <h1 className="text-3xl text-slate-100">Sales</h1>
          <p className="text-slate-400 mt-1">Track your sales transactions and revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Sales (Today)</p>
              <h3 className="text-2xl text-slate-100 mt-1">${stats.totalSales.toFixed(2)}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Sales Count (Today)</p>
              <h3 className="text-2xl text-slate-100 mt-1">{stats.salesCount}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Average Sale</p>
              <h3 className="text-2xl text-slate-100 mt-1">${stats.averageSale.toFixed(2)}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <ArrowUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={salesData}
        searchPlaceholder="Search sales..."
        onView={(row) => console.log('View', row)}
      />
    </div>
  );
}
