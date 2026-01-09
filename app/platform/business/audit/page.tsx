'use client'

import { Shield } from 'lucide-react'

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl text-slate-100">Audit Logs</h1>
          <p className="text-slate-400 mt-1">Review system activity and changes</p>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
        <p className="text-slate-400">Audit logs coming soon...</p>
      </div>
    </div>
  )
}
