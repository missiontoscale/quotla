'use client'

import { Home, TrendingUp, Package, Receipt, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  id: string
  label: string
  icon: typeof Home
  path: string
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/business/dashboard' },
  { id: 'sales', label: 'Sales', icon: TrendingUp, path: '/business/sales' },
  { id: 'inventory', label: 'Inventory', icon: Package, path: '/business/products' },
  { id: 'expenses', label: 'Expenses', icon: Receipt, path: '/business/expenses' },
  { id: 'admin', label: 'Admin', icon: Settings, path: '/business/admin' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-900 border-t border-slate-800 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path || pathname?.startsWith(item.path + '/')

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-2 py-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-violet-400'
                  : 'text-slate-400 active:text-slate-200'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-violet-400' : ''}`} />
              <span className={`text-[0.65rem] mt-1 ${isActive ? 'text-violet-400 font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
