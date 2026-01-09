'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Mail, Phone, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/DataTable'
import { Badge } from '@/components/ui/badge'

export default function SuppliersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadSuppliers()
  }, [user])

  const loadSuppliers = async () => {
    if (!user) return
    const { data } = await supabase.from('suppliers').select('*').eq('user_id', user.id)
    if (data) setSuppliers(data)
    setLoading(false)
  }

  const columns = [
    { key: 'name', label: 'Supplier Name' },
    {
      key: 'email',
      label: 'Email',
      render: (v: string) => v ? (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-slate-500" />
          <span>{v}</span>
        </div>
      ) : <span className="text-slate-600">-</span>
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (v: string) => v ? (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-slate-500" />
          <span>{v}</span>
        </div>
      ) : <span className="text-slate-600">-</span>
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (v: boolean) => (
        <Badge className={v ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}>
          {v ? 'active' : 'inactive'}
        </Badge>
      )
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-100">Suppliers</h1>
          <p className="text-slate-400 mt-1">Manage supplier relationships and contacts</p>
        </div>
        <Button className="bg-violet-500 hover:bg-violet-600 text-white" onClick={() => router.push('/platform/business/suppliers')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={suppliers}
        onView={(row) => router.push(`/platform/business/suppliers/${row.id}`)}
        onEdit={(row) => router.push(`/platform/business/suppliers/${row.id}/edit`)}
        onDelete={async (row) => {
          if (confirm('Delete this supplier?')) {
            await supabase.from('suppliers').delete().eq('id', row.id)
            loadSuppliers()
          }
        }}
      />
    </div>
  )
}
