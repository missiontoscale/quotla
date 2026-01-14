'use client'

import { useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ModalProvider } from '@/contexts/ModalContext'
import { GlobalModalManager } from '@/components/modals/GlobalModalManager'
import { STORAGE_KEYS } from '@/lib/constants'

function ThemeInitializer() {
  useEffect(() => {
    // Initialize theme on mount
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')

    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
  }, [])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ModalProvider>
        <ThemeInitializer />
        {children}
        <GlobalModalManager />
      </ModalProvider>
    </AuthProvider>
  )
}
