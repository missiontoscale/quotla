# Global Modal System Documentation

## Overview

The Global Modal System provides a centralized way to manage and trigger modals throughout your application. Instead of managing modal state in each component, you can now trigger any modal from anywhere using simple button components or the `useModal()` hook.

## Available Modals

- **Invoice Modal** - Create, view, or edit invoices
- **Customer Modal** - Create, view, or edit customers
- **Supplier Modal** - Create, view, or edit suppliers
- **Product Modal** - Create, view, or edit products

## Quick Start

### 1. Using Pre-built Button Components (Easiest)

```tsx
import {
  OpenInvoiceButton,
  OpenCustomerButton,
  OpenSupplierButton,
  OpenProductButton
} from '@/components/modals'

function MyComponent() {
  return (
    <div>
      {/* Create new items */}
      <OpenInvoiceButton />
      <OpenCustomerButton />
      <OpenSupplierButton />
      <OpenProductButton />

      {/* Custom text */}
      <OpenInvoiceButton>Create Invoice</OpenInvoiceButton>

      {/* View existing item */}
      <OpenInvoiceButton
        itemId="invoice-123"
        mode="view"
      >
        View Invoice
      </OpenInvoiceButton>

      {/* Edit existing item */}
      <OpenCustomerButton
        itemId="customer-456"
        mode="edit"
      >
        Edit Customer
      </OpenCustomerButton>

      {/* Custom styling */}
      <OpenSupplierButton
        variant="outline"
        size="sm"
        className="bg-blue-500"
      >
        Add Supplier
      </OpenSupplierButton>

      {/* Without icon */}
      <OpenProductButton showIcon={false}>
        New Product
      </OpenProductButton>

      {/* With success callback */}
      <OpenInvoiceButton
        onSuccess={() => {
          console.log('Invoice created!')
          // Refresh data, show toast, etc.
        }}
      >
        Create Invoice
      </OpenInvoiceButton>
    </div>
  )
}
```

### 2. Using the Hook (For Custom Implementations)

```tsx
import { useModal } from '@/components/modals'

function MyComponent() {
  const {
    openInvoiceModal,
    openCustomerModal,
    openSupplierModal,
    openProductModal,
    setOnSuccess
  } = useModal()

  const handleCreateInvoice = () => {
    // Set up success callback
    setOnSuccess(() => {
      fetchInvoices() // Refresh your data
      showToast('Invoice created!') // Show notification
    })

    // Open the modal
    openInvoiceModal()
  }

  const handleViewCustomer = (customerId: string) => {
    openCustomerModal(customerId, 'view')
  }

  const handleEditSupplier = (supplierId: string) => {
    setOnSuccess(() => {
      refreshSupplierList()
    })
    openSupplierModal(supplierId, 'edit')
  }

  return (
    <div>
      <button onClick={handleCreateInvoice}>Create Invoice</button>
      <button onClick={() => handleViewCustomer('customer-123')}>
        View Customer
      </button>
      <button onClick={() => handleEditSupplier('supplier-456')}>
        Edit Supplier
      </button>
    </div>
  )
}
```

## API Reference

### Button Components

All button components share the same props:

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | Modal-specific default | Button text/content |
| `variant` | `'default' \| 'outline' \| 'ghost' \| 'link' \| 'destructive' \| 'secondary'` | `'default'` | Button variant |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon'` | `'default'` | Button size |
| `showIcon` | `boolean` | `true` | Show Plus icon |
| `itemId` | `string` | `undefined` | ID of item to view/edit |
| `mode` | `'create' \| 'view' \| 'edit'` | `'create'` | Modal mode |
| `onSuccess` | `() => void` | `undefined` | Callback after successful operation |
| `className` | `string` | `''` | Additional CSS classes |
| `disabled` | `boolean` | `false` | Disable button |

### useModal Hook

Returns an object with the following properties:

#### Functions

**`openInvoiceModal(itemId?: string, mode?: 'create' | 'view' | 'edit')`**
- Opens the invoice modal
- `itemId`: Optional invoice ID for view/edit mode
- `mode`: Operation mode (default: 'create')

**`openCustomerModal(itemId?: string, mode?: 'create' | 'view' | 'edit')`**
- Opens the customer modal
- `itemId`: Optional customer ID for view/edit mode
- `mode`: Operation mode (default: 'create')

**`openSupplierModal(itemId?: string, mode?: 'create' | 'view' | 'edit')`**
- Opens the supplier modal
- `itemId`: Optional supplier ID for view/edit mode
- `mode`: Operation mode (default: 'create')

**`openProductModal(itemId?: string, mode?: 'create' | 'view' | 'edit')`**
- Opens the product modal
- `itemId`: Optional product ID for view/edit mode
- `mode`: Operation mode (default: 'create')

**`closeModal()`**
- Closes the currently open modal

**`setOnSuccess(callback: () => void)`**
- Sets a callback function to be called after a successful operation
- Use this before opening a modal to handle data refresh, notifications, etc.

**`onSuccess()`**
- Triggers the success callback (called internally by modals)

#### State

**`modalState`**
- Current modal state object
- Properties:
  - `type`: Currently open modal type or null
  - `isOpen`: Whether a modal is open
  - `itemId`: ID of item being viewed/edited
  - `mode`: Current operation mode

## Advanced Usage

### Custom Modal Trigger

```tsx
import { useModal } from '@/components/modals'

function CustomInvoiceCard({ invoice }) {
  const { openInvoiceModal, setOnSuccess } = useModal()

  const handleEdit = () => {
    setOnSuccess(() => {
      // Refresh invoice list
      mutate('/api/invoices')
    })
    openInvoiceModal(invoice.id, 'edit')
  }

  return (
    <div onClick={handleEdit}>
      <h3>{invoice.number}</h3>
      <p>Click to edit</p>
    </div>
  )
}
```

### Conditional Rendering

```tsx
function ActionMenu({ hasEditPermission }) {
  return (
    <div>
      {hasEditPermission ? (
        <OpenInvoiceButton
          itemId="invoice-123"
          mode="edit"
          variant="outline"
        />
      ) : (
        <OpenInvoiceButton
          itemId="invoice-123"
          mode="view"
          variant="ghost"
        />
      )}
    </div>
  )
}
```

### Integration with Data Fetching

```tsx
function InvoiceList() {
  const [invoices, setInvoices] = useState([])

  const fetchInvoices = async () => {
    const data = await fetch('/api/invoices').then(r => r.json())
    setInvoices(data)
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  return (
    <div>
      <OpenInvoiceButton
        onSuccess={fetchInvoices}
      >
        Create New Invoice
      </OpenInvoiceButton>

      {invoices.map(invoice => (
        <OpenInvoiceButton
          key={invoice.id}
          itemId={invoice.id}
          mode="view"
          variant="ghost"
          showIcon={false}
        >
          {invoice.number}
        </OpenInvoiceButton>
      ))}
    </div>
  )
}
```

## Architecture

### File Structure

```
contexts/
  └── ModalContext.tsx         # Context provider and hook

components/
  └── modals/
      ├── GlobalModalManager.tsx    # Renders all modals
      ├── ModalTriggerButtons.tsx   # Pre-built button components
      └── index.ts                  # Public exports

components/
  ├── invoices/AddInvoiceDialog.tsx
  ├── customers/AddCustomerDialog.tsx
  ├── suppliers/AddSupplierDialog.tsx
  └── products/AddProductDialog.tsx
```

### How It Works

1. **ModalProvider** wraps your app and provides modal state
2. **GlobalModalManager** renders all modal components in your layout
3. **Button components** or **useModal hook** trigger modals from anywhere
4. Modals receive their open state and callbacks via the context
5. Success callbacks refresh data or perform other actions after operations

## Migration Guide

### Before (Old Way)

```tsx
// Parent component manages state
function ParentComponent() {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)

  const refreshData = () => {
    // Fetch data
  }

  return (
    <>
      <Button onClick={() => setIsInvoiceModalOpen(true)}>
        New Invoice
      </Button>
      <Button onClick={() => setIsCustomerModalOpen(true)}>
        New Customer
      </Button>

      <AddInvoiceDialog
        open={isInvoiceModalOpen}
        onOpenChange={setIsInvoiceModalOpen}
        onSuccess={refreshData}
      />
      <AddCustomerDialog
        open={isCustomerModalOpen}
        onOpenChange={setIsCustomerModalOpen}
        onSuccess={refreshData}
      />
    </>
  )
}
```

### After (New Way)

```tsx
// No state management needed!
import { OpenInvoiceButton, OpenCustomerButton } from '@/components/modals'

function ParentComponent() {
  const refreshData = () => {
    // Fetch data
  }

  return (
    <>
      <OpenInvoiceButton onSuccess={refreshData} />
      <OpenCustomerButton onSuccess={refreshData} />
    </>
  )
}
```

## Benefits

✅ **No Prop Drilling** - Trigger modals from any component without passing props through multiple levels

✅ **Centralized Management** - All modal state in one place

✅ **Type Safe** - Full TypeScript support with proper typing

✅ **Reusable** - Pre-built button components for common use cases

✅ **Flexible** - Use buttons or hook based on your needs

✅ **Easy Data Refresh** - Built-in success callback system

✅ **Consistent UX** - All modals behave the same way

## Troubleshooting

### Modal doesn't open

- Ensure `ModalProvider` is wrapping your app in the layout
- Ensure `GlobalModalManager` is included in your layout
- Check browser console for errors

### Success callback not firing

- Make sure you call `setOnSuccess()` before opening the modal
- The callback is reset when the modal closes

### Can't use hook outside component

- `useModal()` must be called inside a React component
- The component must be a child of `ModalProvider`

## Future Enhancements

- Quote modal support
- Confirmation dialogs
- Multi-step form modals
- Modal history/navigation
- Custom modal registration system
