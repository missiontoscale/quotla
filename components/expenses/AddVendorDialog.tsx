'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User, CreditCard, MapPin } from 'lucide-react'
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
import { FormSection } from '@/components/ui/form-section'
import { FieldGroup } from '@/components/ui/field-group'

interface AddVendorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  vendorId?: string
  mode?: 'create' | 'edit'
}

interface VendorFormData {
  name: string
  contact_person: string
  email: string
  phone: string
  category: string
  address: string
  city: string
  country: string
  status: 'active' | 'inactive'
}

export function AddVendorDialog({
  open,
  onOpenChange,
  onSuccess,
  vendorId,
  mode = 'create'
}: AddVendorDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    category: '',
    address: '',
    city: '',
    country: '',
    status: 'active',
  })

  useEffect(() => {
    if (open && vendorId) {
      loadVendor()
    } else if (open && !vendorId) {
      setFormData({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        category: '',
        address: '',
        city: '',
        country: '',
        status: 'active',
      })
    }
  }, [open, vendorId])

  const loadVendor = async () => {
    if (!vendorId) return

    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', vendorId)
        .single()

      if (fetchError) throw fetchError

      if (data) {
        setFormData({
          name: data.name || '',
          contact_person: data.contact_person || '',
          email: data.email || '',
          phone: data.phone || '',
          category: data.notes?.replace('Category: ', '') || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || '',
          status: data.is_active ? 'active' : 'inactive',
        })
      }
    } catch (err) {
      console.error('Error loading vendor:', err)
      setError('Unable to load vendor. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isEditMode = !!vendorId

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (vendorId) {
        const { error: updateError } = await supabase
          .from('suppliers')
          .update({
            name: formData.name,
            contact_person: formData.contact_person,
            email: formData.email,
            phone: formData.phone,
            address: formData.address || null,
            city: formData.city || null,
            country: formData.country || null,
            is_active: formData.status === 'active',
            notes: formData.category ? `Category: ${formData.category}` : null,
          })
          .eq('id', vendorId)
          .eq('user_id', user.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from('suppliers').insert({
          user_id: user.id,
          name: formData.name,
          contact_person: formData.contact_person,
          email: formData.email,
          phone: formData.phone,
          address: formData.address || null,
          city: formData.city || null,
          country: formData.country || null,
          is_active: formData.status === 'active',
          notes: formData.category ? `Category: ${formData.category}` : null,
        })

        if (insertError) throw insertError
      }

      setFormData({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        category: '',
        address: '',
        city: '',
        country: '',
        status: 'active',
      })

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error(`Error ${vendorId ? 'updating' : 'creating'} vendor:`, err)
      setError(`Unable to ${vendorId ? 'update' : 'create'} vendor. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditMode ? 'Edit Vendor' : 'Add New Vendor'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 rounded-lg p-3">
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}

          <FormSection title="Contact Information" icon={User} description="Primary vendor contact">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs">Vendor Name *</Label>
              <Input
                id="name"
                placeholder="Enter vendor name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
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
                  className="bg-slate-800 border-slate-700 h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-slate-800 border-slate-700 h-8 text-sm"
                />
              </div>
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
                className="bg-slate-800 border-slate-700 h-8 text-sm"
              />
            </div>
          </FormSection>

          <FormSection title="Category & Status" icon={CreditCard} description="Classification">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs">Category (optional)</Label>
                <Input
                  id="category"
                  placeholder="e.g., Electronics, Textiles"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-slate-800 border-slate-700 h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
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
            </div>
          </FormSection>

          <FormSection title="Address" icon={MapPin} description="Location details (optional)" collapsible defaultOpen={false}>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-xs">Street Address (optional)</Label>
              <Textarea
                id="address"
                placeholder="Street address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-slate-800 border-slate-700 min-h-20 text-sm"
                rows={2}
              />
            </div>

            <FieldGroup label="City & Country">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs">City (optional)</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="bg-slate-800 border-slate-700 h-8 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-xs">Country (optional)</Label>
                  <Input
                    id="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="bg-slate-800 border-slate-700 h-8 text-sm"
                  />
                </div>
              </div>
            </FieldGroup>
          </FormSection>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 text-sm h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm h-9"
            >
              {loading
                ? (isEditMode ? 'Updating...' : 'Adding...')
                : (isEditMode ? 'Update Vendor' : 'Add Vendor')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
