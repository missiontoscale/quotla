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
        href: '/solutions/small-business',
        description: 'Scale your operations efficiently'
      },
      {
        label: 'For Agencies',
        href: '/solutions/agencies',
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
    label: 'For Business',
    href: '#',
    authRequired: true,
    hasDropdown: true,
    dropdownItems: [
      {
        label: 'Invoices',
        href: '/invoices',
        description: 'Send and track invoices',
        icon: '📄'
      },
      {
        label: 'Quotes',
        href: '/quotes',
        description: 'Create professional quotes',
        icon: '💼'
      },
      {
        label: 'Clients',
        href: '/clients',
        description: 'Manage client relationships',
        icon: '👥'
      },
      {
        label: 'Inventory',
        href: '/inventory',
        description: 'Track products & stock',
        icon: '📦'
      },
      {
        label: 'Shopping List',
        href: '/shopping-list',
        description: 'Items to purchase',
        icon: '🛒'
      },
      {
        label: 'Analytics',
        href: '/analytics',
        description: 'Business insights & reports',
        icon: '📊'
      },
      {
        label: 'Integrations',
        href: '/settings/integrations',
        description: 'Connect your tools',
        icon: '🔗'
      },
    ]
  },
  {
    label: 'For Professionals',
    href: '#',
    authRequired: true,
    hasDropdown: true,
    dropdownItems: [
      {
        label: 'Time Tracking',
        href: '/time-tracking',
        description: 'Track billable hours',
        icon: '⏱️'
      },
      {
        label: 'Project Management',
        href: '/projects',
        description: 'Organize your work',
        icon: '🎯'
      },
      {
        label: 'Expense Tracking',
        href: '/expenses',
        description: 'Monitor spending',
        icon: '💰'
      },
      {
        label: 'Schedule Meeting',
        href: '/schedule',
        description: 'Book consultations',
        icon: '📅'
      },
      {
        label: 'Portfolio',
        href: '/portfolio',
        description: 'Showcase your work',
        icon: '🎨'
      },
      {
        label: 'Proposals',
        href: '/proposals',
        description: 'Win more projects',
        icon: '📋'
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
        description: 'Tips & best practices',
        icon: '📰'
      },
      {
        label: 'Community',
        href: ROUTES.COMMUNITY,
        description: 'Connect with peers',
        icon: '🌐'
      },
      {
        label: 'Help Center',
        href: '/help',
        description: 'Get support',
        icon: '❓'
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
