/**
 * Design System Tokens
 *
 * Design tokens mapping semantic names to Tailwind classes.
 * This provides a single source of truth for all design decisions.
 *
 * Usage:
 * - className={`text-${COLORS.TEXT.ACCENT}`}
 * - className={TYPOGRAPHY.HEADING_LG}
 * - className={`${SPACING.SECTION_Y} ${SPACING.SECTION_X}`}
 */

export const COLORS = {
  // Brand colors (raw color names, use with prefixes)
  BRAND: {
    DARK: 'quotla-dark',
    GREEN: 'quotla-green',
    LIGHT: 'quotla-light',
    ORANGE: 'quotla-orange',
  },

  // Primary scale (raw color names, use with prefixes)
  PRIMARY: {
    50: 'primary-50',
    300: 'primary-300',
    400: 'primary-400',
    500: 'primary-500',
    600: 'primary-600',
    700: 'primary-700',
    800: 'primary-800',
  },

  // Semantic text colors (for use with text- prefix)
  TEXT: {
    DEFAULT: 'quotla-dark',
    LIGHT: 'quotla-light',
    MUTED: 'quotla-light/70',
    ACCENT: 'quotla-orange',
    PRIMARY: 'primary-50',
    SECONDARY: 'primary-300',
    TERTIARY: 'primary-400',
  },

  // Semantic background colors (for use with bg- prefix)
  BG: {
    PRIMARY: 'primary-800',
    SECONDARY: 'primary-700',
    TERTIARY: 'primary-600',
    ACCENT: 'quotla-dark',
    ACCENT_ORANGE: 'quotla-orange',
    ACCENT_GREEN: 'quotla-green',
    LIGHT: 'white',
    CARD: 'primary-600',
  },

  // Border colors (for use with border- prefix)
  BORDER: {
    DEFAULT: 'primary-600',
    LIGHT: 'quotla-light/20',
    ACCENT: 'quotla-orange',
    ACCENT_STRONG: 'quotla-green',
  },
} as const

export const SPACING = {
  // Common spacing values
  SECTION_Y: 'py-24',
  SECTION_X: 'px-4 sm:px-6 lg:px-8',
  CONTAINER: 'max-w-7xl mx-auto',

  // Gaps
  GAP_XS: 'gap-1',
  GAP_SM: 'gap-2',
  GAP_MD: 'gap-4',
  GAP_LG: 'gap-6',
  GAP_XL: 'gap-8',
  GAP_2XL: 'gap-12',

  // Padding
  PADDING_XS: 'p-2',
  PADDING_SM: 'p-4',
  PADDING_MD: 'p-6',
  PADDING_LG: 'p-8',
  PADDING_XL: 'p-12',

  // Specific paddings
  PADDING_X_SM: 'px-4',
  PADDING_X_MD: 'px-6',
  PADDING_X_LG: 'px-8',
  PADDING_Y_SM: 'py-2',
  PADDING_Y_MD: 'py-3',
  PADDING_Y_LG: 'py-4',
} as const

export const TYPOGRAPHY = {
  // Headings
  HEADING_XL: 'text-4xl md:text-5xl font-bold font-heading',
  HEADING_LG: 'text-3xl md:text-4xl font-bold font-heading',
  HEADING_MD: 'text-2xl font-bold font-heading',
  HEADING_SM: 'text-xl font-semibold font-heading',
  HEADING_XS: 'text-lg font-semibold font-heading',

  // Body text
  BODY_XL: 'text-xl',
  BODY_LG: 'text-lg',
  BODY_MD: 'text-base',
  BODY_SM: 'text-sm',
  BODY_XS: 'text-xs',

  // Font weights
  WEIGHT_NORMAL: 'font-normal',
  WEIGHT_MEDIUM: 'font-medium',
  WEIGHT_SEMIBOLD: 'font-semibold',
  WEIGHT_BOLD: 'font-bold',
} as const

export const BORDERS = {
  // Border widths
  DEFAULT: 'border',
  THICK: 'border-2',
  NONE: 'border-0',

  // Combined border + color
  LIGHT: 'border border-quotla-light/20',
  PRIMARY: 'border border-primary-600',
  ACCENT: 'border-2 border-quotla-orange',
  ACCENT_GREEN: 'border-2 border-quotla-green',

  // Rounded corners
  ROUNDED_NONE: 'rounded-none',
  ROUNDED_SM: 'rounded',
  ROUNDED_MD: 'rounded-lg',
  ROUNDED_LG: 'rounded-xl',
  ROUNDED_XL: 'rounded-2xl',
  ROUNDED_FULL: 'rounded-full',
} as const

export const SHADOWS = {
  NONE: 'shadow-none',
  SM: 'shadow-sm',
  MD: 'shadow-md',
  LG: 'shadow-lg',
  XL: 'shadow-xl',
  '2XL': 'shadow-2xl',

  // Colored shadows
  ORANGE_SM: 'shadow-sm shadow-quotla-orange/30',
  ORANGE_MD: 'shadow-md shadow-quotla-orange/40',
  ORANGE_LG: 'shadow-lg shadow-quotla-orange/40',
} as const

export const TRANSITIONS = {
  DEFAULT: 'transition-all',
  COLORS: 'transition-colors',
  TRANSFORM: 'transition-transform',
  OPACITY: 'transition-opacity',

  // Duration variants
  FAST: 'transition-all duration-150',
  NORMAL: 'transition-all duration-300',
  SLOW: 'transition-all duration-500',
} as const

// Common gradient patterns
export const GRADIENTS = {
  PRIMARY: 'bg-gradient-to-br from-primary-800 to-primary-600',
  DARK: 'bg-gradient-to-br from-quotla-dark to-primary-800',
  ORANGE: 'bg-gradient-to-br from-quotla-orange to-secondary-600',
  LIGHT: 'bg-gradient-to-br from-white to-primary-50',
} as const

// Common layout patterns
export const LAYOUTS = {
  FLEX_CENTER: 'flex items-center justify-center',
  FLEX_BETWEEN: 'flex items-center justify-between',
  FLEX_START: 'flex items-center justify-start',
  FLEX_COL: 'flex flex-col',
  GRID_2: 'grid grid-cols-1 md:grid-cols-2',
  GRID_3: 'grid grid-cols-1 md:grid-cols-3',
  GRID_4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
} as const
