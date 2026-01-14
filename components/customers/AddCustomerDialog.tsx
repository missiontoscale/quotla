'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CURRENCIES } from '@/lib/utils/currency'

interface AddCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  customerId?: string // If provided, this is view/edit mode
  mode?: 'create' | 'view' | 'edit' // Operation mode
}

interface CustomerFormData {
  name: string
  contact_person: string
  email: string
  phone: string
  company_name: string
  address: string
  city: string
  country: string
  status: 'active' | 'inactive'
  preferred_currency: string
}

export function AddCustomerDialog({
  open,
  onOpenChange,
  onSuccess,
  customerId,
  mode = 'create'
}: AddCustomerDialogProps) {
  const [loading, setLoading] = useState(false)
  const [currentMode, setCurrentMode] = useState(mode)
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    company_name: '',
    address: '',
    city: '',
    country: '',
    status: 'active',
    preferred_currency: 'NGN',
  })

  useEffect(() => {
    if (open && customerId) {
      loadCustomer()
    } else if (open && !customerId) {
      // Reset form for create mode
      setFormData({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        company_name: '',
        address: '',
        city: '',
        country: '',
        status: 'active',
        preferred_currency: 'NGN',
      })
      setCurrentMode('create')
    }
  }, [open, customerId])

  const loadCustomer = async () => {
    if (!customerId) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          name: data.full_name || '',
          contact_person: data.contact_person || '',
          email: data.email || '',
          phone: data.phone || '',
          company_name: data.company_name || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || '',
          status: data.is_active ? 'active' : 'inactive',
          preferred_currency: data.preferred_currency || 'NGN',
        })
      }
    } catch (error) {
      console.error('Error loading customer:', error)
      alert('Failed to load customer')
    } finally {
      setLoading(false)
    }
  }

  const isViewMode = currentMode === 'view'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (customerId) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update({
            full_name: formData.name,
            contact_person: formData.contact_person,
            email: formData.email,
            phone: formData.phone,
            company_name: formData.company_name || null,
            address: formData.address || null,
            city: formData.city || null,
            country: formData.country || null,
            is_active: formData.status === 'active',
            preferred_currency: formData.preferred_currency,
          })
          .eq('id', customerId)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // Create new customer
        const { error } = await supabase.from('customers').insert({
          user_id: user.id,
          full_name: formData.name,
          contact_person: formData.contact_person,
          email: formData.email,
          phone: formData.phone,
          company_name: formData.company_name || null,
          address: formData.address || null,
          city: formData.city || null,
          country: formData.country || null,
          is_active: formData.status === 'active',
          outstanding_balance: 0,
          preferred_currency: formData.preferred_currency,
        })

        if (error) throw error
      }

      setFormData({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        company_name: '',
        address: '',
        city: '',
        country: '',
        status: 'active',
        preferred_currency: 'NGN',
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error(`Error ${customerId ? 'updating' : 'creating'} customer:`, error)
      alert(`Failed to ${customerId ? 'update' : 'create'} customer`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">
              {currentMode === 'view' ? 'View Customer' : currentMode === 'edit' ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
            {customerId && currentMode === 'view' && (
              <Button
                onClick={() => setCurrentMode('edit')}
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs">Customer Name *</Label>
            <Input
              id="name"
              placeholder="Enter customer name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isViewMode}
              className="bg-slate-800 border-slate-700 h-8 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-person" className="text-xs">Contact Person *</Label>
              <Input
                id="contact-person"
                placeholder="Contact name"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                required
                disabled={isViewMode}
                className="bg-slate-800 border-slate-700 h-8 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-name" className="text-xs">Company Name</Label>
              <Input
                id="company-name"
                placeholder="Company name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                disabled={isViewMode}
                className="bg-slate-800 border-slate-700 h-8 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isViewMode}
                className="bg-slate-800 border-slate-700 h-8 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1-555-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                disabled={isViewMode}
                className="bg-slate-800 border-slate-700 h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-xs">Address</Label>
            <Textarea
              id="address"
              placeholder="Street address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={isViewMode}
              className="bg-slate-800 border-slate-700 min-h-20 text-sm"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-xs">City</Label>
              <Input
                id="city"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={isViewMode}
                className="bg-slate-800 border-slate-700 h-8 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-xs">Country</Label>
              <Input
                id="country"
                placeholder="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                disabled={isViewMode}
                className="bg-slate-800 border-slate-700 h-8 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-xs">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
                disabled={isViewMode}
              >
                <SelectTrigger id="status" className="bg-slate-800 border-slate-700 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_currency" className="text-xs">Preferred Currency</Label>
              <Select
                value={formData.preferred_currency}
                onValueChange={(value) => setFormData({ ...formData, preferred_currency: value })}
                disabled={isViewMode}
              >
                <SelectTrigger id="preferred_currency" className="bg-slate-800 border-slate-700 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 max-h-60">
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 text-sm h-9"
            >
              {isViewMode ? 'Close' : 'Cancel'}
            </Button>
            {!isViewMode && (
              <Button
                type="submit"
                disabled={loading}
                className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm h-9"
              >
                {loading
                  ? (customerId ? 'Updating...' : 'Adding...')
                  : (customerId ? 'Update Customer' : 'Add Customer')
                }
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
