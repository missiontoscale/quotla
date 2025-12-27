'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LayoutDashboard, FileText, Receipt, Users, Settings } from 'lucide-react'
import FloatingChatButton from './FloatingChatButton'
import { STORAGE_KEYS } from '@/lib/constants'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { profile } = useAuth()
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded)
  }

  // Only show floating chat button on non-dashboard pages
  const showFloatingChat = pathname !== '/dashboard'

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Quotes', href: '/quotes', icon: FileText },
    { name: 'Invoices', href: '/invoices', icon: Receipt },
    { name: 'Clients', href: '/clients', icon: Users },
  ]

  if (profile?.is_admin) {
    navigation.push({ name: 'Admin', href: '/admin', icon: Settings })
  }

  return (
    <div className="min-h-screen flex bg-primary-800">
      {/* Desktop: Left Sidebar - Expandable */}
      <aside className={`hidden lg:flex lg:flex-col transition-all duration-300 bg-primary-700 border-r border-primary-600 ${sidebarExpanded ? 'lg:w-64' : 'lg:w-20'}`}>
        {/* Logo & Toggle */}
        <div className="p-4 flex items-center justify-between border-b border-primary-600">
          <Link href="/dashboard" className={`group ${sidebarExpanded ? '' : 'mx-auto'}`}>
            <img src="/images/logos/icons/Quotla icon off white.svg" alt="Quotla" className="h-10 w-10 transform group-hover:scale-110 transition-transform" />
          </Link>
          {sidebarExpanded && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-primary-600 text-gray-400 hover:text-primary-50 transition-all"
              aria-label="Collapse sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-3">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className={`flex items-center ${sidebarExpanded ? 'justify-start gap-3 px-4' : 'justify-center'} p-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-600 text-primary-50'
                      : 'text-gray-400 hover:bg-primary-600 hover:text-primary-50 active:opacity-70'
                  }`}
                >
                  <Icon className="h-6 w-6 flex-shrink-0" />
                  {sidebarExpanded && <span className="text-sm font-medium">{item.name}</span>}
                </Link>
                {/* Tooltip on hover - only show when collapsed */}
                {!sidebarExpanded && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs rounded-md whitespace-nowrap shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-primary-600 text-primary-50">
                    {item.name}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-primary-600"></div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Bottom Section: Expand Button (when collapsed), Theme Toggle & Profile */}
        <div className="border-t border-primary-600">
          {/* Expand Button - only visible when collapsed */}
          {!sidebarExpanded && (
            <div className="p-3">
              <button
                onClick={toggleSidebar}
                className="flex items-center justify-center p-3 rounded-lg transition-all hover:bg-primary-600 text-gray-400 hover:text-primary-50 active:opacity-70 group w-full"
                aria-label="Expand sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-3 py-1.5 text-xs rounded-md whitespace-nowrap shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-primary-600 text-primary-50">
                  Expand Menu
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-primary-600"></div>
                </div>
              </button>
            </div>
          )}

          {/* User Profile */}
          <div className="p-3">
            <Link
              href="/settings"
              className={`flex items-center ${sidebarExpanded ? 'justify-start gap-3 px-4' : 'justify-center'} p-3 rounded-lg transition-all hover:bg-primary-600 active:opacity-70 group`}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover border-2 border-quotla-green flex-shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-quotla-green flex-shrink-0">
                  <span className="text-sm font-semibold text-quotla-light">
                    {profile?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              {sidebarExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary-50 truncate">{profile?.email}</p>
                  <p className="text-xs text-gray-400">Settings</p>
                </div>
              )}
              {/* Tooltip - only show when collapsed */}
              {!sidebarExpanded && (
                <div className="absolute left-full ml-2 px-3 py-1.5 text-xs rounded-md whitespace-nowrap shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-primary-600 text-primary-50">
                  Settings & Billing
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-primary-600"></div>
                </div>
              )}
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile: Top Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-primary-700 text-primary-50">
        <div className="flex items-center justify-between p-4">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <img src="/images/logos/icons/Quotla icon off white.svg" alt="Quotla" className="h-10 w-10 transform group-hover:scale-105 transition-transform" />
          </Link>

          {/* Profile with Dropdown */}
          <div className="relative group">
            <button className="focus:outline-none">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover border-2 border-quotla-green"
                />
              ) : (
                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-quotla-green">
                  <span className="text-xs font-semibold text-quotla-light">
                    {profile?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 py-2 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-primary-600">
              <div className="px-4 py-2 border-b border-quotla-green">
                <p className="text-xs font-semibold text-primary-50">{profile?.email}</p>
                {profile?.company_name && (
                  <p className="text-xs text-gray-400">{profile.company_name}</p>
                )}
              </div>
              <Link href="/settings" className="block px-4 py-2 text-sm transition-colors text-gray-400 hover:bg-quotla-green">
                Settings
              </Link>
              <Link href="/billing" className="block px-4 py-2 text-sm transition-colors text-gray-400 hover:bg-quotla-green">
                Billing
              </Link>
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto px-4 pb-2 gap-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-primary-600 text-primary-50'
                    : 'text-gray-400'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto lg:mt-0 mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>

        {/* Footer */}
        <footer className="mt-12 bg-primary-700 border-t border-primary-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6">
                <span className="text-sm font-medium font-logo text-primary-50">Quotla</span>
                <Link href="/blog" className="text-sm transition-colors text-gray-400 hover:text-quotla-orange">
                  Blog
                </Link>
                <Link href="/" className="text-sm transition-colors text-gray-400 hover:text-quotla-orange">
                  Home
                </Link>
              </div>
              <div className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Quotla. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Floating Chat Button for non-dashboard pages */}
      {showFloatingChat && <FloatingChatButton />}
    </div>
  )
}
