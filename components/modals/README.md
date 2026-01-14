# Global Modal System

A centralized modal management system that allows you to trigger Invoice, Customer, Supplier, and Product modals from anywhere in your app without prop drilling.

## Quick Start

```tsx
import { OpenInvoiceButton, OpenCustomerButton } from '@/components/modals'

function MyPage() {
  const refreshData = async () => {
    // Your data fetching logic
  }

  return (
    <div>
      {/* Create new invoice */}
      <OpenInvoiceButton onSuccess={refreshData} />

      {/* Create new customer */}
      <OpenCustomerButton onSuccess={refreshData} />

      {/* View existing invoice */}
      <OpenInvoiceButton
        itemId="invoice-123"
        mode="view"
      >
        View Invoice
      </OpenInvoiceButton>

      {/* Edit with custom styling */}
      <OpenCustomerButton
        itemId="customer-456"
        mode="edit"
        variant="outline"
        size="sm"
        onSuccess={refreshData}
      >
        Edit Customer
      </OpenCustomerButton>
    </div>
  )
}
```

## Available Components

- `OpenInvoiceButton` - Trigger invoice modal
- `OpenCustomerButton` - Trigger customer modal
- `OpenSupplierButton` - Trigger supplier modal
- `OpenProductButton` - Trigger product modal

## Common Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | "New [Type]" | Button text |
| `variant` | Button variant | `'default'` | Button style |
| `size` | Button size | `'default'` | Button size |
| `showIcon` | `boolean` | `true` | Show Plus icon |
| `itemId` | `string` | - | ID for view/edit mode |
| `mode` | `'create' \| 'view' \| 'edit'` | `'create'` | Operation mode |
| `onSuccess` | `() => void` | - | Callback after success |

## Advanced Usage with Hook

```tsx
import { useModal } from '@/components/modals'

function MyComponent() {
  const { openInvoiceModal, setOnSuccess } = useModal()

  const handleCreateInvoice = () => {
    setOnSuccess(() => {
      console.log('Invoice created!')
      refreshData()
    })
    openInvoiceModal()
  }

  return <button onClick={handleCreateInvoice}>Create</button>
}
```

## Documentation

- 📖 [Complete Documentation](../../docs/MODAL_SYSTEM.md)
- 🔄 [Migration Guide](../../docs/MODAL_MIGRATION_EXAMPLE.md)

## How It Works

1. `ModalProvider` wraps your app (already set up in Providers.tsx)
2. `GlobalModalManager` renders all modals once (already in layout)
3. Use button components or `useModal()` hook to trigger modals
4. Modals automatically handle their state globally

No need to manage modal state in individual components!
