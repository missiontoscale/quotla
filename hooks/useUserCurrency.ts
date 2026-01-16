'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { DEFAULT_CURRENCY, setUserCurrency } from '@/lib/utils/currency'

/**
 * Hook to get the user's default currency from their profile.
 * This is the source of truth for currency in the app.
 * Also syncs the currency to localStorage for backward compatibility.
 *
 * @returns Object containing:
 *  - currency: The user's default currency code
 *  - loading: Whether the profile is still loading
 *  - isAuthenticated: Whether the user is logged in
 */
export function useUserCurrency() {
  const { profile, loading: authLoading } = useAuth()
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY)

  useEffect(() => {
    if (profile?.default_currency) {
      setCurrency(profile.default_currency)
      // Sync to localStorage for backward compatibility with components
      // that haven't been updated yet
      setUserCurrency(profile.default_currency)
    }
  }, [profile?.default_currency])

  return {
    currency,
    loading: authLoading,
    isAuthenticated: !!profile,
  }
}

/**
 * Hook to get user's currency with an optional display currency override.
 * Useful for pages that allow users to view amounts in a different currency.
 *
 * @returns Object containing:
 *  - userCurrency: The user's profile default currency (for storage/calculations)
 *  - displayCurrency: The currently selected display currency
 *  - setDisplayCurrency: Function to change the display currency
 *  - isConverted: Whether display differs from user's default
 *  - loading: Whether the profile is still loading
 */
export function useDisplayCurrency() {
  const { currency: userCurrency, loading } = useUserCurrency()
  const [displayCurrency, setDisplayCurrency] = useState<string>(userCurrency)

  // Update display currency when user currency loads/changes
  useEffect(() => {
    if (!loading && userCurrency) {
      setDisplayCurrency(userCurrency)
    }
  }, [userCurrency, loading])

  const isConverted = displayCurrency !== userCurrency

  return {
    userCurrency,
    displayCurrency,
    setDisplayCurrency,
    isConverted,
    loading,
  }
}
