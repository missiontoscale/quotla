'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowRight, Building2, Globe, Sparkles, CheckCircle2 } from 'lucide-react'

const STEPS = [
  { id: 1, name: 'Welcome', description: 'Get started with Quotla' },
  { id: 2, name: 'Business Info', description: 'Tell us about your business' },
  { id: 3, name: 'Preferences', description: 'Set your preferences' },
  { id: 4, name: 'Complete', description: 'You\'re all set!' },
]

const CURRENCIES = ['USD', 'NGN', 'EUR', 'GBP']

export default function OnboardingPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    company_name: '',
    business_number: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone: '',
    website: '',
    default_currency: 'USD',
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    // If user already has onboarding completed, redirect to dashboard
    const checkOnboarding = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('company_name, onboarding_completed')
        .eq('id', user.id)
        .single()

      if (data?.onboarding_completed) {
        router.push('/business/dashboard')
      } else if (data?.company_name) {
        // Pre-fill form if profile exists
        setFormData(prev => ({
          ...prev,
          company_name: data.company_name || '',
        }))
      }
    }

    checkOnboarding()
  }, [user, router])

  const handleNext = async () => {
    setError('')

    if (currentStep === 2) {
      // Validate business info
      if (!formData.company_name.trim()) {
        setError('Company name is required')
        return
      }
    }

    if (currentStep === 3) {
      // Save profile and complete onboarding
      setLoading(true)
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            company_name: formData.company_name,
            business_number: formData.business_number || null,
            address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            postal_code: formData.postal_code || null,
            country: formData.country || null,
            phone: formData.phone || null,
            website: formData.website || null,
            default_currency: formData.default_currency,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user!.id)

        if (updateError) throw updateError

        setCurrentStep(4)
      } catch (err) {
        console.error('Error saving profile:', err)
        setError('Failed to save your information. Please try again.')
      } finally {
        setLoading(false)
      }
      return
    }

    if (currentStep === 4) {
      router.push('/business/dashboard')
      return
    }

    setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      currentStep >= step.id
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-2 text-xs text-center">
                    <div className={`font-semibold ${currentStep >= step.id ? 'text-slate-200' : 'text-slate-500'}`}>
                      {step.name}
                    </div>
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      currentStep > step.id ? 'bg-orange-500' : 'bg-slate-800'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-50 mb-4">
                  Welcome to Quotla! 🎉
                </h1>
                <p className="text-lg text-slate-400 max-w-xl mx-auto">
                  Let's get you set up in just a few minutes. We'll help you configure your business profile and preferences.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200 mb-2">Business Info</h3>
                  <p className="text-sm text-slate-500">Set up your company details</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200 mb-2">Preferences</h3>
                  <p className="text-sm text-slate-500">Choose your currency</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200 mb-2">Start Creating</h3>
                  <p className="text-sm text-slate-500">Generate quotes & invoices</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Business Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-50 mb-2">Tell us about your business</h2>
                <p className="text-slate-400">This information will appear on your invoices and quotes</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="company_name" className="text-slate-200">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="Acme Inc."
                    className="bg-slate-800 border-slate-700 text-slate-100"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business_number" className="text-slate-200">Business Number</Label>
                    <Input
                      id="business_number"
                      value={formData.business_number}
                      onChange={(e) => setFormData({ ...formData, business_number: e.target.value })}
                      placeholder="Optional"
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-slate-200">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-slate-200">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main Street"
                    className="bg-slate-800 border-slate-700 text-slate-100"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-slate-200">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="New York"
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-slate-200">State/Province</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="NY"
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="postal_code" className="text-slate-200">Postal Code</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      placeholder="10001"
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country" className="text-slate-200">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="United States"
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website" className="text-slate-200">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-50 mb-2">Set your preferences</h2>
                <p className="text-slate-400">Customize how you work with Quotla</p>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Label htmlFor="default_currency" className="text-slate-200 text-lg mb-4 block">
                    Default Currency
                  </Label>
                  <p className="text-sm text-slate-400 mb-4">
                    This will be the default currency for your quotes and invoices. You can always change it later.
                  </p>
                  <Select
                    value={formData.default_currency}
                    onValueChange={(value) => setFormData({ ...formData, default_currency: value })}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-6 bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-lg border border-orange-500/30">
                  <h3 className="text-lg font-semibold text-slate-50 mb-2">🎉 You're almost ready!</h3>
                  <p className="text-sm text-slate-300">
                    Click "Complete Setup" to finish your onboarding and start creating professional quotes and invoices with AI.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-50 mb-4">
                  You're all set! 🚀
                </h1>
                <p className="text-lg text-slate-400 max-w-xl mx-auto">
                  Your account is ready. Let's create your first quote or invoice with AI.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-xl mx-auto">
                <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700 text-left">
                  <h3 className="font-semibold text-slate-200 mb-2">✨ Try AI Create</h3>
                  <p className="text-sm text-slate-400">
                    Use natural language to generate quotes and invoices instantly
                  </p>
                </div>
                <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700 text-left">
                  <h3 className="font-semibold text-slate-200 mb-2">📊 Manage Clients</h3>
                  <p className="text-sm text-slate-400">
                    Add clients, track invoices, and manage your business
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-700">
            <Button
              onClick={handleBack}
              variant="ghost"
              disabled={currentStep === 1 || currentStep === 4 || loading}
              className="text-slate-400 hover:text-slate-200"
            >
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={loading}
              className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white px-6"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </span>
              ) : currentStep === 4 ? (
                <span className="flex items-center gap-2">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </span>
              ) : currentStep === 3 ? (
                'Complete Setup'
              ) : (
                <span className="flex items-center gap-2">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Skip Link */}
        {currentStep < 4 && (
          <div className="text-center mt-4">
            <button
              onClick={() => router.push('/business/dashboard')}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
