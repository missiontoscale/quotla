'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BlogPost, BlogComment } from '@/types'
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

  const [commentForm, setCommentForm] = useState({
    author_name: '',
    author_email: '',
    content: '',
  })

  useEffect(() => {
    checkAuth()
    loadPost()
    loadRecentPosts()
  }, [params.slug])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setIsAuthenticated(!!session)
  }

  const loadPost = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', params.slug as string)
      .eq('published', true)
      .single()

    if (!error && data) {
      setPost(data)
      loadComments(data.id)
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
        // Reload comments to show the new one
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

  if (loading) {
    return <LoadingSpinner />
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
          <Link href="/blog" className="text-primary-600 hover:text-primary-700">
            Back to blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Quotla
            </Link>
            <div className="flex gap-4">
              <Link href="/blog" className="text-gray-700 hover:text-gray-900">
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
              <Link href="/blog" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
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
            <div className="sticky top-8 space-y-8">
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
                    onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`, '_blank')}
                    className="flex flex-col items-center justify-center p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    title="Share on WhatsApp"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="text-xs mt-1">WhatsApp</span>
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
                  <button
                    onClick={() => window.open(`https://www.instagram.com/`, '_blank')}
                    className="flex flex-col items-center justify-center p-3 bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white rounded-lg transition-colors"
                    title="Share on Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                    </svg>
                    <span className="text-xs mt-1">Instagram</span>
                  </button>
                  <button
                    onClick={() => window.open(`https://www.threads.net/`, '_blank')}
                    className="flex flex-col items-center justify-center p-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
                    title="Share on Threads"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142l-.126.742a12.933 12.933 0 0 0-2.816-.133c-1.15.067-2.116.408-2.794 1.014-.652.582-1.008 1.375-.969 2.168.042.808.494 1.501 1.275 1.952.637.368 1.438.544 2.32.51 1.314-.051 2.351-.538 3.083-1.445.63-.781 1.003-1.754 1.109-2.898l.02-.234.228.044c.118.02.236.039.353.053.785.093 1.409.312 1.856.653.538.41.94.997 1.196 1.749.385 1.133.407 3.407-1.475 5.313-1.648 1.667-3.692 2.395-6.642 2.418ZM12 9.133c-.018 0-.035.001-.053.001l.053-.001Z"/>
                    </svg>
                    <span className="text-xs mt-1">Threads</span>
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
      </main>
      <Footer />
    </div>
  )
}
