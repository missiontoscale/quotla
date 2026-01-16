import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
/** @deprecated Use Customer instead */
export type Client = Customer
export type Quote = Database['public']['Tables']['quotes']['Row']
export type QuoteItem = Database['public']['Tables']['quote_items']['Row']
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type BlogComment = Database['public']['Tables']['blog_comments']['Row']
export type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row']

export interface QuoteWithItems extends Quote {
  items: QuoteItem[]
  customer?: Customer | null
  /** @deprecated Use customer instead */
  client?: Customer | null
}


export interface LineItem {
  id?: string
  name?: string // Product/Service name
  description: string
  quantity: number
  unit_price: number
  amount: number
  sort_order?: number
  inventory_item_id?: string  // Link to inventory item
  stock_status?: 'In stock' | 'Low stock' | 'Out of stock' | 'Not tracked' | 'No inventory link'
  available_quantity?: number // Available stock for this item
}

export interface User {
  id: string
  email: string
  profile?: Profile
}

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  // African Currencies
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc' },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' },
  { code: 'BWP', symbol: 'P', name: 'Botswana Pula' },
]

export const QUOTE_STATUSES = ['draft', 'sent', 'approved', 'rejected', 'expired'] as const

// Shopping List Types
export interface ShoppingListItem {
  id: string
  user_id: string
  inventory_item_id: string
  quantity_needed: number
  notes?: string | null
  is_purchased: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  updated_at: string
  purchased_at?: string | null
  inventory_items?: {
    id: string
    name: string
    sku?: string | null
    unit_price: number
    cost_price: number
    quantity_on_hand: number
    item_type: 'product' | 'service'
    low_stock_threshold: number
    track_inventory: boolean
  }
}

export const SHOPPING_LIST_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
