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
  BLOG: '/blog',
  PRICING: '/pricing',

  // Auth pages
  LOGIN: '/login',
  SIGNUP: '/signup',

  // Protected pages
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  ADMIN: '/admin',
  ADVISOR: '/advisor',

  // Deals
  DEALS: {
    LIST: '/dashboard/deals',
    NEW: '/dashboard/deals/new',
    VIEW: (id: string) => `/dashboard/deals/${id}`,
    EDIT: (id: string) => `/dashboard/deals/${id}/edit`,
  },

  // Quotes
  QUOTES: {
    LIST: '/quotes',
    NEW: '/quotes/new',
    VIEW: (id: string) => `/quotes/${id}`,
    EDIT: (id: string) => `/quotes/${id}/edit`,
  },

  // Invoices
  INVOICES: {
    LIST: '/invoices',
    NEW: '/invoices/new',
    VIEW: (id: string) => `/invoices/${id}`,
    EDIT: (id: string) => `/invoices/${id}/edit`,
  },

  // Clients
  CLIENTS: {
    LIST: '/clients',
    NEW: '/clients/new',
    VIEW: (id: string) => `/clients/${id}`,
    EDIT: (id: string) => `/clients/${id}/edit`,
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
  // AI endpoints
  AI: {
    GENERATE: '/api/ai/generate',
    GENERATE_QUOTE: '/api/ai/generate-quote',
    GENERATE_INVOICE: '/api/ai/generate-invoice',
    TRANSCRIBE: '/api/ai/transcribe',
  },

  // Export endpoints
  EXPORT: {
    PDF: '/api/export/pdf',
    PNG: '/api/export/png',
    DOCX: '/api/export/docx',
  },

  // Blog endpoints
  BLOG: {
    MARKDOWN: '/api/blog/markdown',
    POSTS: '/api/blog/posts',
  },

  // Auth endpoints (if needed)
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    SIGNUP: '/api/auth/signup',
  },
} as const

// Type helpers for route parameters
export type RouteWithId = (id: string) => string
