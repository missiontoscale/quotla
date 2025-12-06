'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { BlogPost } from '@/types'
import { format } from 'date-fns'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
    loadPosts()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setIsAuthenticated(!!session)
  }

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })

    if (!error && data) {
      setPosts(data)
    }
    setLoading(false)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const recentPosts = posts.slice(0, 5)
  const mainPosts = posts

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Quotla
            </Link>
            <div className="flex gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard" className="btn btn-primary">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="btn btn-secondary">
                    Sign In
                  </Link>
                  <Link href="/signup" className="btn btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Blog Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-xl text-gray-600">
            Latest insights, tips, and updates from the Quotla team
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {mainPosts.map((post, index) => (
                <article
                  key={post.id}
                  className={`card hover:shadow-lg transition-all ${
                    index === 0 ? 'border-l-4 border-l-primary-600' : ''
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="text-3xl font-bold text-gray-900 hover:text-primary-600 mb-3 transition-colors">
                          {post.title}
                        </h2>
                      </Link>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {post.published_at && format(new Date(post.published_at), 'MMMM d, yyyy')}
                        </span>
                      </div>

                      {post.excerpt && (
                        <p className="text-gray-700 text-lg leading-relaxed mb-4">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                      >
                        Read full article
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-8 space-y-8">
                {/* Recent Posts Widget */}
                <div className="card bg-white">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                    Recent Posts
                  </h3>
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="block group"
                      >
                        <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 mb-1 transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {post.published_at && format(new Date(post.published_at), 'MMM d, yyyy')}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* About Widget */}
                <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    About Quotla
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Quotla helps businesses create professional quotes and invoices with the power of AI.
                  </p>
                  <Link
                    href="/signup"
                    className="btn btn-primary w-full text-center"
                  >
                    Get Started Free
                  </Link>
                </div>

                {/* Newsletter Widget */}
                <div className="card bg-gray-900 text-white">
                  <h3 className="text-xl font-bold mb-3">
                    Stay Updated
                  </h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    Get the latest posts delivered right to your inbox.
                  </p>
                  <div className="space-y-2">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="w-full px-4 py-2 rounded-lg text-gray-900"
                    />
                    <button className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold transition-colors">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
