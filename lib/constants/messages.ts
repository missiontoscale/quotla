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
  AUTHENTICATION_REQUIRED: 'Please sign in to continue.',
  SIGN_IN_REDIRECT: 'Please create a free account to continue.',
  SIGN_IN_TO_CONTINUE: 'Sign up to continue...',
  CREATE_ACCOUNT_TO_CHAT: 'Create a free account to continue',
} as const

export const ERROR_MESSAGES = {
  // Generic errors
  GENERIC: 'Sorry, I encountered an error. Please try again.',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again later.',

  // Network and connectivity
  NETWORK: 'Unable to connect. Please check your connection and try again.',
  SERVICE_UNAVAILABLE: 'The service is currently unavailable. Please try again later.',
  CONNECTION_FAILED: 'Unable to connect to authentication server. Please try again later.',

  // File upload errors
  FILE_TOO_LARGE: 'File size must be less than 2MB',
  FILE_UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload an image, PDF, or document.',

  // Auth errors
  LOGIN_FAILED: 'Login failed. Please check your credentials and try again.',
  SIGNUP_FAILED: 'Sign up failed. Please try again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
} as const

export const SUCCESS_MESSAGES = {
  // Actions
  SAVED_SUCCESSFULLY: 'Saved successfully!',
  UPDATED_SUCCESSFULLY: 'Updated successfully!',
  DELETED_SUCCESSFULLY: 'Deleted successfully!',
  COPIED_TO_CLIPBOARD: 'Copied to clipboard!',
} as const

export const PLACEHOLDER_TEXT = {
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
} as const

export const LOADING_TEXT = {
  DEFAULT: 'Loading...',
  PROCESSING: 'Processing...',
  SAVING: 'Saving...',
  UPDATING: 'Updating...',
  DELETING: 'Deleting...',
} as const

export const EMPTY_STATE_TEXT = {
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
} as const
