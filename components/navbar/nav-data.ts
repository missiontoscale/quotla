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
        label: 'For Freelancers',
        href: '/solutions/freelancers',
        description: 'Perfect for independent professionals'
      },
      {
        label: 'For Small Business',
        href: '/solutions/small-business',
        description: 'Scale your operations efficiently'
      },
      {
        label: 'For Agencies',
        href: '/solutions/agencies',
        description: 'Manage multiple clients seamlessly'
      },
      {
        label: 'For Consultants',
        href: '/solutions/consultants',
        description: 'Professional tools for experts'
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
        href: '/features/ai-quotes',
        description: 'Create quotes in seconds'
      },
      {
        label: 'Invoice Management',
        href: '/features/invoices',
        description: 'Track payments effortlessly'
      },
      {
        label: 'Inventory Tracking',
        href: '/features/inventory',
        description: 'Manage stock and products'
      },
      {
        label: 'Multi-Currency',
        href: '/features/multi-currency',
        description: 'Work globally with ease'
      },
      {
        label: 'Client Portal',
        href: '/features/client-portal',
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
        label: 'Help Center',
        href: '/help',
        description: 'Get support and answers'
      },
      {
        label: 'API Documentation',
        href: '/docs/api',
        description: 'Developer resources'
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
    href: ROUTES.DASHBOARD,
    authRequired: true,
  },
  {
    label: 'Tools',
    href: '#',
    authRequired: true,
    hasDropdown: true,
    dropdownItems: [
      {
        label: 'Quotes',
        href: '/quotes',
        description: 'Create and manage quotes'
      },
      {
        label: 'Invoices',
        href: '/invoices',
        description: 'Send and track invoices'
      },
      {
        label: 'Inventory',
        href: '/inventory',
        description: 'Manage your products'
      },
      {
        label: 'Clients',
        href: '/clients',
        description: 'Client database'
      },
      {
        label: 'Analytics',
        href: '/analytics',
        description: 'Business insights'
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
        description: 'Latest updates'
      },
      {
        label: 'Community',
        href: ROUTES.COMMUNITY,
        description: 'Connect with others'
      },
      {
        label: 'Help Center',
        href: '/help',
        description: 'Get support'
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
