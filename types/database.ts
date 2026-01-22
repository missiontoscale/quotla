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
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'low_stock' | 'invoice_paid' | 'invoice_overdue' | 'new_order' | 'payment_received' | 'quote_accepted' | 'quote_rejected' | 'system'
          title: string
          message: string
          priority: 'low' | 'medium' | 'high' | 'urgent'
          is_read: boolean
          read_at: string | null
          action_url: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'low_stock' | 'invoice_paid' | 'invoice_overdue' | 'new_order' | 'payment_received' | 'quote_accepted' | 'quote_rejected' | 'system'
          title: string
          message: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          is_read?: boolean
          read_at?: string | null
          action_url?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'low_stock' | 'invoice_paid' | 'invoice_overdue' | 'new_order' | 'payment_received' | 'quote_accepted' | 'quote_rejected' | 'system'
          title?: string
          message?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          is_read?: boolean
          read_at?: string | null
          action_url?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          description: string
          amount: number
          currency: string
          category: string
          expense_date: string
          payment_method: string | null
          is_tax_deductible: boolean
          is_recurring: boolean
          recurring_frequency: 'monthly' | 'quarterly' | 'yearly' | null
          vendor_name: string | null
          supplier_id: string | null
          invoice_id: string | null
          receipt_url: string | null
          notes: string | null
          tags: Json
          status: 'pending' | 'approved' | 'reimbursed' | 'rejected'
          import_batch_id: string | null
          bank_transaction_id: string | null
          bank_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          amount: number
          currency?: string
          category: string
          expense_date: string
          payment_method?: string | null
          is_tax_deductible?: boolean
          is_recurring?: boolean
          recurring_frequency?: 'monthly' | 'quarterly' | 'yearly' | null
          vendor_name?: string | null
          supplier_id?: string | null
          invoice_id?: string | null
          receipt_url?: string | null
          notes?: string | null
          tags?: Json
          status?: 'pending' | 'approved' | 'reimbursed' | 'rejected'
          import_batch_id?: string | null
          bank_transaction_id?: string | null
          bank_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          amount?: number
          currency?: string
          category?: string
          expense_date?: string
          payment_method?: string | null
          is_tax_deductible?: boolean
          is_recurring?: boolean
          recurring_frequency?: 'monthly' | 'quarterly' | 'yearly' | null
          vendor_name?: string | null
          supplier_id?: string | null
          invoice_id?: string | null
          receipt_url?: string | null
          notes?: string | null
          tags?: Json
          status?: 'pending' | 'approved' | 'reimbursed' | 'rejected'
          import_batch_id?: string | null
          bank_transaction_id?: string | null
          bank_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bank_statement_imports: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_type: 'csv' | 'pdf' | 'xlsx' | 'xls'
          file_url: string | null
          file_size: number | null
          bank_name: string | null
          account_number: string | null
          statement_period_start: string | null
          statement_period_end: string | null
          total_transactions: number
          imported_expenses: number
          imported_income: number
          skipped_transactions: number
          status: 'processing' | 'completed' | 'failed' | 'undone'
          error_message: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_type: 'csv' | 'pdf' | 'xlsx' | 'xls'
          file_url?: string | null
          file_size?: number | null
          bank_name?: string | null
          account_number?: string | null
          statement_period_start?: string | null
          statement_period_end?: string | null
          total_transactions?: number
          imported_expenses?: number
          imported_income?: number
          skipped_transactions?: number
          status?: 'processing' | 'completed' | 'failed' | 'undone'
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_type?: 'csv' | 'pdf' | 'xlsx' | 'xls'
          file_url?: string | null
          file_size?: number | null
          bank_name?: string | null
          account_number?: string | null
          statement_period_start?: string | null
          statement_period_end?: string | null
          total_transactions?: number
          imported_expenses?: number
          imported_income?: number
          skipped_transactions?: number
          status?: 'processing' | 'completed' | 'failed' | 'undone'
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
    }
  }
}
