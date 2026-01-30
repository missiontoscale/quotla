/**
 * useGreeting Hook
 *
 * Returns a time-appropriate greeting based on the current hour.
 * Used by TopBar (mobile) and Dashboard page (desktop).
 */

export function useGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default useGreeting
