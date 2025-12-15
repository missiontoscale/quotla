'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BlogPost, BlogComment } from '@/types'
import { BlogConfig } from '@/types/blog'
import { format } from 'date-fns'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function BlogPostPage() {
  const params = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([])
  const [comments, setComments] = useState<BlogComment[]>([])
  const [loading, setLoading] = useState(true)
  const [commenting, setCommenting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const [commentForm, setCommentForm] = useState({
    author_name: '',
    author_email: '',
    content: '',
  })

  useEffect(() => {
    checkAuth()
    checkExternalBlog()
  }, [params.slug])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setIsAuthenticated(!!session)
  }

  const checkExternalBlog = async () => {
    try {
      // First check if this is an external blog entry
      const response = await fetch('/blog-config.json')
      if (response.ok) {
        const config: BlogConfig = await response.json()
        const externalEntry = config.data.find(entry => entry.slug === params.slug)

        if (externalEntry) {
          // This is an external blog - redirect to the source URL
          setRedirecting(true)
          window.location.href = externalEntry.source
          return
        }
      }
    } catch (err) {
      console.error('Failed to check external blog config:', err)
    }

    // If not external, load from Supabase
    loadPost()
    loadRecentPosts()
  }

  const loadPost = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', params.slug as string)
      .eq('published', true)
      .single()

    if (!error && data) {
      setPost(data as BlogPost)
      loadComments((data as BlogPost).id)
    }
    setLoading(false)
  }

  const loadRecentPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(5)

    if (!error && data) {
      setRecentPosts(data)
    }
  }

  const loadComments = async (postId: string) => {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('approved', true)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setComments(data)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCommenting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/blog/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: post?.id,
          ...commentForm,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit comment')
      }

      const data = await response.json()

      if (data.approved) {
        setSuccess('Your comment has been posted successfully!')
        if (post) {
          await loadComments(post.id)
        }
      } else {
        setSuccess('Your comment has been submitted and is awaiting moderation.')
      }

      setCommentForm({
        author_name: '',
        author_email: '',
        content: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit comment')
    } finally {
      setCommenting(false)
    }
  }

  if (loading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center">
          <LoadingSpinner />
          {redirecting && (
            <p className="mt-4 text-gray-600">Redirecting to external blog...</p>
          )}
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
          <p className="text-gray-600 mb-4">This blog post doesn't exist or has been removed.</p>
          <Link href="/blog" className="text-primary-600 hover:text-primary-700 font-semibold">
            ← Back to blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/images/quotla-logo.png" alt="Quotla" className="h-8 w-auto transform group-hover:scale-105 transition-transform" />
              <span className="text-xl font-bold text-gray-900">Quotla</span>
            </Link>
            <div className="flex gap-4">
              <Link href="/blog" className="text-gray-700 hover:text-gray-900 font-medium">
                Blog
              </Link>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article className="card mb-8">
              <Link href="/blog" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 font-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to blog
              </Link>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

              {post.published_at && (
                <div className="flex items-center text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {format(new Date(post.published_at), 'MMMM d, yyyy')}
                </div>
              )}

              <div className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>

              {/* Author Bio Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    Q
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Quotla Team</h3>
                    <p className="text-gray-600 leading-relaxed">
                      The Quotla team is dedicated to helping businesses create professional quotes and invoices with the power of AI.
                      We share insights, tips, and best practices to help you streamline your business operations and close more deals.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Comments Section */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments ({comments.length})</h2>

              {comments.length > 0 && (
                <div className="space-y-6 mb-8">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                          {comment.author_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 block">{comment.author_name}</span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(comment.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 ml-12">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Leave a Comment</h3>

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-4">
                    {success}
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="author_name" className="label">
                        Name
                      </label>
                      <input
                        type="text"
                        id="author_name"
                        required
                        className="input"
                        value={commentForm.author_name}
                        onChange={(e) =>
                          setCommentForm((prev) => ({ ...prev, author_name: e.target.value }))
                        }
                      />
                    </div>

                    <div>
                      <label htmlFor="author_email" className="label">
                        Email
                      </label>
                      <input
                        type="email"
                        id="author_email"
                        required
                        className="input"
                        value={commentForm.author_email}
                        onChange={(e) =>
                          setCommentForm((prev) => ({ ...prev, author_email: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="content" className="label">
                      Comment
                    </label>
                    <textarea
                      id="content"
                      required
                      className="input resize-none"
                      rows={4}
                      value={commentForm.content}
                      onChange={(e) =>
                        setCommentForm((prev) => ({ ...prev, content: e.target.value }))
                      }
                    />
                  </div>

                  <p className="text-sm text-gray-500">
                    Your comment will be reviewed before being published.
                  </p>

                  <button type="submit" disabled={commenting} className="btn btn-primary">
                    {commenting ? 'Submitting...' : 'Submit Comment'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Recent Posts Widget */}
              <div className="card bg-white">
                <h3 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  Recent Posts
                </h3>
                <div className="space-y-4">
                  {recentPosts
                    .filter((p) => p.slug !== post.slug)
                    .slice(0, 4)
                    .map((recentPost) => (
                      <Link
                        key={recentPost.id}
                        href={`/blog/${recentPost.slug}`}
                        className="block group"
                      >
                        <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 mb-1 transition-colors line-clamp-2">
                          {recentPost.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {recentPost.published_at && format(new Date(recentPost.published_at), 'MMM d, yyyy')}
                        </p>
                      </Link>
                    ))}
                </div>
              </div>

              {/* Share Widget */}
              <div className="card bg-white">
                <h3 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  Share This Post
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`, '_blank')}
                    className="flex flex-col items-center justify-center p-3 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
                    title="Share on X"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="text-xs mt-1">X</span>
                  </button>
                  <button
                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="flex flex-col items-center justify-center p-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
                    title="Share on LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="text-xs mt-1">LinkedIn</span>
                  </button>
                  <button
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="flex flex-col items-center justify-center p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    title="Share on Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-xs mt-1">Facebook</span>
                  </button>
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
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
