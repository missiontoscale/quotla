'use client'

import { useState } from 'react'
import { Sidebar } from './dashboard/Sidebar'
import { TopBar } from './dashboard/TopBar'
import { BottomNav } from './dashboard/BottomNav'
import { ScrollArea } from './ui/scroll-area'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-dvh max-h-dvh w-full max-w-full overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
        <TopBar />
        <ScrollArea className="flex-1 min-h-0">
          <main className="p-4 md:p-6 pb-24 md:pb-12 max-w-full">
            {children}
          </main>
        </ScrollArea>
      </div>
      {/* Bottom nav - visible only on mobile */}
      <BottomNav />
    </div>
  )
}
