'use client'

import { useState } from 'react'
import {
  Heart,
  LayoutGrid,
  ShoppingCart,
  FileText,
  Receipt,
  Package,
  Users,
  File,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  onQuotlaClick?: () => void
}

interface SubItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
}

interface MainItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path?: string
  onClick?: () => void
  subItems?: SubItem[]
}

const recordsSubItems: SubItem[] = [
  { id: 'sales', label: 'Sales', icon: ShoppingCart, path: '/business/sales' },
  { id: 'invoices', label: 'Invoices', icon: FileText, path: '/business/invoices' },
  { id: 'expenses', label: 'Expenses', icon: Receipt, path: '/business/expenses' },
  { id: 'inventory', label: 'Inventory', icon: Package, path: '/business/products' },
  { id: 'customers', label: 'Customers', icon: Users, path: '/business/customers' },
  { id: 'documents', label: 'Documents', icon: File, path: '/business/documents' },
]

function DiamondIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L22 12L12 22L2 12Z" />
    </svg>
  )
}

function isActivePath(pathname: string | null, path: string): boolean {
  if (!pathname) return false
  return pathname === path || pathname.startsWith(path + '/')
}

export function Sidebar({ collapsed, onToggleCollapse, onQuotlaClick }: SidebarProps) {
  const pathname = usePathname()
  const [recordsOpen, setRecordsOpen] = useState(true)

  const mainItems: MainItem[] = [
    {
      id: 'health',
      label: 'Health',
      icon: Heart,
      path: '/business/dashboard',
    },
    {
      id: 'quotla',
      label: 'Quotla',
      icon: DiamondIcon,
      onClick: onQuotlaClick,
    },
    {
      id: 'records',
      label: 'Records',
      icon: LayoutGrid,
      subItems: recordsSubItems,
    },
  ]

  return (
    <div
      className={`bg-primary-700 border-r border-primary-600 flex flex-col h-full overflow-hidden transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-3.5 border-b border-primary-600 flex items-center justify-between">
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
          className="text-primary-400 hover:text-primary-50 hover:bg-primary-700/80 h-8 w-8"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </Button>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-1">
          {mainItems.map((item) => {
            const Icon = item.icon
            const isActive = item.path ? isActivePath(pathname, item.path) : false

            if (item.id === 'records' && item.subItems) {
              const hasActiveSub = item.subItems.some((s) => isActivePath(pathname, s.path))
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => !collapsed && setRecordsOpen((prev) => !prev)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all ${
                      hasActiveSub
                        ? 'bg-quotla-orange/15 text-quotla-orange border border-quotla-orange/30'
                        : 'text-primary-400 hover:text-primary-50 hover:bg-primary-700/80'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="text-[0.81rem] flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            recordsOpen ? 'rotate-0' : '-rotate-90'
                          }`}
                        />
                      </>
                    )}
                  </button>
                  {!collapsed && recordsOpen && (
                    <div className="ml-2 mt-0.5 space-y-0.5 border-l border-primary-600 pl-2">
                      {item.subItems.map((sub) => {
                        const SubIcon = sub.icon
                        const isSubActive = isActivePath(pathname, sub.path)
                        return (
                          <Link
                            key={sub.id}
                            href={sub.path}
                            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all text-[0.81rem] ${
                              isSubActive
                                ? 'bg-quotla-orange/15 text-quotla-orange border border-quotla-orange/30'
                                : 'text-primary-400 hover:text-primary-50 hover:bg-primary-700/80'
                            }`}
                          >
                            <SubIcon className="w-4 h-4 flex-shrink-0" />
                            <span>{sub.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            if (item.onClick) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all ${
                    'text-primary-400 hover:text-primary-50 hover:bg-primary-700/80'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                  {!collapsed && <span className="text-[0.81rem]">{item.label}</span>}
                </button>
              )
            }

            return (
              <Link
                key={item.id}
                href={item.path!}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-quotla-orange/15 text-quotla-orange border border-quotla-orange/30'
                    : 'text-primary-400 hover:text-primary-50 hover:bg-primary-700/80'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                {!collapsed && <span className="text-[0.81rem]">{item.label}</span>}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
