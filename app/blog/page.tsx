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
import Navbar from '@/components/Navbar'

export default function BlogPage() {
  const [internalPosts, setInternalPosts] = useState<BlogPost[]>([])
  const [externalConfig, setExternalConfig] = useState<BlogConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
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
        setIsAuthenticated(false)
        return
      }
      setIsAuthenticated(!!session)
    } catch (error) {
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
        // Silently fail if unable to load from database
      } else if (data) {
        setInternalPosts(data)
      }
    } catch (error) {
      // Silently fail
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
      // Silently fail
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
      // Silently fail if unable to load external config
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
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark bg-gradient-to-br from-quotla-dark via-primary-800 to-quotla-dark' : 'bg-gradient-to-br from-[#FAF9F6] via-quotla-light/30 to-quotla-green/5'}`}>
      <div className="absolute inset-0 bg-[url('/images/patterns/spiral/Quotla%20Spiral%20light.svg')] bg-center opacity-[0.02] pointer-events-none" style={{backgroundSize: '100%'}}></div>
      <Navbar />

      {/* Theme Toggle - Fixed Position */}
      {isDarkModeEnabled && (
        <div className="fixed top-20 right-4 z-50">
          <ThemeToggle onThemeChange={setIsDarkMode} />
        </div>
      )}

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Blog Header with Enhanced Typography */}
        <div className="mb-12 text-center relative">
          <div className="inline-block mb-4 px-6 py-2 bg-quotla-orange/20 backdrop-blur-sm rounded-full border border-quotla-orange/30 animate-fade-in">
            <span className="text-quotla-orange font-semibold text-sm uppercase tracking-wider">Quotla Insights</span>
          </div>
          <h1 className="font-heading text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-quotla-dark to-quotla-orange dark:from-quotla-light dark:to-quotla-green mb-4 transition-all duration-500 animate-slide-up">
            Blog
          </h1>
          <p className="text-xl md:text-2xl text-quotla-dark/80 dark:text-quotla-light/80 max-w-3xl mx-auto leading-relaxed transition-colors duration-500 animate-fade-in-delay">
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
