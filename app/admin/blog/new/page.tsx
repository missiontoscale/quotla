'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import RichTextEditor from '@/components/blog/RichTextEditor'

export default function NewBlogPostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    meta_description: '',
    category: '',
    tags: [] as string[],
    og_image_url: '',
    reading_time_minutes: 5,
    featured: false,
    published: false,
  })

  const [tagInput, setTagInput] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else if (name === 'reading_time_minutes') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Auto-generate slug from title
    if (name === 'title' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setFormData((prev) => ({ ...prev, slug }))
    }

    // Auto-generate meta description from excerpt
    if (name === 'excerpt' && !formData.meta_description) {
      setFormData((prev) => ({ ...prev, meta_description: value.substring(0, 160) }))
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    if (!formData.title.trim() || !formData.slug.trim() || !formData.content.trim()) {
      setError('Title, slug, and content are required')
      setLoading(false)
      return
    }

    try {
      const { error: insertError } = await supabase.from('blog_posts').insert({
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt || null,
        content: formData.content,
        meta_description: formData.meta_description || null,
        category: formData.category || null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        og_image_url: formData.og_image_url || null,
        reading_time_minutes: formData.reading_time_minutes || null,
        featured: formData.featured,
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary-50">Create New Blog Post</h1>
        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className="btn btn-secondary"
        >
          {previewMode ? 'Edit' : 'Preview'}
        </button>
      </div>

      {previewMode ? (
        // PREVIEW MODE
        <div className="card">
          <article className="prose prose-lg max-w-none">
            <h1>{formData.title || 'Untitled Post'}</h1>
            {formData.excerpt && <p className="lead">{formData.excerpt}</p>}
            {formData.category && (
              <div className="text-sm text-primary-300 mb-4">
                Category: <span className="font-medium">{formData.category}</span>
              </div>
            )}
            {formData.tags.length > 0 && (
              <div className="flex gap-2 mb-6">
                {formData.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div dangerouslySetInnerHTML={{ __html: formData.content }} />
          </article>
          <div className="mt-8 pt-6 border-t">
            <button onClick={() => setPreviewMode(false)} className="btn btn-primary">
              Back to Edit
            </button>
          </div>
        </div>
      ) : (
        // EDIT MODE
        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="label">
                Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="input text-xl font-bold"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter your blog post title..."
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="label">
                URL Slug <span className="text-red-600">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-primary-400 text-sm">/blog/</span>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  required
                  className="input flex-1"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="url-friendly-slug"
                />
              </div>
              <p className="text-xs text-primary-400 mt-1">
                Auto-generated from title. Use lowercase letters, numbers, and hyphens only.
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="label">
                Excerpt <span className="text-primary-400 text-sm">(recommended)</span>
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                className="input resize-none"
                rows={3}
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="A brief summary that appears in blog listings and search results..."
                maxLength={300}
              />
              <p className="text-xs text-primary-400 mt-1">
                {formData.excerpt.length}/300 characters
              </p>
            </div>

            {/* Content (Rich Text Editor) */}
            <div>
              <label className="label">
                Content <span className="text-red-600">*</span>
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Start writing your blog post..."
              />
            </div>

            {/* Category and Reading Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="label">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="input"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>
                  <option value="Tax & Finance">Tax & Finance</option>
                  <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
                  <option value="Product Updates">Product Updates</option>
                  <option value="Guides & Tutorials">Guides & Tutorials</option>
                  <option value="Industry News">Industry News</option>
                </select>
              </div>

              <div>
                <label htmlFor="reading_time_minutes" className="label">
                  Reading Time (minutes)
                </label>
                <input
                  type="number"
                  id="reading_time_minutes"
                  name="reading_time_minutes"
                  min="1"
                  max="60"
                  className="input"
                  value={formData.reading_time_minutes}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="label">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className="input flex-1"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-primary-900 hover:text-primary-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* SEO Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">SEO & Social Media</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="meta_description" className="label">
                    Meta Description <span className="text-primary-400 text-sm">(for search engines)</span>
                  </label>
                  <textarea
                    id="meta_description"
                    name="meta_description"
                    className="input resize-none"
                    rows={2}
                    value={formData.meta_description}
                    onChange={handleChange}
                    placeholder="Description for Google search results..."
                    maxLength={160}
                  />
                  <p className="text-xs text-primary-400 mt-1">
                    {formData.meta_description.length}/160 characters (optimal: 120-160)
                  </p>
                </div>

                <div>
                  <label htmlFor="og_image_url" className="label">
                    Featured Image URL <span className="text-primary-400 text-sm">(for social media)</span>
                  </label>
                  <input
                    type="url"
                    id="og_image_url"
                    name="og_image_url"
                    className="input"
                    value={formData.og_image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-primary-400 mt-1">
                    Recommended: 1200x630px for best social media preview
                  </p>
                </div>
              </div>
            </div>

            {/* Publishing Options */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Publishing Options</h3>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-primary-500 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-primary-200">
                    <strong>Feature this post</strong> - Show at the top of the blog
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    name="published"
                    checked={formData.published}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-primary-500 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="published" className="ml-2 text-sm text-primary-200">
                    <strong>Publish immediately</strong> - Make this post visible to readers
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className="btn btn-secondary"
              >
                Preview
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Creating...' : formData.published ? 'Publish Post' : 'Save Draft'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
