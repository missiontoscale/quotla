/**
 * Application Configuration Constants
 *
 * Central configuration for limits, quotas, timeouts, and other app settings.
 *
 * Usage:
 * - if (promptCount >= LIMITS.FREE_PROMPTS) { ... }
 * - const history = messages.slice(-LIMITS.CHAT_HISTORY_LIMIT)
 * - if (file.size > LIMITS.MAX_FILE_SIZE) { ... }
 */

export const LIMITS = {
  // Chat and AI limits
  CHAT_HISTORY_LIMIT: 25,
  CHAT_MESSAGE_CONTEXT: 10,
  RECENT_MESSAGES_DISPLAY: 10,

  // Free tier limits
  FREE_PROMPTS: 2,

  // File upload limits
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB in bytes
  MAX_FILE_SIZE_LABEL: '2MB',

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // API timeouts (in milliseconds)
  REQUEST_TIMEOUT: 30000, // 30 seconds
  LONG_REQUEST_TIMEOUT: 60000, // 60 seconds
} as const

export const CURRENCIES = {
  USD: {
    symbol: '$',
    code: 'USD',
    name: 'US Dollar',
  },
  NGN: {
    symbol: '₦',
    code: 'NGN',
    name: 'Nigerian Naira',
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    name: 'Euro',
  },
  GBP: {
    symbol: '£',
    code: 'GBP',
    name: 'British Pound',
  },
} as const

export const FILE_TYPES = {
  // Accept attributes for file inputs
  IMAGES: 'image/*',
  DOCUMENTS: '.pdf,.doc,.docx',
  SPREADSHEETS: '.xls,.xlsx,.csv',
  ALL_UPLOADS: 'image/*,.pdf,.doc,.docx',
} as const

export const STORAGE_KEYS = {
  // localStorage keys
  CHAT_HISTORY: 'quotla_chat_history',
  REDIRECT_AFTER_AUTH: 'quotla_redirect_after_auth',
  THEME: 'theme',
  USER_PREFERENCES: 'quotla_user_preferences',
} as const

export const ANIMATION_DELAYS = {
  // Typing animation speeds (in milliseconds)
  TYPING_SPEED: 100,
  TYPING_SPEED_DELETE: 50,
  PAUSE_BEFORE_DELETE: 2000,

  // Bounce animation delays (CSS animation-delay values)
  BOUNCE_DELAY_1: '0.2s',
  BOUNCE_DELAY_2: '0.4s',

  // General delays
  SHORT_DELAY: 150,
  MEDIUM_DELAY: 300,
  LONG_DELAY: 500,
} as const

// Status types for quotes, invoices, deals
export const STATUS_TYPES = {
  QUOTE: {
    DRAFT: 'draft',
    SENT: 'sent',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    EXPIRED: 'expired',
  },
  INVOICE: {
    DRAFT: 'draft',
    SENT: 'sent',
    PAID: 'paid',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled',
  },
  DEAL: {
    LEAD: 'lead',
    QUOTE_SENT: 'quote_sent',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    LOST: 'lost',
  },
} as const

// Voice recording settings
export const VOICE_SETTINGS = {
  MAX_RECORDING_DURATION: 60000, // 60 seconds in milliseconds
  SAMPLE_RATE: 44100,
  MIME_TYPE: 'audio/webm',
} as const

// Export formats
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  PNG: 'png',
  DOCX: 'docx',
} as const
