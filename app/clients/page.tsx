'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Client } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import Navbar from '@/components/Navbar'

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
    <div className="min-h-screen bg-[#0e1616] relative">
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]"></div>

      <Navbar />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-12">
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-[#ce6203]"></div>
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9ca3af] mb-3">
                Client Management
              </div>
              <h1 className="text-5xl font-bold text-[#fffad6] mb-2 tracking-tight">Clients</h1>
              <p className="text-[#9ca3af] mt-2">Manage your client database and relationships</p>
            </div>
            <Link
              href="/clients/new"
              className="group px-8 py-4 bg-[#ce6203] text-white font-semibold rounded-lg border-2 border-white/10 shadow-[0_4px_12px_rgba(206,98,3,0.4)] hover:shadow-[0_6px_16px_rgba(206,98,3,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
            >
              <span className="flex items-center gap-2">
                Add Client
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
          </div>

          {/* Search */}
          <div className="bg-[#1a1f1f] rounded-xl border border-[#2a2f2f] p-6 shadow-[0_4px_8px_rgba(0,0,0,0.3)] mb-8">
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full bg-[#1a1f1f]/60 text-[#fffad6] border-0 border-b-2 border-[#374151] px-1 py-3.5 focus:outline-none focus:border-b-3 focus:border-[#ce6203] transition-all duration-150 placeholder:text-[#6b7280]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-[#1a1f1f] rounded-xl border border-[#2a2f2f] overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.4)]">
          {filteredClients.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-[#ce6203]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#ce6203]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#fffad6] mb-2">No clients found</h3>
              <p className="text-sm text-[#9ca3af] mb-8">Add your first client to get started</p>
              <Link
                href="/clients/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#ce6203] text-white font-semibold rounded-lg border-2 border-white/10 shadow-[0_4px_12px_rgba(206,98,3,0.4)] hover:shadow-[0_6px_16px_rgba(206,98,3,0.5)] hover:-translate-y-0.5 transition-all duration-150"
              >
                Add Client →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#2a2f2f]">
                <thead className="bg-[#445642]/10">
                  <tr className="border-b-2 border-[#445642]">
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Name</th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Email</th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Phone</th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Company</th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Location</th>
                    <th className="px-5 py-4 text-right text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#1a1f1f] divide-y divide-[#fffad6]/4">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="group relative border-b border-[#fffad6]/4 hover:bg-[#ce6203]/6 transition-colors cursor-pointer">
                      <td className="absolute left-0 w-0 h-full bg-[#ce6203] group-hover:w-0.5 transition-all"></td>
                      <td className="px-5 py-3.5 font-semibold text-[#fffad6]">{client.name}</td>
                      <td className="px-5 py-3.5 text-sm text-[#9ca3af]">{client.email || '-'}</td>
                      <td className="px-5 py-3.5 text-sm text-[#9ca3af]">{client.phone || '-'}</td>
                      <td className="px-5 py-3.5 text-sm text-[#9ca3af]">{client.company_name || '-'}</td>
                      <td className="px-5 py-3.5 text-sm text-[#9ca3af]">
                        {client.city && client.country ? `${client.city}, ${client.country}` : '-'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/clients/${client.id}`}
                          className="text-[#ce6203] hover:text-[#f97316] font-medium text-sm mr-4 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="text-[#dc2626] hover:text-[#ef4444] font-medium text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
