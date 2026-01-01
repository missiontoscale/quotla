// Inventory Management TypeScript Types

export interface Supplier {
  id: string
  user_id: string
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  tax_id?: string
  payment_terms?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ItemType = 'product' | 'service'

export interface InventoryItem {
  id: string
  user_id: string

  // Basic Information
  name: string
  sku?: string
  description?: string
  category?: string
  item_type: ItemType

  // Pricing
  unit_price: number
  cost_price: number
  currency: string

  // Stock Management
  track_inventory: boolean
  quantity_on_hand: number
  low_stock_threshold: number
  reorder_quantity: number

  // Supplier
  default_supplier_id?: string

  // Additional
  tax_rate: number
  is_active: boolean
  image_url?: string

  // Timestamps
  created_at: string
  updated_at: string

  // Computed/joined fields (not in DB)
  supplier?: Supplier
  is_low_stock?: boolean
  total_value?: number
}

export type PurchaseOrderStatus = 'draft' | 'sent' | 'received' | 'partial' | 'cancelled'

export interface PurchaseOrder {
  id: string
  user_id: string
  supplier_id?: string

  // PO Details
  po_number: string
  status: PurchaseOrderStatus

  // Dates
  order_date: string
  expected_delivery_date?: string
  received_date?: string

  // Financial
  subtotal: number
  tax_amount: number
  total_amount: number
  currency: string

  // Additional
  notes?: string
  shipping_address?: string

  // Timestamps
  created_at: string
  updated_at: string

  // Computed/joined fields
  supplier?: Supplier
  items?: PurchaseOrderItem[]
}

export interface PurchaseOrderItem {
  id: string
  purchase_order_id: string
  inventory_item_id?: string

  // Item Details
  item_name: string
  description?: string
  quantity: number
  quantity_received: number

  // Pricing
  unit_cost: number
  subtotal: number

  created_at: string
  updated_at: string

  // Computed/joined fields
  inventory_item?: InventoryItem
}

export type MovementType = 'purchase' | 'sale' | 'adjustment' | 'return' | 'damage' | 'transfer'
export type ReferenceType = 'quote' | 'invoice' | 'purchase_order' | 'manual'

export interface StockMovement {
  id: string
  user_id: string
  inventory_item_id: string

  // Movement Details
  movement_type: MovementType
  quantity_change: number
  quantity_before: number
  quantity_after: number

  // Reference
  reference_type?: ReferenceType
  reference_id?: string

  // Financial
  unit_value?: number
  total_value?: number

  // Additional
  notes?: string
  performed_by?: string

  created_at: string

  // Computed/joined fields
  inventory_item?: InventoryItem
}

export interface LowStockAlert {
  id: string
  user_id: string
  inventory_item_id: string

  // Alert Details
  triggered_at: string
  quantity_at_trigger: number
  threshold: number
  is_acknowledged: boolean
  acknowledged_at?: string

  // Notification
  notification_sent: boolean
  notification_sent_at?: string

  // Computed/joined fields
  inventory_item?: InventoryItem
}

// View types
export interface InventoryValuation {
  id: string
  user_id: string
  name: string
  sku?: string
  category?: string
  quantity_on_hand: number
  cost_price: number
  unit_price: number
  total_cost_value: number
  total_retail_value: number
  potential_profit: number
}

export interface LowStockItem {
  id: string
  user_id: string
  name: string
  sku?: string
  category?: string
  quantity_on_hand: number
  low_stock_threshold: number
  reorder_quantity: number
  supplier_name?: string
  supplier_id?: string
}

// Form types for creating/updating
export interface CreateInventoryItemInput {
  name: string
  sku?: string
  description?: string
  category?: string
  item_type: ItemType
  unit_price: number
  cost_price?: number
  currency?: string
  track_inventory?: boolean
  quantity_on_hand?: number
  low_stock_threshold?: number
  reorder_quantity?: number
  default_supplier_id?: string
  tax_rate?: number
  image_url?: string
}

export interface CreateSupplierInput {
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  tax_id?: string
  payment_terms?: string
  notes?: string
}

export interface CreatePurchaseOrderInput {
  supplier_id?: string
  po_number: string
  order_date?: string
  expected_delivery_date?: string
  notes?: string
  shipping_address?: string
  items: Array<{
    inventory_item_id?: string
    item_name: string
    description?: string
    quantity: number
    unit_cost: number
  }>
}

export interface InventoryStats {
  total_items: number
  total_value: number
  low_stock_count: number
  out_of_stock_count: number
  total_products: number
  total_services: number
}

export interface InventoryFilters {
  search?: string
  category?: string
  item_type?: ItemType
  is_low_stock?: boolean
  is_active?: boolean
}
