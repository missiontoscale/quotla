'use client'

import { useState } from 'react'
import { Heart, LayoutGrid } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface BottomNavProps {
  onQuotlaClick?: () => void
  onRecordsClick?: () => void
  isQuotlaActive?: boolean
  isRecordsActive?: boolean
}

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

export function BottomNav({
  onQuotlaClick,
  onRecordsClick,
  isQuotlaActive: externalQuotlaActive,
  isRecordsActive: externalRecordsActive,
}: BottomNavProps = {}) {
  const pathname = usePathname()
  const [localQuotlaActive, setLocalQuotlaActive] = useState(false)
  const [localRecordsActive, setLocalRecordsActive] = useState(false)

  const isQuotlaActive = externalQuotlaActive ?? localQuotlaActive
  const isRecordsActive = externalRecordsActive ?? localRecordsActive

  const handleQuotlaClick = () => {
    setLocalQuotlaActive((prev) => !prev)
    onQuotlaClick?.()
  }

  const handleRecordsClick = () => {
    setLocalRecordsActive((prev) => !prev)
    onRecordsClick?.()
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-primary-700 border-t border-primary-600 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/business/dashboard"
              className="flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-2 py-1 rounded-lg transition-colors text-primary-400 active:text-primary-200"
              aria-label="Business Health"
            >
              <Heart
                className={`w-6 h-6 ${pathname === '/business/dashboard' || pathname?.startsWith('/business/dashboard/') ? 'text-quotla-orange fill-current' : ''}`}
              />
              <span
                className={`text-[0.65rem] mt-1 ${pathname === '/business/dashboard' || pathname?.startsWith('/business/dashboard/') ? 'text-quotla-orange font-medium' : ''}`}
              >
                Health
              </span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top">Business Health</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleQuotlaClick}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-2 py-1 rounded-lg transition-colors ${
                isQuotlaActive ? 'text-quotla-orange' : 'text-primary-400 active:text-primary-200'
              }`}
              aria-label="Quotla quick actions"
            >
              <DiamondIcon
                className={`w-6 h-6 ${isQuotlaActive ? 'fill-current' : ''}`}
              />
              <span
                className={`text-[0.65rem] mt-1 ${isQuotlaActive ? 'text-quotla-orange font-medium' : ''}`}
              >
                Quotla
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Quick actions</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleRecordsClick}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-2 py-1 rounded-lg transition-colors ${
                isRecordsActive ? 'text-quotla-orange' : 'text-primary-400 active:text-primary-200'
              }`}
              aria-label="Records"
            >
              <LayoutGrid
                className={`w-6 h-6 ${isRecordsActive ? 'fill-current' : ''}`}
              />
              <span
                className={`text-[0.65rem] mt-1 ${isRecordsActive ? 'text-quotla-orange font-medium' : ''}`}
              >
                Records
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Records</TooltipContent>
        </Tooltip>
      </div>
    </nav>
  )
}
