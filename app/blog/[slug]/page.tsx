'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BlogPost, BlogComment } from '@/types'
import { format } from 'date-fns'

export default function BlogPostPage() {
  const params = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
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
    return <div>Loading...</div>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <article className="card mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          {post.published_at && (
            <div className="text-sm text-gray-500 mb-8">
              {format(new Date(post.published_at), 'MMMM d, yyyy')}
            </div>
          )}
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </article>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments ({comments.length})</h2>

          {comments.length > 0 && (
            <div className="space-y-6 mb-8">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">{comment.author_name}</span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(comment.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
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
      </main>
    </div>
  )
}
