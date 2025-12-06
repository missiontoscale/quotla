'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BlogComment, NewsletterSubscriber } from '@/types'
import { format } from 'date-fns'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function AdminPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [comments, setComments] = useState<BlogComment[]>([])
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile && !profile.is_admin) {
      router.push('/dashboard')
      return
    }

    if (profile?.is_admin) {
      loadData()
    }
  }, [profile, router])

  const loadData = async () => {
    const [commentsRes, subscribersRes] = await Promise.all([
      supabase
        .from('blog_comments')
        .select('*')
        .eq('approved', false)
        .order('created_at', { ascending: false }),
      supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('subscribed', true)
        .order('created_at', { ascending: false }),
    ])

    if (commentsRes.data) setComments(commentsRes.data)
    if (subscribersRes.data) setSubscribers(subscribersRes.data)
    setLoading(false)
  }

  const handleApproveComment = async (id: string) => {
    const { error } = await supabase
      .from('blog_comments')
      // @ts-ignore - Supabase type inference issue
      .update({ approved: true, approved_by: profile?.id, approved_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      setComments(comments.filter((c) => c.id !== id))
    }
  }

  const handleRejectComment = async (id: string) => {
    if (!confirm('Are you sure you want to reject this comment?')) return

    const { error } = await supabase.from('blog_comments').delete().eq('id', id)

    if (!error) {
      setComments(comments.filter((c) => c.id !== id))
    }
  }

  if (!profile?.is_admin) {
    return <div>Access denied</div>
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Link href="/admin/blog" className="btn btn-primary">
          Manage Blog Posts
        </Link>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Pending Comments ({comments.length})</h2>

        {comments.length === 0 ? (
          <p className="text-gray-500">No pending comments</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium">{comment.author_name}</span>
                    <span className="text-sm text-gray-500 ml-2">{comment.author_email}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {format(new Date(comment.created_at), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <p className="text-gray-700 mb-4">{comment.content}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveComment(comment.id)}
                    className="btn btn-primary text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectComment(comment.id)}
                    className="btn btn-danger text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Newsletter Subscribers ({subscribers.length})</h2>

        {subscribers.length === 0 ? (
          <p className="text-gray-500">No subscribers yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Source</th>
                  <th className="text-left py-3 px-4">Subscribed At</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b">
                    <td className="py-3 px-4">{subscriber.email}</td>
                    <td className="py-3 px-4">{subscriber.name || '-'}</td>
                    <td className="py-3 px-4">{subscriber.source || '-'}</td>
                    <td className="py-3 px-4">
                      {format(new Date(subscriber.created_at), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
