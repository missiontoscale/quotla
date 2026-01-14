'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'

/**
 * OnboardingCheck component
 * Checks if the user has completed onboarding and redirects them to /onboarding if not
 * This component should be included in protected pages that require onboarding
 */
export default function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [checking, setChecking] = useState(true)
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  // Paths that should skip onboarding check
  const skipPaths = ['/onboarding', '/auth', '/settings', '/']

  useEffect(() => {
    const checkOnboarding = async () => {
      // Skip if user is not authenticated
      if (!user) {
        setChecking(false)
        return
      }

      // Skip check for certain paths
      if (skipPaths.some(path => pathname?.startsWith(path))) {
        setChecking(false)
        setOnboardingComplete(true)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, company_name')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error checking onboarding status:', error)
          setChecking(false)
          return
        }

        const isComplete = data?.onboarding_completed || false

        setOnboardingComplete(isComplete)

        // Redirect to onboarding if not completed
        if (!isComplete && pathname !== '/onboarding') {
          router.push('/onboarding')
        }
      } catch (err) {
        console.error('Error in onboarding check:', err)
      } finally {
        setChecking(false)
      }
    }

    if (!loading) {
      checkOnboarding()
    }
  }, [user, loading, pathname, router])

  // Show loading state while checking
  if (loading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-orange-300 opacity-20"></div>
        </div>
      </div>
    )
  }

  // Don't render children if onboarding is not complete and we're redirecting
  if (!onboardingComplete && pathname !== '/onboarding' && !skipPaths.some(path => pathname?.startsWith(path))) {
    return null
  }

  return <>{children}</>
}
