/**
 * Dashboard Theme Configuration
 *
 * Centralized theme variables for the /business dashboard pages.
 * Edit these values to easily customize colors, accents, and spacing across all dashboard components.
 */

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const dashboardColors = {
  // Background colors
  bg: {
    primary: 'bg-slate-900/50',      // Main card backgrounds
    secondary: 'bg-slate-800/50',     // Nested elements
    tertiary: 'bg-slate-800/30',      // Subtle backgrounds
    hover: 'bg-slate-800',            // Hover states
  },

  // Border colors
  border: {
    default: 'border-slate-800',
    subtle: 'border-slate-700/50',
    focus: 'border-slate-700',
  },

  // Text colors
  text: {
    primary: 'text-slate-100',        // Headings, important text
    secondary: 'text-slate-200',      // Secondary headings
    muted: 'text-slate-500',          // Muted/helper text
    label: 'text-slate-400',          // Labels
    tiny: 'text-slate-500',           // Timestamps, metadata
  },

  // Accent colors for different features
  accent: {
    // Revenue/Money - Emerald
    revenue: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      hover: 'hover:border-emerald-500/30',
    },
    // Customers/Users - Cyan
    customers: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      border: 'border-cyan-500/30',
      hover: 'hover:border-cyan-500/30',
    },
    // Products/Inventory - Purple
    products: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      hover: 'hover:border-purple-500/30',
    },
    // Growth/Positive - Green
    growth: {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      border: 'border-green-500/30',
      hover: 'hover:border-green-500/30',
    },
    // Alerts/Warning - Amber
    warning: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      hover: 'hover:border-amber-500/30',
      gradient: 'from-amber-950/20 to-slate-900/50',
    },
    // Danger/Error - Rose
    danger: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      hover: 'hover:border-rose-500/30',
    },
    // Primary actions - Violet/Purple gradient
    primary: {
      bg: 'bg-violet-500/10',
      text: 'text-violet-400',
      border: 'border-violet-500/30',
      hover: 'hover:border-violet-500/30',
      gradient: 'from-violet-600 to-purple-600',
      gradientHover: 'hover:from-violet-500 hover:to-purple-500',
    },
    // Info/Links - Blue
    info: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      hover: 'hover:border-blue-500/30',
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
  },

  // Loading spinner
  spinner: `animate-spin rounded-full border-2 border-slate-700 border-t-cyan-500`,
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
