'use client'

import { ArrowLeftRight } from 'lucide-react'

export default function StockMovementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
          <ArrowLeftRight className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl text-slate-100">Stock Movements</h1>
          <p className="text-slate-400 mt-1">Track inventory movements and transfers</p>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
        <p className="text-slate-400">Stock movements tracking coming soon...</p>
      </div>
    </div>
  )
}
