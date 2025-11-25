'use client'

import { useState } from 'react'
import Link from 'next/link'
import { validateEmail } from '@/lib/utils/validation'

export default function NewsletterPage() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'newsletter_page',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to subscribe')
      }

      setSuccess(true)
      setFormData({ email: '', name: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
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
              <Link href="/login" className="btn btn-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Subscribe to Our Newsletter</h1>
          <p className="text-xl text-gray-600">
            Get the latest tips, updates, and insights on professional business management
            delivered to your inbox
          </p>
        </div>

        <div className="card">
          {success ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4 text-green-600">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you for subscribing!</h2>
              <p className="text-gray-600 mb-6">
                We&apos;ve sent a confirmation email to {formData.email}
              </p>
              <Link href="/" className="btn btn-primary">
                Back to Home
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="label">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="input"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div>
                  <label htmlFor="name" className="label">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="input"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <button type="submit" disabled={loading} className="w-full btn btn-primary">
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>We respect your privacy. Unsubscribe at any time.</p>
              </div>
            </>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <h3 className="font-bold mb-1">Weekly Updates</h3>
            <p className="text-sm text-gray-600">Get the latest news every week</p>
          </div>
          <div className="text-center">
            <h3 className="font-bold mb-1">Expert Tips</h3>
            <p className="text-sm text-gray-600">Learn from industry professionals</p>
          </div>
          <div className="text-center">
            <h3 className="font-bold mb-1">Exclusive Content</h3>
            <p className="text-sm text-gray-600">Subscriber-only resources</p>
          </div>
        </div>
      </main>
    </div>
  )
}
