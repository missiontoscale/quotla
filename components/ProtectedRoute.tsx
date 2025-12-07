'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
      router.push(loginUrl)
    }
  }, [user, loading, router, pathname])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
