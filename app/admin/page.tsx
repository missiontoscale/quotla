'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function AdminPage() {
  const { profile } = useAuth()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary-50">Admin Dashboard</h1>
      <p className="text-primary-400">Welcome{profile?.email ? `, ${profile.email}` : ''}.</p>
    </div>
  )
}
