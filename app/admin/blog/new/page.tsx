'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'

export default function NewBlogPostPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    published: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Auto-generate slug from title
    if (name === 'title' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!user || !profile?.is_admin) {
      setError('Unauthorized')
      setLoading(false)
      return
    }

    if (!formData.title.trim() || !formData.slug.trim() || !formData.content.trim()) {
      setError('Title, slug, and content are required')
      setLoading(false)
      return
    }

    try {
      const { error: insertError } = await supabase.from('blog_posts')
        // @ts-ignore - Supabase type inference issue
        .insert({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt || null,
          content: formData.content,
          author_id: user.id,
          published: formData.published,
          published_at: formData.published ? new Date().toISOString() : null,
        })

      if (insertError) throw insertError

      router.push('/admin/blog')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create blog post')
    } finally {
      setLoading(false)
    }
  }

  if (!profile?.is_admin) {
    return <div>Access denied</div>
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Blog Post</h1>

      <div className="card">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="label">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="input"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="slug" className="label">
              Slug <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              required
              className="input"
              value={formData.slug}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500 mt-1">
              URL-friendly version (e.g., my-blog-post). Auto-generated from title.
            </p>
          </div>

          <div>
            <label htmlFor="excerpt" className="label">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              className="input resize-none"
              rows={3}
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Brief summary of the post (optional)"
            />
          </div>

          <div>
            <label htmlFor="content" className="label">
              Content <span className="text-red-600">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              required
              className="input resize-none font-mono text-sm"
              rows={20}
              value={formData.content}
              onChange={handleChange}
              placeholder="HTML content of your blog post"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can use HTML markup for formatting.
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, published: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="published" className="ml-2 text-sm text-gray-700">
              Publish immediately
            </label>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
