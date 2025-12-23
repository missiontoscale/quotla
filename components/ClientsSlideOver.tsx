'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Client } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import SlideOver from './SlideOver'

interface ClientsSlideOverProps {
  isOpen: boolean
  onClose: () => void
}

export default function ClientsSlideOver({ isOpen, onClose }: ClientsSlideOverProps) {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadClients()
    }
  }, [user, isOpen])

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

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Clients" size="xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Link
            href="/clients/new"
            className="btn btn-primary"
            onClick={onClose}
          >
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-primary-400 mb-4">No clients found</p>
            <Link
              href="/clients/new"
              className="btn btn-primary inline-block"
              onClick={onClose}
            >
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
                    <tr key={client.id} className="border-b hover:bg-primary-700">
                      <td className="py-3 px-4 font-medium">{client.name}</td>
                      <td className="py-3 px-4 text-sm text-primary-300">{client.email || '-'}</td>
                      <td className="py-3 px-4 text-sm text-primary-300">{client.phone || '-'}</td>
                      <td className="py-3 px-4 text-sm text-primary-300">{client.company_name || '-'}</td>
                      <td className="py-3 px-4 text-sm text-primary-300">
                        {client.city && client.country ? `${client.city}, ${client.country}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/clients/${client.id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium mr-4"
                          onClick={onClose}
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
    </SlideOver>
  )
}
