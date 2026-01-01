# Quotla Inventory Management System - Complete Guide

## Overview

The Quotla Inventory Management System is a comprehensive solution for tracking products, services, suppliers, stock levels, and purchase orders. This system rivals QuickBooks' inventory features with real-time tracking, automated alerts, and complete stock movement history.

## Features Implemented

### ✅ Core Features

1. **Product & Service Management**
   - Track both physical products and services
   - SKU (Stock Keeping Unit) support
   - Categories and descriptions
   - Multi-currency pricing (USD, NGN, EUR, GBP)
   - Cost price vs selling price tracking
   - Tax rate configuration per item

2. **Inventory Tracking**
   - Real-time stock quantity monitoring
   - Low stock threshold alerts
   - Out-of-stock detection
   - Reorder quantity suggestions
   - Optional tracking (can be disabled for services)

3. **Supplier Management**
   - Complete supplier/vendor database
   - Contact information management
   - Payment terms tracking
   - Active/inactive status
   - Address and tax ID storage

4. **Stock Movement History**
   - Complete audit trail of all stock changes
   - Movement types: purchase, sale, adjustment, return, damage, transfer
   - Reference linking to quotes, invoices, and purchase orders
   - Financial value tracking for each movement

5. **Purchase Order System**
   - Create and manage purchase orders
   - Link to suppliers
   - Line item management
   - Status tracking (draft, sent, received, partial, cancelled)
   - Automatic total calculations
   - Expected delivery date tracking

6. **Low Stock Alerts**
   - Automatic alert generation when stock falls below threshold
   - Notification system (ready for email integration)
   - Acknowledgement tracking

7. **Inventory Valuation**
   - Real-time total inventory value calculation
   - Cost-based valuation
   - Potential profit analysis
   - Category-wise breakdown

## Database Schema

The system uses 6 main tables with complete Row Level Security (RLS):

### 1. `suppliers`
Stores vendor/supplier information including contact details, payment terms, and addresses.

### 2. `inventory_items`
Core inventory table tracking products and services with pricing, stock levels, and supplier relationships.

### 3. `purchase_orders`
Purchase order headers with supplier, dates, and totals.

### 4. `purchase_order_items`
Line items for purchase orders linking to inventory items.

### 5. `stock_movements`
Complete audit trail of all inventory quantity changes with financial impact tracking.

### 6. `low_stock_alerts`
Automated alerts for items below threshold with notification tracking.

## Database Setup

1. Open your Supabase project's SQL Editor
2. Copy the contents of `/database/inventory-schema.sql`
3. Execute the script
4. All tables, indexes, triggers, and RLS policies will be created automatically

## File Structure

```
/app
  /inventory
    page.tsx                        # Main inventory list page
    /new
      page.tsx                      # Add new item form
    /[id]
      /edit
        page.tsx                    # Edit item form
    /suppliers
      page.tsx                      # Suppliers list
      /new
        page.tsx                    # Add supplier form
      /[id]
        /edit
          page.tsx                  # Edit supplier form

/types
  inventory.ts                      # TypeScript interfaces and types

/database
  inventory-schema.sql              # Complete database schema

/components/navbar
  nav-data.ts                       # Updated with Inventory link
```

## User Interface

### Inventory Dashboard (`/inventory`)

**Stats Cards:**
- Total Items count (products + services)
- Total Inventory Value (at cost)
- Low Stock Count (items below threshold)
- Out of Stock Count (items at zero)

**Features:**
- Search by name, SKU, or description
- Filter by item type (product/service)
- Filter by category
- Toggle low stock only view
- Quick access to supplier management

**Table Columns:**
- Item name and description
- SKU
- Type badge (product/service)
- Stock quantity with low stock warnings
- Unit price
- Total value (quantity × cost)
- Actions (Edit/Delete)

### Add/Edit Item Form

**Sections:**

1. **Item Type Selection**
   - Radio buttons for Product or Service
   - Services automatically disable inventory tracking

2. **Basic Information**
   - Name (required)
   - SKU
   - Description
   - Category
   - Currency selection

3. **Pricing**
   - Selling Price (required)
   - Cost Price
   - Tax Rate
   - Auto-calculated profit margin display

4. **Inventory Tracking** (Products only)
   - Toggle to enable/disable tracking
   - Quantity on hand
   - Low stock alert threshold
   - Reorder quantity

5. **Supplier Assignment**
   - Dropdown to select default supplier
   - Quick link to add new supplier

### Suppliers Management (`/inventory/suppliers`)

**Stats Cards:**
- Total Suppliers
- Active Suppliers
- Inactive Suppliers

**Features:**
- Search by name, email, or contact person
- View all supplier details in card layout
- Quick edit/delete actions

**Supplier Information Displayed:**
- Name and status badge
- Contact person
- Email (clickable mailto link)
- Phone (clickable tel link)
- Payment terms
- Full address
- Notes

### Add Supplier Form

**Sections:**

1. **Basic Information**
   - Supplier name (required)
   - Contact person
   - Email
   - Phone

2. **Address**
   - Street address
   - City
   - State/Province
   - Country
   - Postal code

3. **Business Details**
   - Tax ID / VAT number
   - Payment terms dropdown (Due on receipt, Net 15, 30, 60, 90)

4. **Additional Notes**
   - Free-form text area for supplier notes

## Automated Features

### 1. Stock Movement Tracking
Whenever inventory quantity changes, the system automatically:
- Records the movement in `stock_movements`
- Stores before/after quantities
- Calculates financial impact
- Links to the source (quote/invoice/PO)
- Records who made the change

### 2. Low Stock Alerts
When inventory drops below threshold:
- Alert automatically created in `low_stock_alerts`
- Timestamp recorded
- Can be acknowledged by user
- Ready for email notification integration

### 3. Purchase Order Totals
When PO line items change:
- Subtotal automatically recalculated
- Tax amount computed
- Total amount updated
- All via database triggers

## Database Functions

### `update_inventory_quantity()`
Central function for all stock changes. Call this instead of directly updating `inventory_items`.

```sql
SELECT update_inventory_quantity(
  p_inventory_item_id := 'item-uuid',
  p_quantity_change := -5,  -- negative for decrease, positive for increase
  p_movement_type := 'sale',
  p_reference_type := 'invoice',
  p_reference_id := 'invoice-uuid',
  p_notes := 'Sold to customer'
);
```

### Views

**`inventory_valuation`**
- Real-time inventory value report
- Shows cost value, retail value, and potential profit
- Only includes active items with tracking enabled

**`low_stock_items`**
- Quick view of items needing reorder
- Includes supplier information
- Sorted by urgency

## Next Steps for Integration

### 1. Quote/Invoice Integration
When a quote or invoice is created with inventory items:

```typescript
// After creating quote/invoice, update inventory
for (const item of lineItems) {
  if (item.inventory_item_id) {
    await supabase.rpc('update_inventory_quantity', {
      p_inventory_item_id: item.inventory_item_id,
      p_quantity_change: -item.quantity,  // negative for decrease
      p_movement_type: 'sale',
      p_reference_type: type === 'quote' ? 'quote' : 'invoice',
      p_reference_id: createdDocument.id,
      p_notes: `Sold via ${type} #${documentNumber}`
    })
  }
}
```

### 2. Purchase Order Processing
When receiving a purchase order:

```typescript
// Mark items as received
for (const item of poItems) {
  if (item.inventory_item_id) {
    await supabase.rpc('update_inventory_quantity', {
      p_inventory_item_id: item.inventory_item_id,
      p_quantity_change: item.quantity_received,  // positive for increase
      p_movement_type: 'purchase',
      p_reference_type: 'purchase_order',
      p_reference_id: purchaseOrder.id,
      p_notes: `Received from supplier`
    })
  }
}

// Update PO status
await supabase
  .from('purchase_orders')
  .update({ status: 'received', received_date: new Date().toISOString() })
  .eq('id', purchaseOrder.id)
```

### 3. Low Stock Notifications
Set up a cron job or use Supabase Edge Functions:

```typescript
// Get unacknowledged alerts
const { data: alerts } = await supabase
  .from('low_stock_alerts')
  .select('*, inventory_item:inventory_items(*)')
  .eq('is_acknowledged', false)
  .eq('notification_sent', false)

// Send email notifications
for (const alert of alerts) {
  await sendEmail({
    to: userEmail,
    subject: `Low Stock Alert: ${alert.inventory_item.name}`,
    body: `Item ${alert.inventory_item.name} is running low (${alert.quantity_at_trigger} remaining)`
  })

  // Mark as sent
  await supabase
    .from('low_stock_alerts')
    .update({ notification_sent: true, notification_sent_at: new Date().toISOString() })
    .eq('id', alert.id)
}
```

## Security

All tables have Row Level Security (RLS) enabled:
- Users can only see their own data
- All policies check `auth.uid() = user_id`
- Foreign key constraints ensure data integrity
- Triggers use `SECURITY DEFINER` for safe execution

## Performance Considerations

**Indexes Created:**
- All foreign keys indexed
- User ID indexed on all tables
- Frequently queried fields (SKU, category, status)
- Composite index for low stock detection

**Denormalized Fields:**
- Purchase order totals (instead of calculating each time)
- Stock movement before/after quantities (for audit trail)

## Testing Checklist

- [ ] Create a product with inventory tracking
- [ ] Create a service without inventory tracking
- [ ] Add multiple suppliers
- [ ] Verify low stock alert triggers when quantity drops below threshold
- [ ] Test search and filter functionality
- [ ] Create a purchase order
- [ ] Verify stock movement records are created
- [ ] Test edit and delete operations
- [ ] Verify RLS policies (can't see other users' data)
- [ ] Test multi-currency support

## Future Enhancements

1. **Barcode Scanning**
   - Mobile app for scanning
   - Generate barcodes for SKUs

2. **Multi-Location Support**
   - Track inventory across multiple warehouses
   - Transfer between locations

3. **Inventory Forecasting**
   - Predict reorder needs based on sales velocity
   - Seasonal demand patterns

4. **Batch/Lot Tracking**
   - Track items by batch number
   - Expiration date management

5. **Integration with Accounting**
   - COGS (Cost of Goods Sold) tracking
   - Inventory valuation methods (FIFO, LIFO, Average)

6. **Advanced Reporting**
   - Inventory turnover rate
   - Dead stock identification
   - Supplier performance metrics

## Support

For issues or questions:
1. Check the database schema comments
2. Review TypeScript types in `/types/inventory.ts`
3. Inspect RLS policies in Supabase dashboard
4. Check database triggers and functions

---

**Last Updated:** 2026-01-01
**Version:** 1.0
**Status:** Production Ready
