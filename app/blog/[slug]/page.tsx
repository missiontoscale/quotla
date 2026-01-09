'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BlogPost, BlogComment } from '@/types'
import { BlogConfig } from '@/types/blog'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import { sanitizeHtmlContent } from '@/lib/utils/validation'

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
  const [isMarkdown, setIsMarkdown] = useState(false)

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
    // Load from Supabase directly without checking external redirects
    loadPost()
    loadRecentPosts()
  }

  const loadPost = async () => {
    // Try to load from database first
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', params.slug as string)
      .eq('published', true)
      .single()

    if (!error && data) {
      setPost(data as BlogPost)
      loadComments((data as BlogPost).id)
      setLoading(false)
      return
    }

    // If not in database, try markdown
    try {
      const response = await fetch(`/api/blog/markdown/${params.slug}`)
      if (response.ok) {
        const markdownPost = await response.json()
        // Convert to BlogPost format
        const convertedPost: BlogPost = {
          id: markdownPost.slug,
          title: markdownPost.title,
          slug: markdownPost.slug,
          excerpt: markdownPost.excerpt,
          content: markdownPost.content,
          author_id: 'markdown',
          published: markdownPost.published,
          published_at: markdownPost.date,
          created_at: markdownPost.date,
          category: markdownPost.category,
          tags: markdownPost.tags,
          reading_time_minutes: markdownPost.readingTime,
          featured_image_url: markdownPost.image
        }
        setPost(convertedPost)
        setIsMarkdown(true)
        // Markdown posts don't have comments in database
      }
    } catch (err) {
      // Silently fail if unable to load markdown post
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
            <p className="mt-4 text-primary-300">Redirecting to external blog...</p>
          )}
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-50 mb-4">Post not found</h1>
          <p className="text-primary-300 mb-4">This blog post doesn't exist or has been removed.</p>
          <Link href="/blog" className="text-primary-600 hover:text-primary-700 font-semibold">
            ← Back to blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <nav className="sticky top-0 z-50 bg-quotla-dark/95 dark:bg-quotla-dark/95 backdrop-blur-xl border-b border-quotla-light/20 dark:border-quotla-light/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/images/logos/icons/Quotla icon dark.svg" alt="Quotla" className="h-12 w-auto transform group-hover:scale-105 transition-transform" />
              <span className="text-xl font-bold text-quotla-light dark:text-quotla-light">Quotla</span>
            </Link>
            <div className="flex gap-4">
              <Link href="/blog" className="text-quotla-light/80 hover:text-quotla-light font-medium">
                Blog
              </Link>
              {isAuthenticated ? (
                <Link href="/business/dashboard" className="btn btn-primary">
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
            <article className="bg-[#FAF9F6] dark:bg-primary-900 rounded-xl shadow-sm border border-quotla-orange/20 overflow-hidden mb-8">
              {/* Header gradient */}
              <div className="h-2 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700" />

              <div className="p-8 lg:p-12">
                <Link href="/blog" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8 font-semibold text-sm group">
                  <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to all articles
                </Link>

                <h1 className="text-4xl lg:text-5xl font-bold text-quotla-dark dark:text-quotla-light mb-6 leading-tight">{post.title}</h1>

                {post.published_at && (
                  <div className="flex flex-wrap items-center gap-4 text-sm mb-8 pb-8 border-b-2 border-primary-600">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
                      <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-primary-200">{format(new Date(post.published_at), 'MMMM d, yyyy')}</span>
                    </div>
                    {post.reading_time_minutes && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-700 rounded-lg">
                        <svg className="w-4 h-4 text-primary-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-primary-300">{post.reading_time_minutes} min read</span>
                      </div>
                    )}
                    {post.category && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-quotla-light rounded-lg shadow-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                        <span className="font-semibold">{post.category}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mb-8">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-primary-50 text-primary-700 border border-primary-100 hover:bg-primary-100 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="prose prose-lg max-w-none
                  prose-headings:font-bold prose-headings:text-primary-50
                  prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-10 prose-h1:pb-4 prose-h1:border-b prose-h1:border-primary-600
                  prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:pb-3 prose-h2:border-b prose-h2:border-primary-600
                  prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-8 prose-h3:text-primary-900
                  prose-p:text-primary-200 prose-p:leading-relaxed prose-p:mb-5 prose-p:text-lg
                  prose-a:text-primary-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline hover:prose-a:text-primary-700
                  prose-strong:text-primary-50 prose-strong:font-bold
                  prose-em:text-primary-100 prose-em:italic
                  prose-code:text-primary-700 prose-code:bg-primary-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:border prose-code:border-primary-100
                  prose-pre:bg-primary-800 prose-pre:text-primary-100 prose-pre:rounded-xl prose-pre:shadow-lg prose-pre:border prose-pre:border-primary-700
                  prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-2 prose-blockquote:italic prose-blockquote:text-primary-200 prose-blockquote:bg-primary-50 prose-blockquote:rounded-r-lg
                  prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ul:space-y-2
                  prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6 prose-ol:space-y-2
                  prose-li:text-primary-200 prose-li:text-lg prose-li:leading-relaxed
                  prose-img:rounded-xl prose-img:shadow-xl prose-img:border prose-img:border-primary-600
                  prose-table:border-collapse prose-table:w-full prose-table:shadow-md prose-table:rounded-lg prose-table:overflow-hidden
                  prose-th:bg-gradient-to-r prose-th:from-primary-500 prose-th:to-primary-600 prose-th:text-quotla-light prose-th:p-4 prose-th:text-left prose-th:font-bold
                  prose-td:p-4 prose-td:border prose-td:border-primary-600 prose-td:text-primary-200
                  prose-tr:even:bg-primary-700
                  prose-hr:border-primary-600 prose-hr:my-10
                ">
                  {isMarkdown ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    >
                      {post.content}
                    </ReactMarkdown>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(post.content) }} />
                  )}
                </div>

                  {/* Author Bio Section */}
                <div className="mt-12 pt-8 border-t-2 border-primary-600">
                  <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
                    <div className="flex items-start gap-5">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center text-quotla-light text-3xl font-bold flex-shrink-0 shadow-lg">
                        Q
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary-50 mb-2">Written by Quotla Team</h3>
                        <p className="text-primary-200 leading-relaxed mb-4">
                          The Quotla team is dedicated to helping businesses create professional quotes and invoices with the power of AI.
                          We share insights, tips, and best practices to help you streamline your business operations and close more deals.
                        </p>
                        <div className="flex gap-3">
                          <a href="https://twitter.com/quotla" target="_blank" rel="noopener noreferrer" className="text-primary-300 hover:text-primary-600 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          </a>
                          <a href="https://linkedin.com/company/quotla" target="_blank" rel="noopener noreferrer" className="text-primary-300 hover:text-primary-600 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Comments Section */}
            <div className="bg-[#FAF9F6] dark:bg-primary-900 rounded-xl shadow-sm border border-quotla-orange/20 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-700 to-primary-600 px-8 py-6 border-b border-primary-600">
                <h2 className="text-2xl font-bold text-primary-50 flex items-center gap-3">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Comments ({comments.length})
                </h2>
              </div>
              <div className="p-8">

              {comments.length > 0 && (
                <div className="space-y-6 mb-8">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                          {comment.author_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-primary-50 block">{comment.author_name}</span>
                          <span className="text-sm text-primary-400">
                            {format(new Date(comment.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <p className="text-primary-200 ml-12">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-primary-50 mb-4">Leave a Comment</h3>

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

                  <p className="text-sm text-primary-400">
                    Your comment will be reviewed before being published.
                  </p>

                  <button type="submit" disabled={commenting} className="btn btn-primary">
                    {commenting ? 'Submitting...' : 'Submit Comment'}
                  </button>
                </form>
              </div>
            </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Recent Posts Widget */}
              <div className="bg-[#FAF9F6] dark:bg-primary-900 rounded-xl shadow-sm border border-quotla-orange/20 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                  <h3 className="text-lg font-bold text-quotla-light flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                    </svg>
                    Recent Articles
                  </h3>
                </div>
                <div className="p-6">
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
                        <h4 className="font-semibold text-primary-50 group-hover:text-primary-600 mb-1 transition-colors line-clamp-2">
                          {recentPost.title}
                        </h4>
                        <p className="text-sm text-primary-400">
                          {recentPost.published_at && format(new Date(recentPost.published_at), 'MMM d, yyyy')}
                        </p>
                      </Link>
                    ))}
                </div>
                </div>
              </div>

              {/* Share Widget */}
              <div className="bg-[#FAF9F6] dark:bg-primary-900 rounded-xl shadow-sm border border-quotla-orange/20 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                  <h3 className="text-lg font-bold text-quotla-light flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                    </svg>
                    Share Article
                  </h3>
                </div>
                <div className="p-6">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`, '_blank')}
                    className="flex flex-col items-center justify-center p-3 bg-quotla-dark hover:bg-quotla-dark/80 text-quotla-light rounded-lg transition-colors"
                    title="Share on X"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="text-xs mt-1">X</span>
                  </button>
                  <button
                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="flex flex-col items-center justify-center p-3 bg-quotla-dark hover:bg-quotla-dark/80 text-quotla-light rounded-lg transition-colors"
                    title="Share on LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="text-xs mt-1">LinkedIn</span>
                  </button>
                  <button
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="flex flex-col items-center justify-center p-3 bg-quotla-dark hover:bg-quotla-dark/80 text-quotla-light rounded-lg transition-colors"
                    title="Share on Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-xs mt-1">Facebook</span>
                  </button>
                </div>
                </div>
              </div>

              {/* About Widget */}
              <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl shadow-lg border-2 border-primary-400 overflow-hidden">
                <div className="p-6 text-quotla-light">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-quotla-light/20 flex items-center justify-center text-2xl font-bold">
                      Q
                    </div>
                    <h3 className="text-xl font-bold">
                      Try Quotla Free
                    </h3>
                  </div>
                  <p className="text-primary-50 mb-5 leading-relaxed">
                    Create professional quotes and invoices with AI-powered assistance. Join thousands of businesses streamlining their workflow.
                  </p>
                  <Link
                    href="/signup"
                    className="block w-full text-center bg-quotla-light text-quotla-dark font-bold py-3 px-6 rounded-lg hover:bg-quotla-light/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Get Started Free →
                  </Link>
                  <p className="text-primary-100 text-xs text-center mt-3">
                    No credit card required
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
