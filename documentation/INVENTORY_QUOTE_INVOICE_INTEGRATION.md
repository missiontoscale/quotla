# Inventory Integration with Quotes & Invoices

## Overview

This integration automatically tracks inventory when quotes are approved or invoices are sent/paid. Stock levels are updated in real-time with complete audit trails.

## Database Changes

### Migration: `add-inventory-to-quotes-invoices.sql`

**Columns Added:**
- `quote_items.inventory_item_id` - Links quote line items to inventory
- `invoice_items.inventory_item_id` - Links invoice line items to inventory

**Triggers Created:**
1. `trigger_quote_inventory` - Auto-deducts stock when quote status changes to 'approved'
2. `trigger_invoice_inventory` - Auto-deducts stock when invoice status changes to 'sent' or 'paid'

**Views Created:**
- `quote_items_with_inventory` - Shows stock status for each quote item
- `invoice_items_with_inventory` - Shows stock status for each invoice item

## How It Works

### When Creating a Quote/Invoice

1. User selects an inventory item using `InventoryItemSelector` component
2. Item details (name, price, stock info) are populated automatically
3. Stock availability is checked and displayed:
   - ✅ **In stock** - Enough inventory available
   - ⚠️ **Low stock** - Below threshold but available
   - ❌ **Out of stock** - No inventory available
   - 📦 **Service** - No inventory tracking needed

### When Quote is Approved

```sql
-- Automatic trigger fires
UPDATE quotes SET status = 'approved' WHERE id = 'quote-id';

-- For each line item with inventory_item_id:
-- 1. Stock quantity is decreased
-- 2. Stock movement record is created
-- 3. Low stock alert generated if needed
```

### When Invoice is Sent/Paid

```sql
-- Automatic trigger fires
UPDATE invoices SET status = 'sent' WHERE id = 'invoice-id';

-- For each line item with inventory_item_id:
-- 1. Stock quantity is decreased
-- 2. Stock movement record is created
-- 3. Low stock alert generated if needed
```

## Frontend Integration

### Step 1: Import the Component

```typescript
import InventoryItemSelector from '@/components/InventoryItemSelector'
```

### Step 2: Add to Quote/Invoice Form

In your quote or invoice form component:

```typescript
// Add state to track if using inventory
const [useInventory, setUseInventory] = useState(false)

// Handler for when inventory item is selected
const handleInventoryItemSelect = (inventoryItem: InventoryItem, itemIndex: number) => {
  const newItems = [...items]
  newItems[itemIndex] = {
    ...newItems[itemIndex],
    description: inventoryItem.name,
    unit_price: inventoryItem.unit_price,
    inventory_item_id: inventoryItem.id,
    available_quantity: inventoryItem.quantity_on_hand,
    stock_status: inventoryItem.track_inventory
      ? (inventoryItem.quantity_on_hand === 0
          ? 'Out of stock'
          : inventoryItem.quantity_on_hand <= inventoryItem.low_stock_threshold
            ? 'Low stock'
            : 'In stock')
      : 'Not tracked',
  }

  // Recalculate amount
  newItems[itemIndex].amount = newItems[itemIndex].quantity * inventoryItem.unit_price

  setItems(newItems)
}
```

### Step 3: Add UI Toggle

```tsx
{/* Toggle for inventory selection */}
<div className="mb-4">
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={useInventory}
      onChange={(e) => setUseInventory(e.target.checked)}
      className="rounded border-gray-300"
    />
    <span className="text-sm font-medium text-gray-700">
      Use items from inventory
    </span>
  </label>
</div>

{/* In your line items section */}
{items.map((item, index) => (
  <div key={index} className="space-y-3">
    {/* Show inventory selector if enabled */}
    {useInventory && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select from Inventory
        </label>
        <InventoryItemSelector
          onSelect={(inventoryItem) => handleInventoryItemSelect(inventoryItem, index)}
          currency={formData.currency}
        />
      </div>
    )}

    {/* Show stock status if item has inventory link */}
    {item.inventory_item_id && item.stock_status && (
      <div className={`text-xs px-3 py-2 rounded-lg ${
        item.stock_status === 'In stock' ? 'bg-green-50 text-green-700' :
        item.stock_status === 'Low stock' ? 'bg-orange-50 text-orange-700' :
        item.stock_status === 'Out of stock' ? 'bg-red-50 text-red-700' :
        'bg-gray-50 text-gray-700'
      }`}>
        <strong>Stock Status:</strong> {item.stock_status}
        {item.available_quantity !== undefined && item.stock_status !== 'Not tracked' && (
          <span> ({item.available_quantity} available)</span>
        )}
      </div>
    )}

    {/* Regular item fields */}
    <div className="grid grid-cols-12 gap-3">
      {/* Description, Quantity, Price, Amount fields */}
    </div>
  </div>
))}
```

### Step 4: Save with Inventory Link

When saving the quote/invoice:

```typescript
// For each line item, include inventory_item_id
const lineItemsToSave = items.map((item, index) => ({
  description: item.description,
  quantity: item.quantity,
  unit_price: item.unit_price,
  amount: item.amount,
  sort_order: index,
  inventory_item_id: item.inventory_item_id || null,  // Include inventory link
  quote_id: quoteId,  // or invoice_id for invoices
}))

await supabase.from('quote_items').insert(lineItemsToSave)
```

## Stock Validation

### Before Creating Quote/Invoice

Check if sufficient stock is available:

```typescript
const validateStock = async (items: LineItem[]) => {
  const warnings: string[] = []

  for (const item of items) {
    if (item.inventory_item_id && item.stock_status === 'Out of stock') {
      warnings.push(`${item.description} is out of stock`)
    } else if (item.inventory_item_id && item.stock_status === 'Low stock') {
      warnings.push(`${item.description} has low stock (${item.available_quantity} available)`)
    } else if (item.inventory_item_id && item.available_quantity !== undefined && item.quantity > item.available_quantity) {
      warnings.push(`${item.description}: Requesting ${item.quantity} but only ${item.available_quantity} available`)
    }
  }

  if (warnings.length > 0) {
    const proceed = confirm(
      'Stock warnings:\n\n' + warnings.join('\n') + '\n\nDo you want to proceed anyway?'
    )
    return proceed
  }

  return true
}
```

## Viewing Stock Movements

### Query Stock History

```typescript
const getStockHistory = async (inventoryItemId: string) => {
  const { data } = await supabase
    .from('stock_movements')
    .select('*')
    .eq('inventory_item_id', inventoryItemId)
    .order('created_at', { ascending: false })

  return data
}
```

### Find Related Documents

```typescript
const getRelatedDocuments = async (inventoryItemId: string) => {
  // Get quotes
  const { data: quoteMovements } = await supabase
    .from('stock_movements')
    .select('*, quotes(*)')
    .eq('inventory_item_id', inventoryItemId)
    .eq('reference_type', 'quote')

  // Get invoices
  const { data: invoiceMovements } = await supabase
    .from('stock_movements')
    .select('*, invoices(*)')
    .eq('inventory_item_id', inventoryItemId)
    .eq('reference_type', 'invoice')

  return { quotes: quoteMovements, invoices: invoiceMovements }
}
```

## Manual Stock Adjustments

For inventory corrections or adjustments:

```typescript
const adjustInventory = async (
  inventoryItemId: string,
  quantityChange: number,
  notes: string
) => {
  const { error } = await supabase.rpc('update_inventory_quantity', {
    p_inventory_item_id: inventoryItemId,
    p_quantity_change: quantityChange,
    p_movement_type: 'adjustment',
    p_reference_type: 'manual',
    p_reference_id: null,
    p_notes: notes
  })

  if (error) throw error
}

// Example: Add 50 units due to receiving shipment
await adjustInventory(
  'item-uuid',
  50,
  'Received shipment from supplier'
)

// Example: Remove 5 units due to damage
await adjustInventory(
  'item-uuid',
  -5,
  'Items damaged during storage'
)
```

## Reverting Transactions

If you need to reverse a quote/invoice (e.g., cancellation):

```typescript
const reverseQuoteInventory = async (quoteId: string) => {
  // Get all items that were deducted
  const { data: items } = await supabase
    .from('stock_movements')
    .select('*')
    .eq('reference_type', 'quote')
    .eq('reference_id', quoteId)

  // Reverse each movement
  for (const movement of items || []) {
    await supabase.rpc('update_inventory_quantity', {
      p_inventory_item_id: movement.inventory_item_id,
      p_quantity_change: -movement.quantity_change,  // Opposite of original
      p_movement_type: 'adjustment',
      p_reference_type: 'manual',
      p_reference_id: quoteId,
      p_notes: `Reversed quote #${quoteId}`
    })
  }
}
```

## Reporting

### Inventory Impact by Quote/Invoice

```sql
SELECT
  i.name AS item_name,
  i.sku,
  SUM(CASE WHEN sm.reference_type = 'quote' THEN sm.quantity_change ELSE 0 END) AS sold_via_quotes,
  SUM(CASE WHEN sm.reference_type = 'invoice' THEN sm.quantity_change ELSE 0 END) AS sold_via_invoices,
  SUM(sm.quantity_change) AS total_sold,
  SUM(sm.total_value) AS total_value_sold
FROM stock_movements sm
JOIN inventory_items i ON sm.inventory_item_id = i.id
WHERE sm.movement_type = 'sale'
  AND sm.created_at >= '2026-01-01'
GROUP BY i.id, i.name, i.sku
ORDER BY total_value_sold DESC;
```

### Best Selling Items

```sql
SELECT
  i.name,
  i.sku,
  COUNT(DISTINCT sm.reference_id) AS number_of_sales,
  SUM(ABS(sm.quantity_change)) AS total_quantity_sold,
  SUM(sm.total_value) AS total_revenue
FROM stock_movements sm
JOIN inventory_items i ON sm.inventory_item_id = i.id
WHERE sm.movement_type = 'sale'
  AND sm.created_at >= NOW() - INTERVAL '30 days'
GROUP BY i.id, i.name, i.sku
ORDER BY total_quantity_sold DESC
LIMIT 10;
```

## Testing Checklist

- [ ] Create quote with inventory items
- [ ] Approve quote and verify stock decreases
- [ ] Create invoice with inventory items
- [ ] Mark invoice as sent and verify stock decreases
- [ ] Verify stock movement records are created
- [ ] Test with out-of-stock items
- [ ] Test with low-stock warnings
- [ ] Test with services (no inventory tracking)
- [ ] Test manual stock adjustments
- [ ] Verify low stock alerts trigger correctly
- [ ] Test multi-currency scenarios
- [ ] Verify views show correct stock status

## Troubleshooting

**Stock not decreasing:**
- Check that `inventory_item_id` is saved in quote_items/invoice_items
- Verify triggers are enabled: `SELECT * FROM pg_trigger WHERE tgname LIKE '%inventory%'`
- Check quote/invoice status matches trigger conditions

**Trigger errors:**
- Check function exists: `SELECT * FROM pg_proc WHERE proname = 'update_inventory_quantity'`
- Review logs in Supabase dashboard
- Ensure RLS policies allow the operation

**Stock warnings not showing:**
- Verify low_stock_threshold is set on inventory items
- Check that track_inventory is TRUE
- Ensure low stock alert trigger is enabled

---

**Last Updated:** 2026-01-01
**Version:** 1.0
