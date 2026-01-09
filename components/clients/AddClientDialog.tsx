'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { validateEmail } from '@/lib/utils/validation'
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

interface AddClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface ClientFormData {
  name: string
  email: string
  phone: string
  company_name: string
  address: string
  city: string
  state: string
  postal_code: string
  country: string
}

export function AddClientDialog({ open, onOpenChange, onSuccess }: AddClientDialogProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!user) {
      setError('You must be logged in')
      setLoading(false)
      return
    }

    if (!formData.name.trim()) {
      setError('Client name is required')
      setLoading(false)
      return
    }

    if (formData.email && !validateEmail(formData.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const { error: insertError } = await supabase.from('clients').insert({
        user_id: user.id,
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        company_name: formData.company_name || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        postal_code: formData.postal_code || null,
        country: formData.country || null,
      })

      if (insertError) throw insertError

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
      })

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Customer</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs">
              Customer Name <span className="text-red-400">*</span>
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              required
              className="bg-slate-800 border-slate-700 h-8 text-sm"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                className="bg-slate-800 border-slate-700 h-8 text-sm"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs">Phone</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                className="bg-slate-800 border-slate-700 h-8 text-sm"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name" className="text-xs">Company Name</Label>
            <Input
              type="text"
              id="company_name"
              name="company_name"
              className="bg-slate-800 border-slate-700 h-8 text-sm"
              value={formData.company_name}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-xs">Address</Label>
            <Input
              type="text"
              id="address"
              name="address"
              className="bg-slate-800 border-slate-700 h-8 text-sm"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-xs">City</Label>
              <Input
                type="text"
                id="city"
                name="city"
                className="bg-slate-800 border-slate-700 h-8 text-sm"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-xs">State/Province</Label>
              <Input
                type="text"
                id="state"
                name="state"
                className="bg-slate-800 border-slate-700 h-8 text-sm"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postal_code" className="text-xs">Postal Code</Label>
              <Input
                type="text"
                id="postal_code"
                name="postal_code"
                className="bg-slate-800 border-slate-700 h-8 text-sm"
                value={formData.postal_code}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-xs">Country</Label>
              <Input
                type="text"
                id="country"
                name="country"
                className="bg-slate-800 border-slate-700 h-8 text-sm"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>

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
              className="bg-violet-500 hover:bg-violet-600 text-white text-sm h-9"
            >
              {loading ? 'Creating...' : 'Create Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
