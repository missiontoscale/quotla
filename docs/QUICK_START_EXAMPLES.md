# Quick Start Examples

Real-world examples showing how to use the Global Modal System in different scenarios.

## Example 1: Simple Page with Create Button

```tsx
'use client'

import { OpenInvoiceButton, OpenCustomerButton } from '@/components/modals'

export default function Dashboard() {
  const handleRefresh = () => {
    // Your refresh logic
    window.location.reload() // or use your state management
  }

  return (
    <div className="p-6">
      <div className="flex gap-4">
        <OpenInvoiceButton onSuccess={handleRefresh} />
        <OpenCustomerButton onSuccess={handleRefresh} />
      </div>
    </div>
  )
}
```

## Example 2: Data Table with View/Edit Actions

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useModal } from '@/components/modals'

export default function InvoicesTable() {
  const [invoices, setInvoices] = useState([])
  const { openInvoiceModal, setOnSuccess } = useModal()

  const loadInvoices = async () => {
    // Fetch your invoices
    const data = await fetch('/api/invoices').then(r => r.json())
    setInvoices(data)
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  const handleView = (invoiceId: string) => {
    openInvoiceModal(invoiceId, 'view')
  }

  const handleEdit = (invoiceId: string) => {
    setOnSuccess(loadInvoices) // Refresh after edit
    openInvoiceModal(invoiceId, 'edit')
  }

  return (
    <table>
      <tbody>
        {invoices.map(invoice => (
          <tr key={invoice.id}>
            <td>{invoice.number}</td>
            <td>{invoice.total}</td>
            <td>
              <button onClick={() => handleView(invoice.id)}>View</button>
              <button onClick={() => handleEdit(invoice.id)}>Edit</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

## Example 3: Dropdown Menu Actions

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useModal } from '@/components/modals'

function InvoiceRowActions({ invoice }: { invoice: Invoice }) {
  const { openInvoiceModal, setOnSuccess } = useModal()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => openInvoiceModal(invoice.id, 'view')}>
          👁️ View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setOnSuccess(() => refreshInvoices())
            openInvoiceModal(invoice.id, 'edit')
          }}
        >
          ✏️ Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(invoice.id)}>
          🗑️ Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## Example 4: Card with Click to Open

```tsx
import { useModal } from '@/components/modals'

function CustomerCard({ customer }: { customer: Customer }) {
  const { openCustomerModal } = useModal()

  return (
    <div
      onClick={() => openCustomerModal(customer.id, 'view')}
      className="cursor-pointer hover:shadow-lg transition-shadow p-4 border rounded"
    >
      <h3>{customer.name}</h3>
      <p>{customer.email}</p>
    </div>
  )
}
```

## Example 5: Mixed Buttons - Pre-built and Custom

```tsx
import { OpenInvoiceButton, OpenCustomerButton } from '@/components/modals'
import { Button } from '@/components/ui/button'

export default function ActionBar() {
  return (
    <div className="flex gap-2">
      {/* Pre-built button components */}
      <OpenInvoiceButton />
      <OpenCustomerButton variant="outline" />

      {/* Custom button with different styling */}
      <OpenInvoiceButton
        variant="ghost"
        size="sm"
        className="text-blue-500"
      >
        Quick Invoice
      </OpenInvoiceButton>

      {/* Button without icon */}
      <OpenCustomerButton showIcon={false}>
        + Customer
      </OpenCustomerButton>
    </div>
  )
}
```

## Example 6: Floating Action Button (FAB)

```tsx
import { OpenInvoiceButton } from '@/components/modals'

export default function Layout({ children }) {
  return (
    <div>
      {children}

      {/* Floating action button in bottom-right */}
      <OpenInvoiceButton
        className="fixed bottom-8 right-8 rounded-full w-14 h-14 shadow-lg"
        size="icon"
        onSuccess={() => {
          console.log('Invoice created from FAB!')
        }}
      >
        <span className="sr-only">Create Invoice</span>
      </OpenInvoiceButton>
    </div>
  )
}
```

## Example 7: Context Menu

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { useModal } from '@/components/modals'

function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const { openInvoiceModal, setOnSuccess } = useModal()

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="p-4 border rounded">
          <h3>{invoice.number}</h3>
          <p>${invoice.total}</p>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => openInvoiceModal(invoice.id, 'view')}>
          View Details
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            setOnSuccess(refreshData)
            openInvoiceModal(invoice.id, 'edit')
          }}
        >
          Edit Invoice
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
```

## Example 8: With Toast Notifications

```tsx
import { OpenInvoiceButton } from '@/components/modals'
import { useToast } from '@/components/ui/use-toast'

export default function InvoicesPage() {
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: 'Success!',
      description: 'Invoice has been created successfully.',
    })
    // Refresh your data here
  }

  return (
    <OpenInvoiceButton onSuccess={handleSuccess}>
      Create Invoice
    </OpenInvoiceButton>
  )
}
```

## Example 9: Conditional Modal Opening

```tsx
import { useModal } from '@/components/modals'

function SmartInvoiceButton({ hasPermission }: { hasPermission: boolean }) {
  const { openInvoiceModal } = useModal()

  const handleClick = () => {
    if (!hasPermission) {
      alert('You do not have permission to create invoices')
      return
    }
    openInvoiceModal()
  }

  return (
    <button onClick={handleClick}>
      Create Invoice
    </button>
  )
}
```

## Example 10: Sidebar Navigation

```tsx
import {
  OpenInvoiceButton,
  OpenCustomerButton,
  OpenSupplierButton,
  OpenProductButton
} from '@/components/modals'

export default function Sidebar() {
  return (
    <aside className="w-64 p-4 space-y-4">
      <h2>Quick Actions</h2>

      <div className="space-y-2">
        <OpenInvoiceButton
          variant="ghost"
          className="w-full justify-start"
        >
          New Invoice
        </OpenInvoiceButton>

        <OpenCustomerButton
          variant="ghost"
          className="w-full justify-start"
        >
          New Customer
        </OpenCustomerButton>

        <OpenSupplierButton
          variant="ghost"
          className="w-full justify-start"
        >
          New Supplier
        </OpenSupplierButton>

        <OpenProductButton
          variant="ghost"
          className="w-full justify-start"
        >
          New Product
        </OpenProductButton>
      </div>
    </aside>
  )
}
```

## Example 11: Empty State

```tsx
import { OpenInvoiceButton } from '@/components/modals'

function EmptyInvoiceState({ onSuccess }: { onSuccess: () => void }) {
  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-semibold mb-2">No invoices yet</h3>
      <p className="text-gray-600 mb-6">
        Create your first invoice to get started
      </p>
      <OpenInvoiceButton
        onSuccess={onSuccess}
        size="lg"
      >
        Create Your First Invoice
      </OpenInvoiceButton>
    </div>
  )
}
```

## Example 12: Multiple Modals Chained

```tsx
import { useModal } from '@/components/modals'

function CreateInvoiceWithNewCustomer() {
  const { openCustomerModal, openInvoiceModal, setOnSuccess } = useModal()

  const handleCreateCustomerFirst = () => {
    // After customer is created, open invoice modal
    setOnSuccess(() => {
      openInvoiceModal()
    })
    openCustomerModal()
  }

  return (
    <button onClick={handleCreateCustomerFirst}>
      Create Customer + Invoice
    </button>
  )
}
```

## Tips

1. **Always set `onSuccess`** before opening modals if you need to refresh data
2. **Use pre-built buttons** for simple cases
3. **Use the hook** when you need more control
4. **Chain modals** by setting `onSuccess` to open another modal
5. **Combine with other UI patterns** (dropdowns, context menus, etc.)
