/**
 * Route Constants
 *
 * Central route definitions for all navigation and API endpoints.
 * This eliminates hardcoded route strings throughout the codebase.
 *
 * Usage:
 * - router.push(ROUTES.LOGIN)
 * - href={ROUTES.DASHBOARD}
 * - href={ROUTES.QUOTES.VIEW('quote-id')}
 */

export const ROUTES = {
  // Public pages
  HOME: '/',
  ABOUT: '/about',
  PRICING: '/pricing',

  // Auth pages
  LOGIN: '/login',
  SIGNUP: '/signup',

  // Protected pages
  DASHBOARD: '/business/dashboard',
  SETTINGS: '/business/settings',
  ADVISOR: '/advisor',

  // Quotes
  QUOTES: {
    LIST: '/quotes',
    NEW: '/quotes/new',
    VIEW: (id: string) => `/quotes/${id}`,
    EDIT: (id: string) => `/quotes/${id}/edit`,
  },

  // Clients/Customers
  CLIENTS: {
    LIST: '/business/customers',
    NEW: '/business/customers/new',
    VIEW: (id: string) => `/business/customers/${id}`,
    EDIT: (id: string) => `/business/customers/${id}/edit`,
  },

  // Business routes
  BUSINESS: {
    DASHBOARD: '/business/dashboard',
    SALES: '/business/sales',
    EXPENSES: '/business/expenses',
    PRODUCTS: '/business/products',
    STOCK_MOVEMENTS: '/business/stock-movements',
  },

  // Legal & Info
  PRIVACY: '/privacy',
  TERMS: '/terms',
  CONTACT: '/contact',

  // Community
  TESTIMONIALS: '/testimonials',
  CAREERS: '/careers',
  COMMUNITY: '/community',
} as const

export const API_ROUTES = {
  // Auth endpoints (if needed)
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    SIGNUP: '/api/auth/signup',
  },
} as const

// Type helpers for route parameters
export type RouteWithId = (id: string) => string
