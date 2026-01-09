'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Client } from '@/types'

interface InlineClientCreatorProps {
  isOpen: boolean
  onClose: () => void
  onClientCreated: (client: Client) => void
}

export default function InlineClientCreator({ isOpen, onClose, onClientCreated }: InlineClientCreatorProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    notes: '',
  })

  const handleSubmit = async (e?: React.MouseEvent | React.FormEvent) => {
    e?.preventDefault()
    if (!user) return

    if (!formData.name.trim()) {
      setError('Client name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error: insertError } = await supabase
        .from('clients')
        .insert([
          {
            user_id: user.id,
            ...formData,
          },
        ])
        .select()
        .single()

      if (insertError) throw insertError

      if (data) {
        onClientCreated(data)
        setFormData({
          name: '',
          email: '',
          phone: '',
          company_name: '',
          address: '',
          city: '',
          state: '',
          postal_code: '',
          country: '',
          notes: '',
        })
        onClose()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create client')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 transition-opacity" onClick={onClose}></div>

        {/* Slide-over panel */}
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white dark:bg-primary-700 shadow-xl">
              {/* Header */}
              <div className="px-4 py-6 bg-quotla-orange">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-heading font-bold text-white" id="slide-over-title">
                    Add New Client
                  </h2>
                  <button
                    type="button"
                    className="text-white hover:text-gray-200 transition-colors"
                    onClick={onClose}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="mt-1 text-sm text-white/90">
                  Quickly add a new client without leaving this page
                </p>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="space-y-4">
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  {/* Required Fields */}
                  <div>
                    <label htmlFor="name" className="label">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="input"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="email" className="label">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="input"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="label">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="input"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label htmlFor="company_name" className="label">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="company_name"
                        name="company_name"
                        className="input"
                        value={formData.company_name}
                        onChange={handleChange}
                        placeholder="Acme Inc."
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="border-t border-gray-200 dark:border-primary-600 pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-primary-300 mb-3">
                      Address (Optional)
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="address" className="label">
                          Street Address
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          className="input"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="123 Main St"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="label">
                            City
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            className="input"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="New York"
                          />
                        </div>

                        <div>
                          <label htmlFor="state" className="label">
                            State/Province
                          </label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            className="input"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="NY"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="postal_code" className="label">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            id="postal_code"
                            name="postal_code"
                            className="input"
                            value={formData.postal_code}
                            onChange={handleChange}
                            placeholder="10001"
                          />
                        </div>

                        <div>
                          <label htmlFor="country" className="label">
                            Country
                          </label>
                          <input
                            type="text"
                            id="country"
                            name="country"
                            className="input"
                            value={formData.country}
                            onChange={handleChange}
                            placeholder="USA"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="label">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      className="input"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any additional information about this client..."
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 dark:border-primary-600 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-primary-600 text-gray-700 dark:text-primary-300 hover:bg-gray-50 dark:hover:bg-primary-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-quotla-orange text-white font-semibold hover:bg-secondary-600 transition-all shadow-lg shadow-quotla-orange/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Client'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
