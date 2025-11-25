'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import QuotlaChat from './QuotlaChat'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { profile } = useAuth()
  const [chatOpen, setChatOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Quotes', href: '/quotes' },
    { name: 'Invoices', href: '/invoices' },
    { name: 'Clients', href: '/clients' },
  ]

  if (profile?.is_admin) {
    navigation.push({ name: 'Admin', href: '/admin' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex">
      {/* Desktop: Left Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-primary-900 text-white">
        {/* Logo */}
        <div className="p-6 border-b border-primary-800">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center">
              <span className="text-primary-600 font-bold text-xl">Q</span>
            </div>
            <span className="text-2xl font-logo font-semibold">Quotla</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                pathname === item.href
                  ? 'bg-primary-700 text-white shadow-lg'
                  : 'text-primary-200 hover:bg-primary-800 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-primary-800">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-800 transition-colors"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover border-2 border-primary-700"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {profile?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-primary-300">Settings & Billing</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile: Top Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-primary-900 text-white z-40">
        <div className="flex items-center justify-between p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-primary-600 font-bold">Q</span>
            </div>
            <span className="text-xl font-logo font-semibold">Quotla</span>
          </Link>
          <Link href="/settings">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {profile?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </Link>
        </div>
        <div className="flex overflow-x-auto px-4 pb-2 gap-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                pathname === item.href
                  ? 'bg-primary-700 text-white'
                  : 'text-primary-200 hover:bg-primary-800'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto lg:mt-0 mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6">
                <span className="text-sm font-medium font-logo text-gray-900">Quotla</span>
                <Link href="/blog" className="text-sm text-gray-600 hover:text-primary-600">
                  Blog
                </Link>
                <Link href="/" className="text-sm text-gray-600 hover:text-primary-600">
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

      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary-600 text-white shadow-2xl hover:bg-primary-700 transition-all duration-300 animate-pulse-glow z-50 flex items-center justify-center group"
        title="Chat with Quotla AI"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-400 border-2 border-white"></span>
      </button>

      {chatOpen && <QuotlaChat onClose={() => setChatOpen(false)} />}
    </div>
  )
}
