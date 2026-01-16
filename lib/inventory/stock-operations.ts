import { supabase } from '@/lib/supabase/client'

interface StockOperationResult {
  success: boolean
  error?: string
  itemsProcessed?: number
}

/**
 * Deducts stock for all inventory-linked items in an invoice.
 * Creates stock movement records with type 'sale'.
 * Called when invoice status transitions to 'sent' or 'paid' (from draft).
 */
export async function deductStockForInvoice(
  invoiceId: string,
  userId: string
): Promise<StockOperationResult> {
  try {
    // Fetch invoice items that have inventory links
    const { data: invoiceItems, error: fetchError } = await supabase
      .from('invoice_items')
      .select(`
        id,
        quantity,
        description,
        inventory_item_id
      `)
      .eq('invoice_id', invoiceId)
      .not('inventory_item_id', 'is', null)

    if (fetchError) {
      console.error('Error fetching invoice items:', fetchError)
      return { success: false, error: fetchError.message }
    }

    if (!invoiceItems || invoiceItems.length === 0) {
      // No inventory-linked items, nothing to deduct
      return { success: true, itemsProcessed: 0 }
    }

    let itemsProcessed = 0

    for (const item of invoiceItems) {
      if (!item.inventory_item_id) continue

      // Get current inventory quantity
      const { data: inventoryItem, error: invError } = await supabase
        .from('inventory_items')
        .select('id, quantity_on_hand, name')
        .eq('id', item.inventory_item_id)
        .eq('user_id', userId)
        .single()

      if (invError || !inventoryItem) {
        console.error(`Error fetching inventory item ${item.inventory_item_id}:`, invError)
        continue
      }

      const quantityBefore = inventoryItem.quantity_on_hand
      const quantityAfter = Math.max(0, quantityBefore - item.quantity)
      const quantityChange = -(item.quantity)

      // Update inventory quantity
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ quantity_on_hand: quantityAfter })
        .eq('id', item.inventory_item_id)
        .eq('user_id', userId)

      if (updateError) {
        console.error(`Error updating inventory item ${item.inventory_item_id}:`, updateError)
        continue
      }

      // Create stock movement record
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          user_id: userId,
          inventory_item_id: item.inventory_item_id,
          movement_type: 'sale',
          quantity_change: quantityChange,
          quantity_before: quantityBefore,
          quantity_after: quantityAfter,
          reference_type: 'invoice',
          reference_id: invoiceId,
          notes: `Sold via invoice: ${item.quantity} units of ${item.description}`,
          performed_by: userId,
        })

      if (movementError) {
        console.error('Error creating stock movement:', movementError)
        // Don't fail the whole operation, stock was already updated
      }

      itemsProcessed++
    }

    return { success: true, itemsProcessed }
  } catch (error) {
    console.error('Error in deductStockForInvoice:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Restores stock for all inventory-linked items in an invoice.
 * Creates stock movement records with type 'return'.
 * Called when invoice is cancelled or deleted after being sent/paid.
 */
export async function restoreStockForInvoice(
  invoiceId: string,
  userId: string
): Promise<StockOperationResult> {
  try {
    // Fetch invoice items that have inventory links
    const { data: invoiceItems, error: fetchError } = await supabase
      .from('invoice_items')
      .select(`
        id,
        quantity,
        description,
        inventory_item_id
      `)
      .eq('invoice_id', invoiceId)
      .not('inventory_item_id', 'is', null)

    if (fetchError) {
      console.error('Error fetching invoice items:', fetchError)
      return { success: false, error: fetchError.message }
    }

    if (!invoiceItems || invoiceItems.length === 0) {
      // No inventory-linked items, nothing to restore
      return { success: true, itemsProcessed: 0 }
    }

    let itemsProcessed = 0

    for (const item of invoiceItems) {
      if (!item.inventory_item_id) continue

      // Get current inventory quantity
      const { data: inventoryItem, error: invError } = await supabase
        .from('inventory_items')
        .select('id, quantity_on_hand, name')
        .eq('id', item.inventory_item_id)
        .eq('user_id', userId)
        .single()

      if (invError || !inventoryItem) {
        console.error(`Error fetching inventory item ${item.inventory_item_id}:`, invError)
        continue
      }

      const quantityBefore = inventoryItem.quantity_on_hand
      const quantityAfter = quantityBefore + item.quantity
      const quantityChange = item.quantity // Positive for restoration

      // Update inventory quantity
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ quantity_on_hand: quantityAfter })
        .eq('id', item.inventory_item_id)
        .eq('user_id', userId)

      if (updateError) {
        console.error(`Error updating inventory item ${item.inventory_item_id}:`, updateError)
        continue
      }

      // Create stock movement record
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          user_id: userId,
          inventory_item_id: item.inventory_item_id,
          movement_type: 'return',
          quantity_change: quantityChange,
          quantity_before: quantityBefore,
          quantity_after: quantityAfter,
          reference_type: 'invoice',
          reference_id: invoiceId,
          notes: `Invoice cancelled - stock restored: ${item.quantity} units of ${item.description}`,
          performed_by: userId,
        })

      if (movementError) {
        console.error('Error creating stock movement:', movementError)
        // Don't fail the whole operation, stock was already updated
      }

      itemsProcessed++
    }

    return { success: true, itemsProcessed }
  } catch (error) {
    console.error('Error in restoreStockForInvoice:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Checks if stock was already deducted for an invoice.
 * Useful for preventing double-deductions.
 */
export async function hasStockBeenDeducted(invoiceId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('stock_movements')
    .select('id')
    .eq('reference_type', 'invoice')
    .eq('reference_id', invoiceId)
    .eq('movement_type', 'sale')
    .limit(1)

  if (error) {
    console.error('Error checking stock deduction status:', error)
    return false
  }

  return data && data.length > 0
}
