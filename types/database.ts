export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          company_name: string | null
          business_number: string | null
          tax_id: string | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          phone: string | null
          website: string | null
          logo_url: string | null
          avatar_url: string | null
          default_currency: string
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          company_name?: string | null
          business_number?: string | null
          tax_id?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          phone?: string | null
          website?: string | null
          logo_url?: string | null
          avatar_url?: string | null
          default_currency?: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          company_name?: string | null
          business_number?: string | null
          tax_id?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          phone?: string | null
          website?: string | null
          logo_url?: string | null
          avatar_url?: string | null
          default_currency?: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          user_id: string
          full_name: string
          contact_person: string | null
          email: string | null
          phone: string | null
          company_name: string | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          is_active: boolean
          outstanding_balance: number
          preferred_currency: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          company_name?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          is_active?: boolean
          outstanding_balance?: number
          preferred_currency?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          company_name?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          is_active?: boolean
          outstanding_balance?: number
          preferred_currency?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          quote_number: string
          title: string | null
          status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
          issue_date: string
          valid_until: string | null
          currency: string
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          notes: string | null
          terms: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          quote_number: string
          title?: string | null
          status?: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
          issue_date: string
          valid_until?: string | null
          currency?: string
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          notes?: string | null
          terms?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          quote_number?: string
          title?: string | null
          status?: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
          issue_date?: string
          valid_until?: string | null
          currency?: string
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          notes?: string | null
          terms?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quote_items: {
        Row: {
          id: string
          quote_id: string
          description: string
          quantity: number
          unit_price: number
          amount: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          quote_id: string
          description: string
          quantity?: number
          unit_price: number
          amount: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          quote_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          amount?: number
          sort_order?: number
          created_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          author_id: string | null
          published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          author_id?: string | null
          published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          author_id?: string | null
          published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      blog_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string | null
          author_name: string
          author_email: string
          content: string
          approved: boolean
          approved_by: string | null
          approved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id?: string | null
          author_name: string
          author_email: string
          content: string
          approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string | null
          author_name?: string
          author_email?: string
          content?: string
          approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          name: string | null
          source: string | null
          subscribed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          source?: string | null
          subscribed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          source?: string | null
          subscribed?: boolean
          created_at?: string
        }
      }
      rate_limits: {
        Row: {
          id: string
          identifier: string
          action: string
          count: number
          window_start: string
          created_at: string
        }
        Insert: {
          id?: string
          identifier: string
          action: string
          count?: number
          window_start?: string
          created_at?: string
        }
        Update: {
          id?: string
          identifier?: string
          action?: string
          count?: number
          window_start?: string
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          details: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          quote_id: string | null
          invoice_number: string
          title: string | null
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          issue_date: string
          due_date: string | null
          currency: string
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          notes: string | null
          payment_terms: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          quote_id?: string | null
          invoice_number: string
          title?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          issue_date: string
          due_date?: string | null
          currency?: string
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          notes?: string | null
          payment_terms?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          quote_id?: string | null
          invoice_number?: string
          title?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          issue_date?: string
          due_date?: string | null
          currency?: string
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          notes?: string | null
          payment_terms?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          amount: number
          sort_order: number
          inventory_item_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity?: number
          unit_price: number
          amount: number
          sort_order?: number
          inventory_item_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          amount?: number
          sort_order?: number
          inventory_item_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
