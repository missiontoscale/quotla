# Global Modal System - Quick Reference Cheat Sheet

## Import

```tsx
import {
  OpenInvoiceButton,
  OpenCustomerButton,
  OpenSupplierButton,
  OpenProductButton,
  useModal
} from '@/components/modals'
```

## Quick Actions

### Create New Item
```tsx
<OpenInvoiceButton />
<OpenCustomerButton />
<OpenSupplierButton />
<OpenProductButton />
```

### With Data Refresh
```tsx
<OpenInvoiceButton onSuccess={refreshData} />
```

### View Item
```tsx
<OpenInvoiceButton itemId="123" mode="view" />
```

### Edit Item
```tsx
<OpenInvoiceButton itemId="123" mode="edit" onSuccess={refreshData} />
```

### Custom Text
```tsx
<OpenInvoiceButton>Create New Invoice</OpenInvoiceButton>
```

### Custom Styling
```tsx
<OpenInvoiceButton
  variant="outline"
  size="sm"
  className="bg-blue-500"
  showIcon={false}
>
  Custom Button
</OpenInvoiceButton>
```

## Using the Hook

### Basic
```tsx
const { openInvoiceModal } = useModal()

<button onClick={() => openInvoiceModal()}>Open</button>
```

### With Callback
```tsx
const { openInvoiceModal, setOnSuccess } = useModal()

const handleClick = () => {
  setOnSuccess(refreshData)
  openInvoiceModal()
}
```

### View/Edit
```tsx
const { openInvoiceModal } = useModal()

<button onClick={() => openInvoiceModal('123', 'view')}>View</button>
<button onClick={() => openInvoiceModal('123', 'edit')}>Edit</button>
```

## Button Props

| Prop | Type | Default | Example |
|------|------|---------|---------|
| `children` | string | "New [Type]" | `"Create Invoice"` |
| `variant` | string | `"default"` | `"outline"` `"ghost"` |
| `size` | string | `"default"` | `"sm"` `"lg"` |
| `showIcon` | boolean | `true` | `false` |
| `itemId` | string | - | `"invoice-123"` |
| `mode` | string | `"create"` | `"view"` `"edit"` |
| `onSuccess` | function | - | `() => refresh()` |
| `className` | string | - | `"bg-blue-500"` |

## Hook Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `openInvoiceModal()` | `itemId?`, `mode?` | Open invoice modal |
| `openCustomerModal()` | `itemId?`, `mode?` | Open customer modal |
| `openSupplierModal()` | `itemId?`, `mode?` | Open supplier modal |
| `openProductModal()` | `itemId?`, `mode?` | Open product modal |
| `closeModal()` | - | Close current modal |
| `setOnSuccess()` | `callback` | Set success callback |

## Common Patterns

### Dropdown Menu
```tsx
const { openInvoiceModal } = useModal()

<DropdownMenuItem onClick={() => openInvoiceModal(id, 'edit')}>
  Edit
</DropdownMenuItem>
```

### Data Table Row Action
```tsx
const handleEdit = (id: string) => {
  setOnSuccess(loadData)
  openInvoiceModal(id, 'edit')
}
```

### Empty State
```tsx
<div className="text-center">
  <p>No invoices yet</p>
  <OpenInvoiceButton onSuccess={loadInvoices}>
    Create First Invoice
  </OpenInvoiceButton>
</div>
```

### Floating Action Button
```tsx
<OpenInvoiceButton
  className="fixed bottom-8 right-8 rounded-full"
  size="icon"
/>
```

### Chained Modals
```tsx
setOnSuccess(() => {
  openInvoiceModal() // Open invoice after customer created
})
openCustomerModal()
```

## Documentation

- 📖 Complete Guide: `docs/MODAL_SYSTEM.md`
- 🔄 Migration: `docs/MODAL_MIGRATION_EXAMPLE.md`
- 💡 Examples: `docs/QUICK_START_EXAMPLES.md`
- 📋 Summary: `docs/MODAL_SYSTEM_SUMMARY.md`

## Troubleshooting

**Modal doesn't open**
→ Check that ModalProvider wraps your app
→ Check that GlobalModalManager is in layout

**Success callback doesn't fire**
→ Call `setOnSuccess()` before opening modal

**TypeScript errors**
→ Import from `@/components/modals`

## Quick Copy-Paste

```tsx
// Invoice
<OpenInvoiceButton onSuccess={refresh} />
<OpenInvoiceButton itemId={id} mode="view" />
<OpenInvoiceButton itemId={id} mode="edit" onSuccess={refresh} />

// Customer
<OpenCustomerButton onSuccess={refresh} />
<OpenCustomerButton itemId={id} mode="view" />
<OpenCustomerButton itemId={id} mode="edit" onSuccess={refresh} />

// Supplier
<OpenSupplierButton onSuccess={refresh} />
<OpenSupplierButton itemId={id} mode="view" />
<OpenSupplierButton itemId={id} mode="edit" onSuccess={refresh} />

// Product
<OpenProductButton onSuccess={refresh} />
<OpenProductButton itemId={id} mode="view" />
<OpenProductButton itemId={id} mode="edit" onSuccess={refresh} />
```
