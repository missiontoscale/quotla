/**
 * Navbar Navigation Data
 *
 * Centralized navbar navigation structure.
 * Eliminates hardcoded routes and duplicate menu items.
 */

import { ROUTES } from '@/lib/constants'

export interface NavLink {
  label: string
  href: string
  authRequired?: boolean // Only show for authenticated users
  guestOnly?: boolean // Only show for guests
  primary?: boolean // Primary CTA styling
  showIcon?: boolean // Show icon (for Create button)
}

// Guest navigation links
export const GUEST_NAV_LINKS: NavLink[] = [
  {
    label: 'About Quotla',
    href: ROUTES.ABOUT,
    guestOnly: true,
  },
  {
    label: 'Pricing',
    href: ROUTES.PRICING,
    guestOnly: true,
  },
  {
    label: 'Blog',
    href: ROUTES.BLOG,
    guestOnly: true,
  },
  {
    label: 'Sign In',
    href: ROUTES.LOGIN,
    guestOnly: true,
  },
  {
    label: 'Create',
    href: ROUTES.SIGNUP,
    guestOnly: true,
    primary: true,
    showIcon: true,
  },
]

// Authenticated user navigation links
export const AUTH_NAV_LINKS: NavLink[] = [
  {
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    authRequired: true,
  },
  {
    label: 'Blog',
    href: ROUTES.BLOG,
    authRequired: true,
  },
  {
    label: 'Pricing',
    href: ROUTES.PRICING,
    authRequired: true,
  },
  {
    label: 'Settings',
    href: ROUTES.SETTINGS,
    authRequired: true,
  },
]

export const NAVBAR_BRAND = {
  logo: '/images/logos/icons/Quotla full off white.svg',
  //name: 'Quotla',
  homeUrl: ROUTES.HOME,
}
