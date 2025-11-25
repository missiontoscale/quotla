'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { CURRENCIES } from '@/types'
import { validateFileUpload } from '@/lib/utils/validation'
import { supabase } from '@/lib/supabase/client'

export default function SettingsPage() {
  const { profile, updateProfile, signOut, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [storageReady, setStorageReady] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const [formData, setFormData] = useState({
    company_name: profile?.company_name || '',
    business_number: profile?.business_number || '',
    tax_id: profile?.tax_id || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    postal_code: profile?.postal_code || '',
    country: profile?.country || '',
    phone: profile?.phone || '',
    website: profile?.website || '',
    default_currency: profile?.default_currency || 'USD',
  })

  useEffect(() => {
    setupStorage()
  }, [])

  const setupStorage = async () => {
    try {
      const response = await fetch('/api/storage/setup', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        setStorageReady(true)
        if (data.created) {
          console.log('Storage bucket created')
        }
      }
    } catch (err) {
      console.error('Storage setup failed:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateFileUpload(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Ensure storage is ready
      if (!storageReady) {
        await setupStorage()
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${profile?.id}-${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('business-assets')
        .upload(filePath, file)

      if (uploadError) {
        // If bucket not found, try to create it
        if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
          await setupStorage()
          // Retry upload
          const { error: retryError } = await supabase.storage
            .from('business-assets')
            .upload(filePath, file)
          if (retryError) throw retryError
        } else {
          throw uploadError
        }
      }

      const { data } = supabase.storage.from('business-assets').getPublicUrl(filePath)

      await updateProfile({ logo_url: data.publicUrl })
      setSuccess('Logo uploaded successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload logo')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await updateProfile(formData)
      setSuccess('Settings updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type DELETE MY ACCOUNT to confirm')
      return
    }

    setDeleting(true)
    setError('')

    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          confirmText: deleteConfirmText,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      await signOut()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Business Settings</h1>

      <div className="card space-y-6">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold mb-4">Business Logo</h2>
          <div className="flex items-center gap-4">
            {profile?.logo_url && (
              <img src={profile.logo_url} alt="Logo" className="h-16 w-16 object-contain" />
            )}
            <div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">PNG, JPEG, or WebP. Max 2MB.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              />
            </div>

            <div>
              <label htmlFor="business_number" className="label">
                Business Number
              </label>
              <input
                type="text"
                id="business_number"
                name="business_number"
                className="input"
                value={formData.business_number}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="tax_id" className="label">
                Tax ID
              </label>
              <input
                type="text"
                id="tax_id"
                name="tax_id"
                className="input"
                value={formData.tax_id}
                onChange={handleChange}
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
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="website" className="label">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                className="input"
                value={formData.website}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="label">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                className="input"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

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
              />
            </div>

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
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="default_currency" className="label">
                Default Currency
              </label>
              <select
                id="default_currency"
                name="default_currency"
                className="input"
                value={formData.default_currency}
                onChange={handleChange}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      <div className="card mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Account Actions</h2>
        <div className="space-y-4">
          <div>
            <p className="text-gray-600 mb-2">Sign out of your account</p>
            <button
              onClick={async () => {
                try {
                  await signOut()
                } catch (err) {
                  setError('Failed to sign out')
                }
              }}
              className="btn btn-secondary"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="card mt-8 border-red-200">
        <h2 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h2>
        <p className="text-gray-600 mb-4">
          Once you delete your account, there is no going back. All your data including quotes, invoices, clients, and settings will be permanently deleted.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700"
          >
            Delete My Account
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <p className="text-red-800 font-medium mb-2">This action cannot be undone!</p>
              <p className="text-red-700 text-sm">
                Type <strong>DELETE MY ACCOUNT</strong> below to confirm:
              </p>
            </div>
            <input
              type="text"
              className="input"
              placeholder="Type DELETE MY ACCOUNT"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Permanently Delete Account'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteConfirmText('')
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
