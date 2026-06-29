'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/dashboard/DataTable'
import { Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'

interface CustomerRow {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  status: string
  balance: number
  totalEarnings: number
  hasActiveQuotes: boolean
}

interface CustomerListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customers: CustomerRow[]
  currency: string
  onView: (customer: CustomerRow) => void
  onEdit: (customer: CustomerRow) => void
  onDelete: (customer: CustomerRow) => void
  onAddCustomer: () => void
}

export function CustomerListModal({
  open,
  onOpenChange,
  customers,
  currency,
  onView,
  onEdit,
  onDelete,
  onAddCustomer,
}: CustomerListModalProps) {
  const customerColumns = [
    { key: 'name', label: 'Customer Name' },
    { key: 'contact', label: 'Contact Person' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors: Record<string, string> = {
          active: 'bg-quotla-green/20 text-quotla-green',
          inactive: 'bg-primary-400/20 text-primary-400',
        }
        return (
          <Badge className={statusColors[value] || statusColors.active}>
            {value}
          </Badge>
        )
      },
    },
    {
      key: 'balance',
      label: 'Outstanding',
      render: (value: number) => (
        <span className={value > 0 ? 'text-rose-400' : 'text-primary-200'}>
          {formatCurrency(value || 0, currency)}
        </span>
      ),
    },
    {
      key: 'totalEarnings',
      label: 'Total Earnings',
      render: (value: number) => (
        <span className="text-quotla-green">
          {formatCurrency(value || 0, currency)}
        </span>
      ),
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-primary-800 border-primary-600 text-primary-50 max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Customers & Clients
              <Badge className="ml-2 bg-primary-600 text-primary-200">
                {customers.length}
              </Badge>
            </DialogTitle>
            <Button
              onClick={onAddCustomer}
              className="bg-quotla-orange hover:bg-secondary-500 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto mt-4">
          <DataTable
            columns={customerColumns}
            data={customers}
            searchPlaceholder="Search customers..."
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
