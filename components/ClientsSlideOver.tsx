'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Customer } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import SlideOver from './SlideOver'

interface CustomerWithDisplayName extends Customer {
  displayName: string
}

interface ClientsSlideOverProps {
  isOpen: boolean
  onClose: () => void
}

export default function ClientsSlideOver({ isOpen, onClose }: ClientsSlideOverProps) {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<CustomerWithDisplayName[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadCustomers()
    }
  }, [user, isOpen])

  const loadCustomers = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('full_name', { ascending: true })

    if (!error && data) {
      const mappedCustomers: CustomerWithDisplayName[] = data.map(customer => ({
        ...customer,
        displayName: customer.company_name || customer.full_name,
      }))
      setCustomers(mappedCustomers)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    const { error } = await supabase.from('customers').delete().eq('id', id)

    if (!error) {
      setCustomers(customers.filter((c) => c.id !== id))
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Clients" size="xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Link
            href="/business/customers"
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
        ) : filteredCustomers.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-primary-400 mb-4">No customers found</p>
            <Link
              href="/business/customers"
              className="btn btn-primary inline-block"
              onClick={onClose}
            >
              Add Your First Customer
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
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-primary-700">
                      <td className="py-3 px-4 font-medium">{customer.displayName}</td>
                      <td className="py-3 px-4 text-sm text-primary-300">{customer.email || '-'}</td>
                      <td className="py-3 px-4 text-sm text-primary-300">{customer.phone || '-'}</td>
                      <td className="py-3 px-4 text-sm text-primary-300">{customer.company_name || '-'}</td>
                      <td className="py-3 px-4 text-sm text-primary-300">
                        {customer.city && customer.country ? `${customer.city}, ${customer.country}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href="/business/customers"
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium mr-4"
                          onClick={onClose}
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(customer.id)}
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
