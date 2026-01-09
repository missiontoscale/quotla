'use client'

import { CreditCard } from 'lucide-react'

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl text-slate-100">Billing</h1>
          <p className="text-slate-400 mt-1">Manage subscription and billing</p>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
        <p className="text-slate-400">Billing page coming soon...</p>
      </div>
    </div>
  )
}
