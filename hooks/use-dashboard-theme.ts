/**
 * Dashboard Theme Configuration
 *
 * Centralized theme variables for the /business dashboard pages.
 * Uses Quotla brand colors: quotla-dark, quotla-green, quotla-light, quotla-orange
 *
 * Brand Colors:
 * - quotla-dark:   #0e1616 (primary-800) - Deep dark background
 * - quotla-green:  #445642 (primary-500) - Primary brand green
 * - quotla-light:  #fffad6 (primary-50)  - Cream/light for contrast
 * - quotla-orange: #ce6203 (secondary-500) - Accent/highlight color
 */

// =============================================================================
// COLOR PALETTE - Using Quotla Brand Colors
// =============================================================================

export const dashboardColors = {
  // Background colors - Based on quotla-dark (#0e1616)
  bg: {
    primary: 'bg-quotla-dark/90',           // Main card backgrounds
    secondary: 'bg-primary-700/50',          // Nested elements
    tertiary: 'bg-primary-700/30',           // Subtle backgrounds
    hover: 'bg-primary-700',                 // Hover states
    page: 'bg-quotla-dark',                  // Page background
  },

  // Border colors
  border: {
    default: 'border-primary-600',
    subtle: 'border-primary-600/50',
    focus: 'border-quotla-green',
    accent: 'border-quotla-orange/30',
  },

  // Text colors - Using quotla-light for contrast on dark
  text: {
    primary: 'text-primary-50',              // Headings, important text (quotla-light)
    secondary: 'text-primary-100',           // Secondary headings
    muted: 'text-primary-400',               // Muted/helper text
    label: 'text-primary-300',               // Labels
    tiny: 'text-primary-400',                // Timestamps, metadata
    accent: 'text-quotla-orange',            // Accent text
  },

  // Accent colors for different features
  accent: {
    // Revenue/Money - Quotla Green
    revenue: {
      bg: 'bg-quotla-green/15',
      text: 'text-emerald-400',
      border: 'border-quotla-green/40',
      hover: 'hover:border-quotla-green/60',
    },
    // Customers/Users - Quotla Orange tinted
    customers: {
      bg: 'bg-quotla-orange/10',
      text: 'text-quotla-orange',
      border: 'border-quotla-orange/30',
      hover: 'hover:border-quotla-orange/50',
    },
    // Products/Inventory - Quotla Green
    products: {
      bg: 'bg-quotla-green/15',
      text: 'text-quotla-green',
      border: 'border-quotla-green/30',
      hover: 'hover:border-quotla-green/50',
    },
    // Growth/Positive - Green
    growth: {
      bg: 'bg-quotla-green/15',
      text: 'text-emerald-400',
      border: 'border-quotla-green/30',
      hover: 'hover:border-quotla-green/50',
    },
    // Alerts/Warning - Amber with orange tint
    warning: {
      bg: 'bg-secondary-400/10',
      text: 'text-secondary-400',
      border: 'border-secondary-400/20',
      hover: 'hover:border-secondary-400/40',
      gradient: 'from-secondary-900/30 to-quotla-dark/50',
    },
    // Danger/Error - Rose
    danger: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      hover: 'hover:border-rose-500/40',
    },
    // Primary actions - Quotla Orange gradient
    primary: {
      bg: 'bg-quotla-orange/10',
      text: 'text-quotla-orange',
      border: 'border-quotla-orange/30',
      hover: 'hover:border-quotla-orange/50',
      gradient: 'from-quotla-orange to-secondary-600',
      gradientHover: 'hover:from-secondary-400 hover:to-quotla-orange',
    },
    // Info/Links - Quotla Light tinted
    info: {
      bg: 'bg-primary-50/5',
      text: 'text-primary-200',
      border: 'border-primary-300/20',
      hover: 'hover:border-primary-300/40',
    },
  },
} as const

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const dashboardRadius = {
  none: 'rounded-none',
  sm: 'rounded-sm',           // 2px
  md: 'rounded-md',           // 6px
  lg: 'rounded-lg',           // 8px - small elements
  xl: 'rounded-xl',           // 12px - cards, icons
  '2xl': 'rounded-2xl',       // 16px - large cards
  full: 'rounded-full',       // circles
} as const

// =============================================================================
// COMPONENT PRESETS
// =============================================================================

export const dashboardComponents = {
  // Card styles
  card: {
    base: `p-5 ${dashboardColors.bg.primary} ${dashboardColors.border.default} ${dashboardRadius.xl}`,
    compact: `p-4 ${dashboardColors.bg.primary} ${dashboardColors.border.default} ${dashboardRadius.xl}`,
    interactive: `p-4 ${dashboardColors.bg.primary} ${dashboardColors.border.default} ${dashboardRadius.xl} transition-colors cursor-pointer`,
  },

  // Icon container styles
  iconContainer: {
    sm: `w-8 h-8 ${dashboardRadius.lg} flex items-center justify-center`,
    md: `w-9 h-9 ${dashboardRadius.lg} flex items-center justify-center`,
    lg: `w-10 h-10 ${dashboardRadius.xl} flex items-center justify-center`,
    xl: `w-12 h-12 ${dashboardRadius.xl} flex items-center justify-center`,
  },

  // Text presets
  heading: {
    page: `text-2xl font-semibold ${dashboardColors.text.primary}`,
    section: `text-base font-semibold ${dashboardColors.text.primary}`,
    card: `text-sm font-semibold ${dashboardColors.text.primary}`,
    label: `text-xs ${dashboardColors.text.label}`,
    tiny: `text-[0.68rem] ${dashboardColors.text.muted} uppercase tracking-wider`,
  },

  // Stat card
  stat: {
    value: `text-lg font-semibold ${dashboardColors.text.primary}`,
    label: `text-[0.68rem] ${dashboardColors.text.muted} uppercase tracking-wider`,
  },

  // Badge styles
  badge: {
    sm: `px-1.5 py-0.5 text-[0.68rem] rounded`,
    md: `px-2 py-1 text-xs rounded-lg`,
  },

  // Button presets (use with Button component)
  button: {
    primary: `bg-gradient-to-r ${dashboardColors.accent.primary.gradient} ${dashboardColors.accent.primary.gradientHover}`,
    secondary: 'bg-quotla-green hover:bg-quotla-green/90 text-primary-50',
    accent: 'bg-quotla-orange hover:bg-secondary-400 text-white',
  },

  // Loading spinner - Using Quotla Orange
  spinner: `animate-spin rounded-full border-2 border-primary-600 border-t-quotla-orange`,
} as const

// =============================================================================
// SPACING
// =============================================================================

export const dashboardSpacing = {
  page: 'space-y-6 pb-8',
  section: 'space-y-6',
  card: 'space-y-4',
  gap: {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-6',
  },
} as const

// =============================================================================
// GRID LAYOUTS
// =============================================================================

export const dashboardGrid = {
  // Main page layout
  main: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
  mainLeft: 'lg:col-span-2 space-y-6',
  mainRight: 'space-y-6',

  // Stats grid
  stats: 'grid grid-cols-2 sm:grid-cols-4 gap-3',

  // Quick actions
  actions: 'grid grid-cols-3 gap-3',
} as const

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to access dashboard theme values
 *
 * @example
 * const theme = useDashboardTheme()
 *
 * <Card className={theme.components.card.base}>
 *   <div className={theme.components.iconContainer.lg + ' ' + theme.colors.accent.revenue.bg}>
 *     <DollarSign className={theme.colors.accent.revenue.text} />
 *   </div>
 *   <p className={theme.components.stat.value}>{value}</p>
 * </Card>
 */
export function useDashboardTheme() {
  return {
    colors: dashboardColors,
    radius: dashboardRadius,
    components: dashboardComponents,
    spacing: dashboardSpacing,
    grid: dashboardGrid,
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get accent color classes for a specific feature
 */
export function getAccentClasses(
  accent: keyof typeof dashboardColors.accent
): { bg: string; text: string; border: string; hover: string } {
  return dashboardColors.accent[accent]
}

/**
 * Combine multiple class strings
 */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Type exports for TypeScript support
export type DashboardColors = typeof dashboardColors
export type DashboardAccent = keyof typeof dashboardColors.accent
export type DashboardRadius = keyof typeof dashboardRadius
