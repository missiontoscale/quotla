'use client'

import {
  Home,
  TrendingUp,
  Package,
  Receipt,
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

interface MenuItem {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/business/dashboard' },
  { id: 'sales', label: 'Sales', icon: TrendingUp, path: '/business/sales' },
  { id: 'inventory', label: 'Inventory', icon: Package, path: '/business/products' },
  { id: 'expenses', label: 'Expenses', icon: Receipt, path: '/business/expenses' },
];

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={`bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/business/dashboard" className="flex items-center">
          {collapsed ? (
            <img
              src="/images/logos/icons/Quotla icon off white.svg"
              alt="Quotla"
              className="h-7 w-7"
            />
          ) : (
            <img
              src="/images/logos/icons/Quotla full off white.svg"
              alt="Quotla"
              className="h-9 w-auto"
            />
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 h-8 w-8"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </Button>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-1">
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
        </div>
      </nav>
    </div>
  );
}
