'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LayoutDashboard, FileText, Receipt, Users, Settings } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { profile } = useAuth()

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
    <div className="min-h-screen flex" style={{backgroundColor: '#0e1616'}}>
      {/* Desktop: Left Sidebar - Icon Only */}
      <aside className="hidden lg:flex lg:flex-col lg:w-20" style={{backgroundColor: '#1a1f1f', borderRight: '1px solid #2a2f2f'}}>
        {/* Logo */}
        <div className="p-4 flex justify-center" style={{borderBottom: '1px solid #2a2f2f'}}>
          <Link href="/dashboard" className="group">
            <img src="/images/logos/icons/Quotla icon off white.svg" alt="Quotla" className="h-10 w-10 transform group-hover:scale-110 transition-transform" />
          </Link>
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
                  className="flex items-center justify-center p-3 rounded-lg transition-all"
                  style={{
                    backgroundColor: isActive ? '#2a2f2f' : 'transparent',
                    color: isActive ? '#fffad6' : '#d1d5db'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#2a2f2f'
                      e.currentTarget.style.color = '#fffad6'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#d1d5db'
                    }
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.opacity = '0.7'
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                >
                  <Icon className="h-7 w-7 flex-shrink-0" />
                </Link>
                {/* Tooltip on hover */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs rounded-md whitespace-nowrap shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{backgroundColor: '#2a2f2f', color: '#fffad6'}}>
                  {item.name}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{borderRightColor: '#2a2f2f'}}></div>
                </div>
              </div>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-3" style={{borderTop: '1px solid #2a2f2f'}}>
          <Link
            href="/settings"
            className="flex items-center justify-center p-3 rounded-lg transition-colors group"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2a2f2f'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.opacity = '0.7'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover"
                style={{border: '2px solid #445642'}}
              />
            ) : (
              <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{backgroundColor: '#445642'}}>
                <span className="text-sm font-semibold" style={{color: '#fffad6'}}>
                  {profile?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-3 py-1.5 text-xs rounded-md whitespace-nowrap shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{backgroundColor: '#2a2f2f', color: '#fffad6'}}>
              Settings & Billing
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{borderRightColor: '#2a2f2f'}}></div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile: Top Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40" style={{backgroundColor: '#1a1f1f', color: '#fffad6'}}>
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
                  className="h-8 w-8 rounded-full object-cover"
                  style={{border: '2px solid #445642'}}
                />
              ) : (
                <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#445642'}}>
                  <span className="text-xs font-semibold" style={{color: '#fffad6'}}>
                    {profile?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 py-2 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200" style={{backgroundColor: '#2a2f2f'}}>
              <div className="px-4 py-2 border-b" style={{borderColor: '#445642'}}>
                <p className="text-xs font-semibold" style={{color: '#fffad6'}}>{profile?.email}</p>
                {profile?.company_name && (
                  <p className="text-xs" style={{color: '#d1d5db'}}>{profile.company_name}</p>
                )}
              </div>
              <Link href="/settings" className="block px-4 py-2 text-sm transition-colors" style={{color: '#d1d5db'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#445642'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                Settings
              </Link>
              <Link href="/billing" className="block px-4 py-2 text-sm transition-colors" style={{color: '#d1d5db'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#445642'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
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
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap"
                style={{
                  backgroundColor: isActive ? '#2a2f2f' : 'transparent',
                  color: isActive ? '#fffad6' : '#d1d5db'
                }}
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
        <footer className="mt-12" style={{backgroundColor: '#1a1f1f', borderTop: '1px solid #2a2f2f'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6">
                <span className="text-sm font-medium font-logo" style={{color: '#fffad6'}}>Quotla</span>
                <Link href="/blog" className="text-sm transition-colors" style={{color: '#d1d5db'}} onMouseEnter={(e) => e.currentTarget.style.color = '#ce6203'} onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Blog
                </Link>
                <Link href="/" className="text-sm transition-colors" style={{color: '#d1d5db'}} onMouseEnter={(e) => e.currentTarget.style.color = '#ce6203'} onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Home
                </Link>
              </div>
              <div className="text-sm" style={{color: '#9ca3af'}}>
                &copy; {new Date().getFullYear()} Quotla. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </main>

    </div>
  )
}
