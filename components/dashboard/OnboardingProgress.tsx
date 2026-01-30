'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import {
  Building2,
  Users,
  Package,
  FileText,
  Check,
  ChevronRight,
  X
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  link: string
  icon: React.ElementType
}

export function OnboardingProgress() {
  const { user, profile } = useAuth()
  const [steps, setSteps] = useState<OnboardingStep[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (user) checkProgress()
  }, [user, profile])

  const checkProgress = async () => {
    if (!user) return

    try {
      // Check profile completion
      const hasCompanyName = !!profile?.company_name
      const hasAddress = !!profile?.address

      // Check customers
      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Check inventory
      const { count: inventoryCount } = await supabase
        .from('inventory_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Check invoices
      const { count: invoiceCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const newSteps: OnboardingStep[] = [
        {
          id: 'profile',
          title: 'Set up your business',
          description: 'Add your company name and address',
          completed: hasCompanyName && hasAddress,
          link: '/business/settings',
          icon: Building2
        },
        {
          id: 'customer',
          title: 'Add your first customer',
          description: 'Start building your client list',
          completed: (customerCount || 0) > 0,
          link: '/business/sales',
          icon: Users
        },
        {
          id: 'product',
          title: 'Add products or services',
          description: 'Set up your inventory',
          completed: (inventoryCount || 0) > 0,
          link: '/business/products',
          icon: Package
        },
        {
          id: 'invoice',
          title: 'Create your first invoice',
          description: 'Start getting paid',
          completed: (invoiceCount || 0) > 0,
          link: '/business/sales',
          icon: FileText
        }
      ]

      setSteps(newSteps)
    } catch (error) {
      console.error('Error checking onboarding progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const completedCount = steps.filter(s => s.completed).length
  const allCompleted = completedCount === steps.length

  // Don't show if all completed or dismissed
  if (dismissed || allCompleted) return null

  if (loading) {
    return (
      <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-700/50 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const progress = (completedCount / steps.length) * 100

  return (
    <div className="p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Get started with Quotla</h3>
          <p className="text-xs text-slate-500 mt-0.5">{completedCount} of {steps.length} steps completed</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-700 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <Link
              key={step.id}
              href={step.link}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                step.completed
                  ? 'bg-emerald-500/5 border border-emerald-500/10'
                  : 'bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                step.completed
                  ? 'bg-emerald-500/20'
                  : 'bg-slate-700/50'
              }`}>
                {step.completed ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Icon className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${step.completed ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-slate-500 truncate">{step.description}</p>
              </div>
              {!step.completed && (
                <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
