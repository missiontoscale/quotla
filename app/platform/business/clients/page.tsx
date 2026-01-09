'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Client } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/DataTable'
import { Badge } from '@/components/ui/badge'

export default function ClientsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClients()
  }, [user])

  const loadClients = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (!error && data) {
      setClients(data)
    }
    setLoading(false)
  }

  const handleDelete = async (client: any) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    const { error } = await supabase.from('clients').delete().eq('id', client.id)

    if (!error) {
      setClients(clients.filter((c) => c.id !== client.id))
    }
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Customer Name' },
    {
      key: 'email',
      label: 'Email',
      render: (value: string) => value ? (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-slate-500" />
          <span>{value}</span>
        </div>
      ) : <span className="text-slate-600">-</span>,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value: string) => value ? (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-slate-500" />
          <span>{value}</span>
        </div>
      ) : <span className="text-slate-600">-</span>,
    },
    {
      key: 'company_name',
      label: 'Company',
      render: (value: string) => value || <span className="text-slate-600">-</span>,
    },
    {
      key: 'created_at',
      label: 'Status',
      render: () => (
        <Badge className="bg-emerald-500/20 text-emerald-400">
          active
        </Badge>
      ),
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
          <h1 className="text-3xl text-slate-100">Customers</h1>
          <p className="text-slate-400 mt-1">Manage your customer relationships and accounts</p>
        </div>
        <Button
          className="bg-violet-500 hover:bg-violet-600 text-white"
          onClick={() => router.push('/business/customers')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={clients}
        onView={(row) => router.push(`/customers/${row.id}`)}
        onEdit={(row) => router.push(`/customers/${row.id}`)}
        onDelete={handleDelete}
      />
    </div>
  )
}
