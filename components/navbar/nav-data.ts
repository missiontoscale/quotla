/**
 * Navbar Navigation Data
 *
 * Centralized navbar navigation structure with enhanced dropdowns.
 * Eliminates hardcoded routes and duplicate menu items.
 */

import { ROUTES } from '@/lib/constants'

export interface SubNavLink {
  label: string
  href: string
  description?: string
  icon?: string
}

export interface NavLink {
  label: string
  href: string
  authRequired?: boolean // Only show for authenticated users
  guestOnly?: boolean // Only show for guests
  primary?: boolean // Primary CTA styling
  showIcon?: boolean // Show icon (for Create button)
  hasDropdown?: boolean // Has dropdown menu
  dropdownItems?: SubNavLink[] // Dropdown items
}

// Guest navigation links with enhanced structure
export const GUEST_NAV_LINKS: NavLink[] = [
  {
    label: 'Solutions',
    href: '#',
    guestOnly: true,
    hasDropdown: true,
    dropdownItems: [
      {
        label: 'For Business Owners',
        href: '/for-business',
        description: 'Complete toolkit for running your business'
      },
      {
        label: 'For Contractors',
        href: '/for-contractors',
        description: 'Built for freelancers and independent pros'
      },
      {
        label: 'For Small Business',
        href: '/solutions',
        description: 'Scale your operations efficiently'
      },
      {
        label: 'For Agencies',
        href: '/solutions',
        description: 'Manage multiple clients seamlessly'
      },
    ]
  },
  {
    label: 'Features',
    href: '#',
    guestOnly: true,
    hasDropdown: true,
    dropdownItems: [
      {
        label: 'AI Quote Generation',
        href: '/#features',
        description: 'Create quotes in seconds'
      },
      {
        label: 'Inventory Tracking',
        href: '/#features',
        description: 'Manage stock and products'
      },
      {
        label: 'Multi-Currency',
        href: '/#features',
        description: 'Work globally with ease'
      },
      {
        label: 'Client Portal',
        href: '/#features',
        description: 'Centralized client management'
      },
    ]
  },
  {
    label: 'Resources',
    href: '#',
    guestOnly: true,
    hasDropdown: true,
    dropdownItems: [
      {
        label: 'Blog',
        href: ROUTES.BLOG,
        description: 'Tips, guides, and insights'
      },
      {
        label: 'About Us',
        href: ROUTES.ABOUT,
        description: 'Our story and mission'
      },
      {
        label: 'Help & Contact',
        href: ROUTES.ABOUT,
        description: 'Get support and answers'
      },
    ]
  },
  {
    label: 'Pricing',
    href: ROUTES.PRICING,
    guestOnly: true,
  },
  {
    label: 'Sign In',
    href: ROUTES.LOGIN,
    guestOnly: true,
  },
  {
    label: 'Get Started',
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
    href: '/business/dashboard',
    authRequired: true,
  },
  {
    label: 'For Business',
    href: '#',
    authRequired: true,
    hasDropdown: true,
    dropdownItems: [
      {
        label: 'Sales & Quotes',
        href: '/business/sales',
        description: 'Customers & quotes'
      },
      {
        label: 'Products',
        href: '/business/products',
        description: 'Track products & stock'
      },
      {
        label: 'Expenses',
        href: '/business/expenses',
        description: 'Track expenses & vendors'
      },
    ]
  },
  {
    label: 'Resources',
    href: '#',
    authRequired: true,
    hasDropdown: true,
    dropdownItems: [
      {
        label: 'Blog',
        href: ROUTES.BLOG,
        description: 'Tips & best practices'
      },
      {
        label: 'Community',
        href: ROUTES.COMMUNITY,
        description: 'Connect with peers'
      },
    ]
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
