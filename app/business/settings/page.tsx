'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { CURRENCIES } from '@/types'
import { validateFileUpload, validateImageUrl } from '@/lib/utils/validation'
import { supabase } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormSection } from '@/components/ui/form-section'
import { useToast } from '@/hooks/use-toast'
import type { CalendlyConnection, CalendlyEventType } from '@/types/calendly'
import type { StripeConnection } from '@/types/stripe'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  User,
  Building2,
  Globe,
  DollarSign,
  LogOut,
  Trash2,
  Upload,
  Camera,
  Settings,
  Link2,
  CalendarIcon,
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  MapPin,
  Phone,
  FileText,
  Shield
} from 'lucide-react'

const DELETE_REASONS = [
  { value: 'not_useful', label: 'The app is not useful for my needs' },
  { value: 'too_complex', label: 'Too complex to use' },
  { value: 'found_alternative', label: 'Found a better alternative' },
  { value: 'closing_business', label: 'Closing my business' },
  { value: 'privacy_concerns', label: 'Privacy concerns' },
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'custom', label: 'Other reason...' },
]

function SettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile, updateProfile, signOut, user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [storageReady, setStorageReady] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showReasonStep, setShowReasonStep] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Integration states
  const [integrationsLoading, setIntegrationsLoading] = useState(true)
  const [calendlyConnection, setCalendlyConnection] = useState<CalendlyConnection | null>(null)
  const [calendlyEventTypes, setCalendlyEventTypes] = useState<CalendlyEventType[]>([])
  const [calendlyDisconnecting, setCalendlyDisconnecting] = useState(false)
  const [stripeConnection, setStripeConnection] = useState<StripeConnection | null>(null)
  const [stripeDisconnecting, setStripeDisconnecting] = useState(false)

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
    default_currency: profile?.default_currency || 'NGN',
  })

  useEffect(() => {
    setupStorage()
    loadIntegrations()
    checkCallbackStatus()
  }, [])

  const checkCallbackStatus = () => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'calendly_connected') {
      toast({
        title: 'Calendly Connected',
        description: 'Your Calendly account has been connected successfully.',
      })
      router.replace('/settings')
    } else if (success === 'stripe_connected') {
      toast({
        title: 'Stripe Connected',
        description: 'Your Stripe account has been connected successfully.',
      })
      router.replace('/settings')
    } else if (error) {
      let errorMessage = 'Connection failed'
      switch (error) {
        case 'calendly_denied':
          errorMessage = 'You denied access to Calendly'
          break
        case 'stripe_denied':
          errorMessage = 'You denied access to Stripe'
          break
        case 'invalid_callback':
          errorMessage = 'Invalid callback response'
          break
        case 'invalid_state':
          errorMessage = 'Security validation failed'
          break
        case 'oauth_failed':
          errorMessage = 'OAuth authorization failed'
          break
        case 'stripe_connect_failed':
          errorMessage = 'Failed to connect Stripe'
          break
      }
      toast({
        title: 'Connection Failed',
        description: errorMessage,
        variant: 'destructive',
      })
      router.replace('/settings')
    }
  }

  const loadIntegrations = async () => {
    try {
      setIntegrationsLoading(true)

      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      // Fetch Calendly connection
      const { data: calendlyData } = await supabase
        .from('calendly_connections' as any)
        .select('*')
        .eq('user_id', authUser.id)
        .eq('is_active', true)
        .maybeSingle()

      if (calendlyData) {
        setCalendlyConnection(calendlyData as CalendlyConnection)
        // Fetch event types
        try {
          const response = await fetch('/api/calendly/events')
          if (response.ok) {
            const data = await response.json()
            setCalendlyEventTypes(data.event_types || [])
          }
        } catch (err) {
          console.error('Error fetching event types:', err)
        }
      }

      // Fetch Stripe connection
      const { data: stripeData } = await supabase
        .from('stripe_connections' as any)
        .select('*')
        .eq('user_id', authUser.id)
        .eq('is_active', true)
        .maybeSingle()

      if (stripeData) {
        setStripeConnection(stripeData as StripeConnection)
      }
    } catch (err) {
      console.error('Error loading integrations:', err)
    } finally {
      setIntegrationsLoading(false)
    }
  }

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
      toast({ title: 'Error', description: validation.error || 'Invalid file', variant: 'destructive' })
      return
    }

    setUploading(true)

    try {
      if (!storageReady) await setupStorage()

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
      toast({ title: 'Success', description: 'Logo uploaded successfully' })
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to upload logo', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateFileUpload(file)
    if (!validation.valid) {
      toast({ title: 'Error', description: validation.error || 'Invalid file', variant: 'destructive' })
      return
    }

    setUploading(true)

    try {
      if (!storageReady) await setupStorage()

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
      toast({ title: 'Success', description: 'Profile picture uploaded successfully' })
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to upload profile picture', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile(formData)
      toast({ title: 'Success', description: 'Settings updated successfully' })
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to update settings', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    const reason = deleteReason === 'custom' ? customReason : deleteReason
    if (!reason) {
      toast({ title: 'Error', description: 'Please select a reason for leaving', variant: 'destructive' })
      return
    }

    setDeleting(true)

    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          confirmText: 'DELETE MY ACCOUNT',
          reason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      await signOut()
      router.push('/')
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to delete account', variant: 'destructive' })
      setDeleting(false)
    }
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setShowReasonStep(false)
    setDeleteReason('')
    setCustomReason('')
  }

  // Integration handlers
  const handleCalendlyConnect = () => {
    window.location.href = '/api/calendly/auth/connect'
  }

  const handleCalendlyDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Calendly?')) return

    setCalendlyDisconnecting(true)
    try {
      const response = await fetch('/api/calendly/auth/disconnect', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to disconnect')

      toast({ title: 'Disconnected', description: 'Calendly has been disconnected successfully.' })
      setCalendlyConnection(null)
      setCalendlyEventTypes([])
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to disconnect Calendly', variant: 'destructive' })
    } finally {
      setCalendlyDisconnecting(false)
    }
  }

  const handleStripeConnect = () => {
    window.location.href = '/api/stripe/auth/connect'
  }

  const handleStripeDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Stripe?')) return

    setStripeDisconnecting(true)
    try {
      const response = await fetch('/api/stripe/auth/disconnect', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to disconnect')

      toast({ title: 'Disconnected', description: 'Stripe has been disconnected successfully.' })
      setStripeConnection(null)
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to disconnect Stripe', variant: 'destructive' })
    } finally {
      setStripeDisconnecting(false)
    }
  }

  return (
    <div className="space-y-6 pb-8 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your profile, business, and integrations</p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Business */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet-500/10 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-100">Profile</h2>
                  <p className="text-xs text-slate-500">Your personal account details</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  {profile?.avatar_url && validateImageUrl(profile.avatar_url) ? (
                    <img
                      src={validateImageUrl(profile.avatar_url)!}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover border-2 border-slate-700"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-2xl font-semibold">
                        {profile?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-white" />
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
                  <p className="text-xs text-slate-500 mt-1">PNG, JPEG, or WebP. Max 2MB.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    className="mt-3 border-slate-700 text-slate-300 hover:bg-slate-800 h-8 text-xs"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Upload className="w-3 h-3 mr-2" />
                    {uploading ? 'Uploading...' : 'Change Picture'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Business Information */}
          <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-100">Business Information</h2>
                  <p className="text-xs text-slate-500">Details that appear on invoices and documents</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Logo Upload */}
              <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg">
                <div className="w-16 h-16 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profile?.logo_url && validateImageUrl(profile.logo_url) ? (
                    <img src={validateImageUrl(profile.logo_url)!} alt="Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">Business Logo</p>
                  <p className="text-xs text-slate-500 mt-0.5">PNG, JPEG, or WebP. Max 2MB.</p>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    className="mt-2 border-slate-700 text-slate-300 hover:bg-slate-800 h-7 text-xs"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    <Upload className="w-3 h-3 mr-1.5" />
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                  </Button>
                </div>
              </div>

              {/* Company Details */}
              <FormSection title="Company Details" icon={FileText}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="company_name" className="text-xs text-slate-400">Company Name</Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      className="bg-slate-800 border-slate-700 text-slate-100 h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="business_number" className="text-xs text-slate-400">Business Number</Label>
                    <Input
                      id="business_number"
                      name="business_number"
                      value={formData.business_number}
                      onChange={handleChange}
                      placeholder="Optional"
                      className="bg-slate-800 border-slate-700 text-slate-100 h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tax_id" className="text-xs text-slate-400">Tax ID</Label>
                    <Input
                      id="tax_id"
                      name="tax_id"
                      value={formData.tax_id}
                      onChange={handleChange}
                      placeholder="Optional"
                      className="bg-slate-800 border-slate-700 text-slate-100 h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs text-slate-400">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Optional"
                        className="bg-slate-800 border-slate-700 text-slate-100 h-9 text-sm pl-9"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label htmlFor="website" className="text-xs text-slate-400">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <Input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://example.com"
                        className="bg-slate-800 border-slate-700 text-slate-100 h-9 text-sm pl-9"
                      />
                    </div>
                  </div>
                </div>
              </FormSection>

              {/* Address */}
              <FormSection title="Business Address" icon={MapPin} collapsible defaultOpen={false}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2 space-y-1.5">
                    <Label htmlFor="address" className="text-xs text-slate-400">Street Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="bg-slate-800 border-slate-700 text-slate-100 h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs text-slate-400">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="bg-slate-800 border-slate-700 text-slate-100 h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-xs text-slate-400">State/Province</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="bg-slate-800 border-slate-700 text-slate-100 h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="postal_code" className="text-xs text-slate-400">Postal Code</Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className="bg-slate-800 border-slate-700 text-slate-100 h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-xs text-slate-400">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="bg-slate-800 border-slate-700 text-slate-100 h-9 text-sm"
                    />
                  </div>
                </div>
              </FormSection>

              {/* Currency */}
              <FormSection title="Preferences" icon={DollarSign}>
                <div className="space-y-1.5">
                  <Label htmlFor="default_currency" className="text-xs text-slate-400">Default Currency</Label>
                  <Select
                    value={formData.default_currency}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, default_currency: value }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code} className="text-sm">
                          {currency.code} - {currency.name} ({currency.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </FormSection>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-500 text-white h-9">
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column - Integrations & Account */}
        <div className="space-y-6">
          {/* Integrations */}
          <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-100">Integrations</h2>
                  <p className="text-xs text-slate-500">Connect third-party services</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {integrationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                </div>
              ) : (
                <>
                  {/* Calendly */}
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-200">Calendly</span>
                          {calendlyConnection && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Connected
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">Schedule meetings with clients</p>
                      </div>
                    </div>
                    {calendlyConnection ? (
                      <div className="space-y-2">
                        <div className="p-2 bg-slate-900/50 rounded text-xs">
                          <span className="text-slate-500">Account:</span>
                          <span className="text-slate-300 ml-1">{calendlyConnection.calendly_email}</span>
                        </div>
                        {calendlyEventTypes.length > 0 && (
                          <div className="space-y-1">
                            {calendlyEventTypes.slice(0, 2).map((et) => (
                              <div key={et.uri} className="flex items-center justify-between p-2 bg-slate-900/50 rounded text-xs">
                                <span className="text-slate-300">{et.name}</span>
                                <a
                                  href={et.scheduling_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCalendlyDisconnect}
                          disabled={calendlyDisconnecting}
                          className="w-full h-7 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          {calendlyDisconnecting ? (
                            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1.5" />
                          )}
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleCalendlyConnect}
                        className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-500"
                      >
                        <CalendarIcon className="w-3 h-3 mr-1.5" />
                        Connect Calendly
                      </Button>
                    )}
                  </div>

                  {/* Stripe */}
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-200">Stripe</span>
                          {stripeConnection && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Connected
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">Accept payments on invoices</p>
                      </div>
                    </div>
                    {stripeConnection ? (
                      <div className="space-y-2">
                        <div className="p-2 bg-slate-900/50 rounded text-xs">
                          <span className="text-slate-500">Account:</span>
                          <span className="text-slate-300 ml-1">{stripeConnection.stripe_email}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleStripeDisconnect}
                          disabled={stripeDisconnecting}
                          className="w-full h-7 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          {stripeDisconnecting ? (
                            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1.5" />
                          )}
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleStripeConnect}
                        className="w-full h-8 text-xs bg-purple-600 hover:bg-purple-500"
                      >
                        <CreditCard className="w-3 h-3 mr-1.5" />
                        Connect Stripe
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Account Actions */}
          <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-500/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-100">Account</h2>
                  <p className="text-xs text-slate-500">Session and account actions</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <Button
                onClick={async () => {
                  try {
                    await signOut()
                  } catch (err) {
                    toast({ title: 'Error', description: 'Failed to sign out', variant: 'destructive' })
                  }
                }}
                variant="outline"
                className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800 h-9"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-slate-900/50 border-rose-500/30 overflow-hidden">
            <div className="p-5 border-b border-rose-500/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-rose-500/10 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-rose-400">Danger Zone</h2>
                  <p className="text-xs text-slate-500">Irreversible actions</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-400 mb-3">
                Permanently delete your account and all associated data including quotes, invoices, and clients.
              </p>
              <Button
                onClick={() => setShowDeleteModal(true)}
                variant="destructive"
                className="w-full h-9 bg-rose-600 hover:bg-rose-500"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Dialog open={showDeleteModal} onOpenChange={handleCloseDeleteModal}>
        <DialogContent className="bg-slate-900 border-slate-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-100 text-xl">
              {showReasonStep ? 'We\'re sorry to see you go' : 'Are you sure you want to leave?'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {showReasonStep
                ? 'Please let us know why you\'re leaving so we can improve.'
                : 'All your quotes, invoices, clients, and settings will be permanently deleted.'}
            </DialogDescription>
          </DialogHeader>

          {showReasonStep ? (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-sm text-slate-300">Why are you leaving?</Label>
                <Select value={deleteReason} onValueChange={setDeleteReason}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectValue placeholder="Select a reason..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    {DELETE_REASONS.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {deleteReason === 'custom' && (
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">Tell us more</Label>
                  <Input
                    type="text"
                    className="bg-slate-800 border-slate-700 text-slate-100"
                    placeholder="Please share your reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                  />
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  onClick={handleCloseDeleteModal}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={deleting || !deleteReason || (deleteReason === 'custom' && !customReason.trim())}
                  variant="destructive"
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <DialogFooter className="gap-2 sm:gap-2 pt-4">
              <Button
                onClick={handleCloseDeleteModal}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                No, keep my account
              </Button>
              <Button
                onClick={() => setShowReasonStep(true)}
                variant="destructive"
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Yes, delete my account
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-700 border-t-cyan-500"></div>
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  )
}
