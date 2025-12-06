'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Client } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ClientsPage() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    const { error } = await supabase.from('clients').delete().eq('id', id)

    if (!error) {
      setClients(clients.filter((c) => c.id !== id))
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <Link href="/clients/new" className="btn btn-primary">
          Add Client
        </Link>
      </div>

      <div className="card">
        <input
          type="text"
          placeholder="Search clients..."
          className="input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredClients.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No clients found</p>
          <Link href="/clients/new" className="btn btn-primary inline-block">
            Add Your First Client
          </Link>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">Company</th>
                  <th className="text-left py-3 px-4">Location</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{client.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{client.email || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{client.phone || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{client.company_name || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {client.city && client.country ? `${client.city}, ${client.country}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/clients/${client.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
