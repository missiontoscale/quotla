'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { BlogPost } from '@/types'
import { BlogConfig, BlogFilters, HybridBlogEntry } from '@/types/blog'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import SearchBar from '@/components/blog/SearchBar'
import FilterPanel from '@/components/blog/FilterPanel'
import BlogCard from '@/components/blog/BlogCard'
import ThemeToggle from '@/components/blog/ThemeToggle'

export default function BlogPage() {
  const [internalPosts, setInternalPosts] = useState<BlogPost[]>([])
  const [externalConfig, setExternalConfig] = useState<BlogConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [filters, setFilters] = useState<BlogFilters>({
    searchQuery: '',
    dateFrom: undefined,
    dateTo: undefined,
    platforms: [],
    showInternal: true,
    showExternal: true
  })

  useEffect(() => {
    checkAuth()
    loadInternalPosts()
    loadExternalConfig()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.warn('Auth check failed:', error.message)
        setIsAuthenticated(false)
        return
      }
      setIsAuthenticated(!!session)
    } catch (error) {
      console.warn('Auth check error:', error)
      setIsAuthenticated(false)
    }
  }

  const loadInternalPosts = async () => {
    // Load from database
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })

      if (error) {
        console.warn('Failed to load blog posts from database:', error.message)
      } else if (data) {
        setInternalPosts(data)
      }
    } catch (error) {
      console.warn('Error fetching blog posts:', error)
    }

    // Also load markdown posts
    try {
      const response = await fetch('/api/blog/markdown')
      if (response.ok) {
        const markdownPosts = await response.json()
        // Convert markdown posts to BlogPost format
        const convertedPosts: BlogPost[] = markdownPosts.map((md: any) => ({
          id: md.slug,
          title: md.title,
          slug: md.slug,
          excerpt: md.excerpt,
          content: md.content,
          author_id: 'markdown',
          published: md.published,
          published_at: md.date,
          created_at: md.date,
          category: md.category,
          tags: md.tags,
          reading_time_minutes: md.readingTime,
          featured_image_url: md.image
        }))
        // Merge with database posts
        setInternalPosts(prev => [...prev, ...convertedPosts])
      }
    } catch (error) {
      console.warn('Error loading markdown posts:', error)
    }

    setLoading(false)
  }

  const loadExternalConfig = async () => {
    try {
      const response = await fetch('/blog-config.json')
      if (response.ok) {
        const config: BlogConfig = await response.json()
        setExternalConfig(config)
      }
    } catch (error) {
      console.error('Failed to load external blog config:', error)
    }
  }

  // Combine internal and external blog posts
  const hybridPosts = useMemo<HybridBlogEntry[]>(() => {
    const combined: HybridBlogEntry[] = []

    // Add internal posts
    if (filters.showInternal) {
      internalPosts.forEach(post => {
        combined.push({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || undefined,
          date: post.published_at || post.created_at || new Date().toISOString(),
          isExternal: false,
          platform: 'Quotla',
          tags: post.tags || []
        })
      })
    }

    // Add external posts
    if (filters.showExternal && externalConfig) {
      externalConfig.data.forEach(entry => {
        combined.push({
          title: entry.name,
          slug: entry.slug,
          excerpt: entry.excerpt,
          date: entry.date,
          isExternal: true,
          externalUrl: entry.source,
          collab: entry.collab,
          platform: entry.platform,
          tags: entry.tags
        })
      })
    }

    return combined
  }, [internalPosts, externalConfig, filters.showInternal, filters.showExternal])

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = [...hybridPosts]

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query)
      )
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(post => post.date >= filters.dateFrom!)
    }
    if (filters.dateTo) {
      filtered = filtered.filter(post => post.date <= filters.dateTo!)
    }

    // Platform filter
    if (filters.platforms.length > 0) {
      filtered = filtered.filter(post =>
        post.platform && filters.platforms.includes(post.platform)
      )
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return filtered
  }, [hybridPosts, filters])

  // Get unique platforms for filter panel
  const availablePlatforms = useMemo(() => {
    const platforms = new Set<string>()
    hybridPosts.forEach(post => {
      if (post.platform) platforms.add(post.platform)
    })
    return Array.from(platforms).sort()
  }, [hybridPosts])

  // Check if dark mode is enabled in features
  const isDarkModeEnabled = useMemo(() => {
    if (!externalConfig) return true
    const darkModeFeature = externalConfig.features.find(f => f.name === 'dark-mode')
    return darkModeFeature?.enabled !== false
  }, [externalConfig])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-primary-800 transition-colors" style={{backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)', backgroundSize: '60px 60px'}}>
      <nav className="sticky top-0 z-50 bg-quotla-dark/95 dark:bg-quotla-dark/95 backdrop-blur-xl border-b border-quotla-light/20 dark:border-quotla-light/20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/images/logos/icons/Quotla icon light.svg" alt="Quotla" className="h-12 w-auto transform group-hover:scale-105 transition-transform dark:hidden" />
              <img src="/images/logos/icons/Quotla icon light.svg" alt="Quotla" className="h-12 w-auto transform group-hover:scale-105 transition-transform hidden dark:block" />
              <span className="text-xl font-bold text-quotla-light dark:text-quotla-light transition-colors">Quotla Blog</span>
            </Link>
            <div className="flex items-center gap-3">
              {isDarkModeEnabled && <ThemeToggle />}
              {isAuthenticated ? (
                <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-semibold bg-quotla-orange text-quotla-light hover:bg-secondary-600 transition-all shadow-sm">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-primary-300 hover:text-quotla-dark dark:hover:text-quotla-light transition-colors">
                    Sign In
                  </Link>
                  <Link href="/signup" className="px-4 py-2 rounded-lg text-sm font-semibold bg-quotla-orange text-quotla-light hover:bg-secondary-600 transition-all shadow-sm">
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Blog Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-quotla-dark dark:text-quotla-light mb-4 transition-colors">Blog</h1>
          <p className="text-xl text-gray-700 dark:text-primary-400 transition-colors">
            Latest insights, tips, and updates from Quotla
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            value={filters.searchQuery}
            onChange={(value) => setFilters({ ...filters, searchQuery: value })}
          />
        </div>

        {/* Stats */}
        <div className="mb-8 flex items-center gap-4 text-sm text-gray-700 dark:text-primary-400">
          <span className="font-medium">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} found
          </span>
          {filters.searchQuery && (
            <span className="text-quotla-orange dark:text-primary-400">
              matching "{filters.searchQuery}"
            </span>
          )}
        </div>

        {filteredPosts.length === 0 ? (
          <div className="card text-center py-12 dark:bg-primary-900 dark:text-quotla-light transition-colors">
            <svg className="mx-auto h-12 w-12 text-primary-400 dark:text-primary-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-primary-400 dark:text-primary-400 mb-2">No blog posts found</p>
            <p className="text-sm text-primary-400 dark:text-primary-400">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Filters */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <FilterPanel
                  filters={filters}
                  onFilterChange={setFilters}
                  availablePlatforms={availablePlatforms}
                />
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {filteredPosts.map((post, index) => (
                <BlogCard
                  key={post.id || post.slug}
                  post={post}
                  featured={index === 0}
                />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
