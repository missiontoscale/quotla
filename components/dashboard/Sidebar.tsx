'use client'

import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  ArrowLeftRight,
  FileText,
  ShoppingCart,
  CreditCard,
  BookOpen,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/business/dashboard' },
  { id: 'customers', label: 'Customers', icon: Users, path: '/business/customers' },
  { id: 'suppliers', label: 'Suppliers', icon: Truck, path: '/business/suppliers' },
  { id: 'products', label: 'Products', icon: Package, path: '/business/products' },
  { id: 'stock', label: 'Stock Movements', icon: ArrowLeftRight, path: '/business/stock-movements' },
  { id: 'invoices', label: 'Invoices', icon: FileText, path: '/business/invoices' },
  { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart, path: '/business/purchase-orders' },
  { id: 'payments', label: 'Payments', icon: CreditCard, path: '/business/payments' },
  { id: 'accounts', label: 'Accounts', icon: BookOpen, path: '/business/accounts' },
  { id: 'audit', label: 'Audit Logs', icon: Shield, path: '/business/audit' },
];

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={`bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <Link href="/business/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Package className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-[0.97rem]">Quotla</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 h-8 w-8"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
          return (
            <Link
              key={item.id}
              href={item.path}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              {!collapsed && <span className="text-[0.81rem]">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
