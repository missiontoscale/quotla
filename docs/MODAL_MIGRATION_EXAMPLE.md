# Modal System Migration Example

This document shows how to refactor an existing page to use the new Global Modal System.

## Before: Traditional Approach

```tsx
'use client'

import { useState, useEffect } from 'react'
import { AddInvoiceDialog } from '@/components/invoices/AddInvoiceDialog'
import { AddCustomerDialog } from '@/components/customers/AddCustomerDialog'
import { Button } from '@/components/ui/button'

export default function InvoicesPage() {
  // ❌ Need to manage state for each modal
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editInvoiceId, setEditInvoiceId] = useState<string | undefined>(undefined)
  const [dialogMode, setDialogMode] = useState<'create' | 'view' | 'edit'>('create')

  // ❌ Need to manage customer modal state too
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)

  const [invoices, setInvoices] = useState([])

  const loadInvoices = async () => {
    // Fetch invoices...
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  // ❌ Multiple handlers for different modal actions
  const handleCreate = () => {
    setEditInvoiceId(undefined)
    setDialogMode('create')
    setAddDialogOpen(true)
  }

  const handleView = (invoiceId: string) => {
    setEditInvoiceId(invoiceId)
    setDialogMode('view')
    setAddDialogOpen(true)
  }

  const handleEdit = (invoiceId: string) => {
    setEditInvoiceId(invoiceId)
    setDialogMode('edit')
    setAddDialogOpen(true)
  }

  return (
    <div>
      <div className="flex gap-2">
        {/* ❌ Manual button with onClick handler */}
        <Button onClick={handleCreate}>
          Create Invoice
        </Button>
        <Button onClick={() => setCustomerDialogOpen(true)}>
          Add Customer
        </Button>
      </div>

      {/* Invoice list */}
      {invoices.map(invoice => (
        <div key={invoice.id}>
          <h3>{invoice.number}</h3>
          <Button onClick={() => handleView(invoice.id)}>View</Button>
          <Button onClick={() => handleEdit(invoice.id)}>Edit</Button>
        </div>
      ))}

      {/* ❌ Need to render modals in every component that uses them */}
      <AddInvoiceDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={loadInvoices}
        invoiceId={editInvoiceId}
        mode={dialogMode}
      />

      <AddCustomerDialog
        open={customerDialogOpen}
        onOpenChange={setCustomerDialogOpen}
        onSuccess={loadInvoices}
      />
    </div>
  )
}
```

## After: Global Modal System

```tsx
'use client'

import { useState, useEffect } from 'react'
import {
  OpenInvoiceButton,
  OpenCustomerButton,
  useModal
} from '@/components/modals'
import { Button } from '@/components/ui/button'

export default function InvoicesPage() {
  // ✅ No modal state needed!

  const [invoices, setInvoices] = useState([])
  const { openInvoiceModal, setOnSuccess } = useModal()

  const loadInvoices = async () => {
    // Fetch invoices...
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  return (
    <div>
      <div className="flex gap-2">
        {/* ✅ Simple, declarative buttons */}
        <OpenInvoiceButton onSuccess={loadInvoices}>
          Create Invoice
        </OpenInvoiceButton>
        <OpenCustomerButton onSuccess={loadInvoices}>
          Add Customer
        </OpenCustomerButton>
      </div>

      {/* Invoice list */}
      {invoices.map(invoice => (
        <div key={invoice.id}>
          <h3>{invoice.number}</h3>
          {/* ✅ Easy view/edit buttons */}
          <OpenInvoiceButton
            itemId={invoice.id}
            mode="view"
            variant="ghost"
            showIcon={false}
          >
            View
          </OpenInvoiceButton>
          <OpenInvoiceButton
            itemId={invoice.id}
            mode="edit"
            variant="outline"
            showIcon={false}
            onSuccess={loadInvoices}
          >
            Edit
          </OpenInvoiceButton>
        </div>
      ))}

      {/* ✅ No need to render modals here - they're global! */}
    </div>
  )
}
```

## Key Improvements

### 1. Less State Management
**Before:** 3+ state variables per modal
```tsx
const [addDialogOpen, setAddDialogOpen] = useState(false)
const [editInvoiceId, setEditInvoiceId] = useState<string | undefined>(undefined)
const [dialogMode, setDialogMode] = useState<'create' | 'view' | 'edit'>('create')
```

**After:** Zero state variables!
```tsx
// Nothing needed - handled by the context
```

### 2. Simpler Handlers
**Before:** Multiple handler functions
```tsx
const handleCreate = () => {
  setEditInvoiceId(undefined)
  setDialogMode('create')
  setAddDialogOpen(true)
}

const handleView = (invoiceId: string) => {
  setEditInvoiceId(invoiceId)
  setDialogMode('view')
  setAddDialogOpen(true)
}

const handleEdit = (invoiceId: string) => {
  setEditInvoiceId(invoiceId)
  setDialogMode('edit')
  setAddDialogOpen(true)
}
```

**After:** Just use the button component
```tsx
<OpenInvoiceButton onSuccess={loadInvoices} />
<OpenInvoiceButton itemId={id} mode="view" />
<OpenInvoiceButton itemId={id} mode="edit" onSuccess={loadInvoices} />
```

### 3. No Modal Rendering
**Before:** Must render every modal you use
```tsx
<AddInvoiceDialog
  open={addDialogOpen}
  onOpenChange={setAddDialogOpen}
  onSuccess={loadInvoices}
  invoiceId={editInvoiceId}
  mode={dialogMode}
/>
<AddCustomerDialog
  open={customerDialogOpen}
  onOpenChange={setCustomerDialogOpen}
  onSuccess={loadInvoices}
/>
```

**After:** Nothing needed - modals are global!
```tsx
// Modals are rendered once in the root layout
// Just use the buttons or hook to open them
```

## Real-World Example: Data Table Actions

### Before

```tsx
function DataTableActions({ invoice }: { invoice: Invoice }) {
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuItem onClick={() => setViewOpen(true)}>
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setEditOpen(true)}>
          Edit
        </DropdownMenuItem>
      </DropdownMenu>

      <AddInvoiceDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        invoiceId={invoice.id}
        mode="view"
        onSuccess={() => {}}
      />
      <AddInvoiceDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        invoiceId={invoice.id}
        mode="edit"
        onSuccess={refreshData}
      />
    </>
  )
}
```

### After

```tsx
function DataTableActions({ invoice }: { invoice: Invoice }) {
  const { openInvoiceModal, setOnSuccess } = useModal()

  return (
    <DropdownMenu>
      <DropdownMenuItem
        onClick={() => openInvoiceModal(invoice.id, 'view')}
      >
        View
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => {
          setOnSuccess(refreshData)
          openInvoiceModal(invoice.id, 'edit')
        }}
      >
        Edit
      </DropdownMenuItem>
    </DropdownMenu>
  )
}
```

## Custom Integration Example

Sometimes you need more control. Here's how to use the hook directly:

```tsx
function QuickInvoiceCreate({ customerId }: { customerId: string }) {
  const { openInvoiceModal, setOnSuccess } = useModal()
  const router = useRouter()

  const handleQuickCreate = () => {
    // Set up success callback
    setOnSuccess(() => {
      // Show success message
      toast.success('Invoice created!')

      // Refresh data
      mutate('/api/invoices')

      // Navigate somewhere
      router.push('/invoices')
    })

    // Open modal with pre-filled customer
    // You might need to modify the modal to accept initial data
    openInvoiceModal()
  }

  return (
    <Button onClick={handleQuickCreate}>
      Quick Invoice for This Customer
    </Button>
  )
}
```

## Migration Checklist

When refactoring a component:

- [ ] Remove modal state variables (`useState` for open, id, mode)
- [ ] Remove modal open/close handlers
- [ ] Replace manual buttons with `Open*Button` components
- [ ] Remove modal component renders
- [ ] Import buttons/hook from `@/components/modals`
- [ ] Pass `onSuccess` callback for data refresh
- [ ] Test all modal trigger points
- [ ] Remove unused imports

## Benefits Summary

✅ **~80% less code** for modal management
✅ **Zero prop drilling** across components
✅ **Consistent behavior** everywhere
✅ **Easier testing** - less state to mock
✅ **Better performance** - modals rendered once globally
✅ **Simpler components** - focus on business logic, not modal state
