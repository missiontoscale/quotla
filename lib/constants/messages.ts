/**
 * User-Facing Messages and Copy
 *
 * Central repository for all user-facing text, messages, and copy.
 * This ensures consistency and makes it easy to update messaging.
 *
 * Usage:
 * - alert(ERROR_MESSAGES.FILE_TOO_LARGE)
 * - setChatMessages([...messages, { content: AUTH_MESSAGES.SESSION_EXPIRED }])
 * - placeholder={PLACEHOLDER_TEXT.CHAT_DEFAULT}
 */

export const AUTH_MESSAGES = {
  // Session and authentication
  SESSION_EXPIRED: 'Your session has expired. Please sign in again to continue.',
  AUTHENTICATION_REQUIRED: 'Please sign in to use the AI assistant. Your session may have expired.',
  SIGN_IN_REDIRECT:
    "You've reached the free limit of 2 questions. Create a free account to continue chatting with unlimited access to Quotla AI!",
  SIGN_IN_TO_CONTINUE: 'Sign up to continue...',
  CREATE_ACCOUNT_TO_CHAT: 'Create a free account to continue chatting',
} as const

export const ERROR_MESSAGES = {
  // Generic errors
  GENERIC: 'Sorry, I encountered an error. Please try again.',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again later.',

  // Network and connectivity
  NETWORK: 'Unable to connect to the AI service. Please check your connection and try again.',
  SERVICE_UNAVAILABLE:
    'The AI service is currently unavailable. Please ensure the external API backend is running and accessible.',
  CONNECTION_FAILED: 'Unable to connect to authentication server. Please try again later.',

  // File upload errors
  FILE_TOO_LARGE: 'File size must be less than 2MB',
  FILE_UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload an image, PDF, or document.',

  // Voice and transcription
  VOICE_FAILED: "Sorry, I couldn't process your voice message. Please try typing instead.",
  TRANSCRIPTION_FAILED: 'Sorry, I had trouble understanding the audio. Please try again or type your message.',
  MICROPHONE_ACCESS_DENIED: 'Microphone access was denied. Please enable it in your browser settings.',

  // AI generation errors
  GENERATION_FAILED: 'Failed to generate response. Please try again.',
  QUOTE_GENERATION_FAILED: 'Failed to generate quote. Please try again.',
  INVOICE_GENERATION_FAILED: 'Failed to generate invoice. Please try again.',

  // Auth errors
  LOGIN_FAILED: 'Login failed. Please check your credentials and try again.',
  SIGNUP_FAILED: 'Sign up failed. Please try again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
} as const

export const SUCCESS_MESSAGES = {
  // AI generation success
  QUOTE_GENERATED: "I've prepared the quote for you!",
  INVOICE_GENERATED: "I've generated an invoice for you!",

  // Transcription
  TRANSCRIPTION_SUCCESS: '🎤 Transcribed! You can review and send the message above.',

  // Actions
  SAVED_SUCCESSFULLY: 'Saved successfully!',
  UPDATED_SUCCESSFULLY: 'Updated successfully!',
  DELETED_SUCCESSFULLY: 'Deleted successfully!',
  COPIED_TO_CLIPBOARD: 'Copied to clipboard!',
} as const

export const PLACEHOLDER_TEXT = {
  // Chat inputs
  CHAT_DEFAULT: 'Ask me anything...',
  CHAT_DESCRIBE: 'Describe your quote or invoice...',
  CHAT_SIGNIN: 'Sign up to continue...',

  // Search
  SEARCH: 'Search...',
  SEARCH_QUOTES: 'Search quotes...',
  SEARCH_INVOICES: 'Search invoices...',
  SEARCH_CLIENTS: 'Search clients...',

  // Forms
  EMAIL: 'Enter your email',
  PASSWORD: 'Enter your password',
  NAME: 'Enter your name',
} as const

export const CHAT_PROMPTS = {
  // Hero section typing phrases
  HERO_PHRASES: [
    'Create quotes in seconds',
    'Track invoices effortlessly',
    'Get paid faster',
    'Simplify your workflow',
  ],

  // Placeholder phrases for typing animation
  PLACEHOLDER_PHRASES: [
    'Create a professional quote...',
    'Generate an invoice...',
    'Help me price my services...',
    'What is the difference between a quote & an invoice?',
    'How can I help your business today?...',
    'Draft a quote for a new client...',
    'Calculate project pricing...',
    'What are best practices for invoicing?...',
    'Help me with my freelance business...',
    'Create a detailed estimate...',
    'Price my consulting services...',
    'Generate a client proposal...',
  ],

  // Chat suggestions
  SUGGESTIONS: {
    CREATE_QUOTE: 'I need a quote for ',
    CREATE_INVOICE: 'Hey there! I need your help to create an invoice for ',
    PRICING_ADVICE: 'How should I price my ',
    TAX_GUIDANCE: 'Explain the 2026 VAT changes in Nigeria',
  },
} as const

export const LOADING_TEXT = {
  DEFAULT: 'Loading...',
  TRANSCRIBING: 'Transcribing audio...',
  PROCESSING: 'Processing...',
  GENERATING: 'Generating...',
  GENERATING_QUOTE: 'Generating quote...',
  GENERATING_INVOICE: 'Generating invoice...',
  SAVING: 'Saving...',
  UPDATING: 'Updating...',
  DELETING: 'Deleting...',
} as const

export const EMPTY_STATE_TEXT = {
  // Chat
  NO_MESSAGES: 'No messages yet',
  START_CONVERSATION: 'Start a conversation to see your chat history here.',

  // Dashboard
  NO_QUOTES: 'No quotes yet',
  NO_INVOICES: 'No invoices yet',
  NO_DEALS: 'You have sealed zero deals',
  NO_CLIENTS: 'No clients yet',

  // Blog
  NO_POSTS: 'No posts found',
  NO_RESULTS: 'Results not found',

  // Generic
  NOTHING_HERE: 'Nothing here, yet',
} as const

export const BUTTON_TEXT = {
  // Actions
  SAVE: 'Save',
  CANCEL: 'Cancel',
  DELETE: 'Delete',
  EDIT: 'Edit',
  CREATE: 'Create',
  UPDATE: 'Update',
  SUBMIT: 'Submit',

  // Auth
  LOGIN: 'Log In',
  SIGNUP: 'Sign Up',
  LOGOUT: 'Log Out',

  // Navigation
  BACK: 'Back',
  NEXT: 'Next',
  CONTINUE: 'Continue',
  GET_STARTED: 'Get Started',

  // Chat
  SEND: 'Send',
  CLEAR: 'Clear',
  NEW_CHAT: 'New Chat',

  // Export
  EXPORT_PDF: 'Export as PDF',
  EXPORT_PNG: 'Export as PNG',
  EXPORT_DOCX: 'Export as DOCX',
  DOWNLOAD: 'Download',
} as const
