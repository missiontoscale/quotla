'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    // If loading is finished, check authentication and authorization
    if (!loading) {
      if (!user) {
        // No user session, redirect to login with return path
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
        router.push(loginUrl)
      } else if (!profile?.is_admin) {
        // User is not an admin, redirect to dashboard
        console.warn('Admin access denied. User is not an admin.')
        router.replace('/dashboard')
      }
    }
  }, [user, profile, loading, router, pathname])

  // Show loading spinner while auth state is being determined.
  // We also wait for the profile to ensure the admin check doesn't flash
  // a dashboard redirect for a split second.
  if (loading || (!user && !loading) || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-700">
        <LoadingSpinner />
      </div>
    )
  }

  // If user is authenticated and is an admin, render the layout and children
  if (user && profile.is_admin) {
    return <DashboardLayout>{children}</DashboardLayout>
  }

  // Fallback, should ideally not be reached due to the useEffect redirect.
  // This helps prevent rendering children for a brief moment before redirect.
  return null
}
