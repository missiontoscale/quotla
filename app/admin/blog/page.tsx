'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BlogPost } from '@/types'
import { format } from 'date-fns'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function AdminBlogPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile && !profile.is_admin) {
      router.push('/dashboard')
      return
    }

    if (profile?.is_admin) {
      loadPosts()
    }
  }, [profile, router])

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPosts(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    const { error } = await supabase.from('blog_posts').delete().eq('id', id)

    if (!error) {
      setPosts(posts.filter((p) => p.id !== id))
    }
  }

  const togglePublish = async (post: BlogPost) => {
    const { error } = await supabase
      .from('blog_posts')
      // @ts-ignore - Supabase type inference issue
      .update({
        published: !post.published,
        published_at: !post.published ? new Date().toISOString() : null,
      })
      .eq('id', post.id)

    if (!error) {
      loadPosts()
    }
  }

  if (!profile?.is_admin) {
    return <div>Access denied</div>
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
        <Link href="/admin/blog/new" className="btn btn-primary">
          Create Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No blog posts yet</p>
          <Link href="/admin/blog/new" className="btn btn-primary inline-block">
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{post.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        post.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  {post.excerpt && <p className="text-gray-600 mb-2">{post.excerpt}</p>}
                  <div className="text-sm text-gray-500">
                    <span>Created: {format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                    {post.published_at && (
                      <span className="ml-4">
                        Published: {format(new Date(post.published_at), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => togglePublish(post)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    {post.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
