// Blog Aggregation System Types
// Supports both internal Quotla blogs (Supabase) and external blogs (JSON)

export interface BlogFeature {
  enabled?: boolean // disabled: false/undefined, enabled: true
  name: string
}

export interface BlogEntry {
  collab?: boolean // sole author: false/undefined, co-author: true
  date: string // YYYY-MM-DD format
  name: string
  slug: string
  source: string // Original blog URL (external link)
  excerpt?: string // Optional excerpt for preview
  tags?: string[] // Optional tags for categorization
  platform?: string // e.g., "dev.to", "bravolt", "medium"
}

export interface BlogConfig {
  features: BlogFeature[]
  data: BlogEntry[]
}

// Enhanced blog entry combining internal and external
export interface HybridBlogEntry {
  id?: string
  title: string
  slug: string
  excerpt?: string
  date: string
  isExternal: boolean
  externalUrl?: string
  collab?: boolean
  platform?: string
  tags?: string[]
  author?: string
}

// Filter options
export interface BlogFilters {
  searchQuery: string
  dateFrom?: string
  dateTo?: string
  platforms: string[]
  showInternal: boolean
  showExternal: boolean
}

// Sort options
export type BlogSortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc'
