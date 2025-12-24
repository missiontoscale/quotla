/**
 * useAuthRequired Hook
 *
 * Custom hook for handling authentication requirements and redirects.
 * Consolidates duplicate auth checking logic across protected pages.
 *
 * Usage:
 * const { checkAuth, requireAuth } = useAuthRequired()
 *
 * // Simple check
 * if (!checkAuth()) return
 *
 * // With redirect
 * if (!requireAuth({
 *   redirectTo: '/login',
 *   message: 'Please sign in to continue',
 *   saveRedirect: true
 * })) return
 */

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES, STORAGE_KEYS, AUTH_MESSAGES } from '@/lib/constants'

export interface RequireAuthOptions {
  redirectTo?: string
  message?: string
  saveRedirect?: boolean
  onUnauthenticated?: () => void
}

export function useAuthRequired() {
  const router = useRouter()
  const { user, loading } = useAuth()

  /**
   * Simple check if user is authenticated
   * @returns true if authenticated, false otherwise
   */
  const checkAuth = (): boolean => {
    return !!user
  }

  /**
   * Require authentication with redirect and message handling
   * @param options Configuration for auth requirement
   * @returns true if authenticated, false if redirected
   */
  const requireAuth = (options: RequireAuthOptions = {}): boolean => {
    const {
      redirectTo = ROUTES.LOGIN,
      message = AUTH_MESSAGES.AUTHENTICATION_REQUIRED,
      saveRedirect = true,
      onUnauthenticated,
    } = options

    // User is authenticated
    if (user) {
      return true
    }

    // User is not authenticated - handle redirect
    if (typeof window !== 'undefined' && saveRedirect) {
      // Save current path to redirect back after login
      localStorage.setItem(STORAGE_KEYS.REDIRECT_AFTER_AUTH, window.location.pathname)
    }

    // Call custom handler if provided
    if (onUnauthenticated) {
      onUnauthenticated()
    }

    // Redirect to login/signup
    router.push(redirectTo)

    return false
  }

  /**
   * Check authentication status and show loading if needed
   * Useful for page-level authentication checks
   */
  const getAuthStatus = () => {
    return {
      isAuthenticated: !!user,
      isLoading: loading,
      user,
    }
  }

  /**
   * Save redirect path to localStorage
   * Useful for multi-step flows
   */
  const saveRedirectPath = (path?: string) => {
    if (typeof window !== 'undefined') {
      const redirectPath = path || window.location.pathname
      localStorage.setItem(STORAGE_KEYS.REDIRECT_AFTER_AUTH, redirectPath)
    }
  }

  /**
   * Get saved redirect path and clear it
   */
  const getAndClearRedirectPath = (): string | null => {
    if (typeof window === 'undefined') return null

    const redirectPath = localStorage.getItem(STORAGE_KEYS.REDIRECT_AFTER_AUTH)
    if (redirectPath) {
      localStorage.removeItem(STORAGE_KEYS.REDIRECT_AFTER_AUTH)
      return redirectPath
    }
    return null
  }

  /**
   * Redirect to saved path or default
   */
  const redirectToSaved = (defaultPath: string = ROUTES.DASHBOARD) => {
    const savedPath = getAndClearRedirectPath()
    router.push(savedPath || defaultPath)
  }

  return {
    // State
    user,
    isAuthenticated: !!user,
    isLoading: loading,

    // Methods
    checkAuth,
    requireAuth,
    getAuthStatus,
    saveRedirectPath,
    getAndClearRedirectPath,
    redirectToSaved,
  }
}

export default useAuthRequired
