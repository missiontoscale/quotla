'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { CURRENCIES } from '@/types'
import { validateFileUpload, validateImageUrl } from '@/lib/utils/validation'
import { supabase } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Building2, Globe, DollarSign, LogOut, Trash2, Upload, Camera } from 'lucide-react'

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
      }
    } catch (err) {
      console.error('Storage setup failed:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
          await setupStorage()
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (!storageReady) {
        await setupStorage()
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${profile?.id}-avatar-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('business-assets')
        .upload(filePath, file)

      if (uploadError) {
        if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
          await setupStorage()
          const { error: retryError } = await supabase.storage
            .from('business-assets')
            .upload(filePath, file)
          if (retryError) throw retryError
        } else {
          throw uploadError
        }
      }

      const { data } = supabase.storage.from('business-assets').getPublicUrl(filePath)

      await updateProfile({ avatar_url: data.publicUrl })
      setSuccess('Profile picture uploaded successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload profile picture')
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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl text-slate-100">Settings</h1>
          <p className="text-slate-400 mt-1">Manage your profile and business information</p>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-rose-500/20 border border-rose-500/50 text-rose-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Profile Section */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-violet-400" />
          <h2 className="text-xl text-slate-100 font-semibold">Profile</h2>
        </div>

        <div className="space-y-6">
          {/* Avatar */}
          <div>
            <Label className="text-sm text-slate-300 mb-3 block">Profile Picture</Label>
            <div className="flex items-center gap-6">
              <div className="relative group">
                {profile?.avatar_url && validateImageUrl(profile.avatar_url) ? (
                  <img
                    src={validateImageUrl(profile.avatar_url)!}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover border-4 border-slate-700"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-3xl font-semibold">
                      {profile?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-6 h-6 text-white" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <p className="text-slate-100 font-medium">{profile?.email}</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPEG, or WebP. Max 2MB.</p>
                <label htmlFor="avatar-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    className="mt-3 border-slate-700 text-slate-300 hover:bg-slate-800"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload New Picture'}
                  </Button>
                </label>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Business Information */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-5 h-5 text-violet-400" />
          <h2 className="text-xl text-slate-100 font-semibold">Business Information</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo */}
          <div>
            <Label className="text-sm text-slate-300 mb-3 block">Business Logo</Label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-lg bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
                {profile?.logo_url && validateImageUrl(profile.logo_url) ? (
                  <img src={validateImageUrl(profile.logo_url)!} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-600" />
                )}
              </div>
              <div className="flex-1">
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <p className="text-xs text-slate-400 mb-3">PNG, JPEG, or WebP. Max 2MB.</p>
                <label htmlFor="logo-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                  </Button>
                </label>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-sm text-slate-300">Company Name</Label>
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_number" className="text-sm text-slate-300">Business Number</Label>
              <Input
                id="business_number"
                name="business_number"
                value={formData.business_number}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_id" className="text-sm text-slate-300">Tax ID</Label>
              <Input
                id="tax_id"
                name="tax_id"
                value={formData.tax_id}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm text-slate-300">Phone</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="website" className="text-sm text-slate-300">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="bg-slate-800 border-slate-700 text-slate-100 pl-10"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address" className="text-sm text-slate-300">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm text-slate-300">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm text-slate-300">State/Province</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code" className="text-sm text-slate-300">Postal Code</Label>
              <Input
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm text-slate-300">Country</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="default_currency" className="text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Default Currency
                </div>
              </Label>
              <Select
                value={formData.default_currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, default_currency: value }))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name} ({currency.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="bg-violet-500 hover:bg-violet-600 text-white">
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Account Actions */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <h2 className="text-xl text-slate-100 font-semibold mb-4">Account Actions</h2>
        <div className="space-y-4">
          <div>
            <p className="text-slate-400 mb-3">Sign out of your account</p>
            <Button
              onClick={async () => {
                try {
                  await signOut()
                } catch (err) {
                  setError('Failed to sign out')
                }
              }}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-slate-900 border-rose-500/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="w-5 h-5 text-rose-400" />
          <h2 className="text-xl text-rose-400 font-semibold">Danger Zone</h2>
        </div>
        <p className="text-slate-400 mb-4">
          Once you delete your account, there is no going back. All your data including quotes, invoices, clients, and settings will be permanently deleted.
        </p>

        {!showDeleteConfirm ? (
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="destructive"
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete My Account
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="bg-rose-500/20 border border-rose-500/50 p-4 rounded-lg">
              <p className="text-rose-400 font-medium mb-2">This action cannot be undone!</p>
              <p className="text-slate-400 text-sm">
                Type <strong className="text-rose-400">DELETE MY ACCOUNT</strong> below to confirm:
              </p>
            </div>
            <Input
              type="text"
              className="bg-slate-800 border-slate-700 text-slate-100"
              placeholder="Type DELETE MY ACCOUNT"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                variant="destructive"
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {deleting ? 'Deleting...' : 'Permanently Delete Account'}
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteConfirmText('')
                }}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
