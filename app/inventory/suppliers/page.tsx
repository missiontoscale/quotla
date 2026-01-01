'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Supplier } from '@/types/inventory'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function SuppliersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    checkAuthAndLoad()
  }, [])

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    await loadSuppliers()
    setLoading(false)
  }

  const loadSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name')

      if (error) throw error

      setSuppliers(data || [])
    } catch (error) {
      console.error('Error loading suppliers:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return

    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)

      if (error) throw error

      await loadSuppliers()
    } catch (error) {
      console.error('Error deleting supplier:', error)
      alert('Failed to delete supplier')
    }
  }

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-quotla-light relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-center opacity-[0.02] pointer-events-none" style={{backgroundSize: '150%'}}></div>

      <Navbar />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
              <p className="text-gray-600 mt-1">Manage your suppliers and vendor relationships</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/inventory"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Back to Inventory
              </Link>
              <Link
                href="/inventory/suppliers/new"
                className="px-4 py-2 bg-quotla-orange text-white rounded-lg hover:bg-secondary-600 transition-colors shadow-sm"
              >
                + Add Supplier
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <p className="text-sm text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{suppliers.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <p className="text-sm text-gray-600">Active Suppliers</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {suppliers.filter(s => s.is_active).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <p className="text-sm text-gray-600">Inactive Suppliers</p>
              <p className="text-2xl font-bold text-gray-400 mt-1">
                {suppliers.filter(s => !s.is_active).length}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <input
              type="text"
              placeholder="Search suppliers by name, email, or contact person..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quotla-orange focus:border-transparent"
            />
          </div>
        </div>

        {/* Suppliers List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No suppliers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'Try a different search term' : 'Get started by adding your first supplier.'}
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <Link
                    href="/inventory/suppliers/new"
                    className="inline-flex items-center px-4 py-2 bg-quotla-orange text-white rounded-lg hover:bg-secondary-600"
                  >
                    + Add Supplier
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSuppliers.map((supplier) => (
                <div key={supplier.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          supplier.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {supplier.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        {supplier.contact_person && (
                          <div>
                            <span className="text-gray-500">Contact:</span>{' '}
                            <span className="text-gray-900">{supplier.contact_person}</span>
                          </div>
                        )}
                        {supplier.email && (
                          <div>
                            <span className="text-gray-500">Email:</span>{' '}
                            <a href={`mailto:${supplier.email}`} className="text-quotla-orange hover:underline">
                              {supplier.email}
                            </a>
                          </div>
                        )}
                        {supplier.phone && (
                          <div>
                            <span className="text-gray-500">Phone:</span>{' '}
                            <a href={`tel:${supplier.phone}`} className="text-quotla-orange hover:underline">
                              {supplier.phone}
                            </a>
                          </div>
                        )}
                        {supplier.payment_terms && (
                          <div>
                            <span className="text-gray-500">Terms:</span>{' '}
                            <span className="text-gray-900">{supplier.payment_terms}</span>
                          </div>
                        )}
                        {supplier.address && (
                          <div className="md:col-span-2">
                            <span className="text-gray-500">Address:</span>{' '}
                            <span className="text-gray-900">
                              {[supplier.address, supplier.city, supplier.state, supplier.country]
                                .filter(Boolean)
                                .join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {supplier.notes && (
                        <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <strong>Notes:</strong> {supplier.notes}
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex items-center gap-2">
                      <Link
                        href={`/inventory/suppliers/${supplier.id}/edit`}
                        className="px-3 py-1.5 text-sm text-quotla-orange hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
