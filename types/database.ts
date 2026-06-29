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
          subscription_plan: string
          onboarding_completed: boolean
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
          subscription_plan?: string
          onboarding_completed?: boolean
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
          subscription_plan?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
          featured_image_url: string | null
          category: string | null
          tags: string[] | null
          reading_time_minutes: number | null
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
          featured_image_url?: string | null
          category?: string | null
          tags?: string[] | null
          reading_time_minutes?: number | null
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
          featured_image_url?: string | null
          category?: string | null
          tags?: string[] | null
          reading_time_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      }
      stripe_customers: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string
          email: string | null
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id: string
          email?: string | null
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string
          email?: string | null
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [];
      }
      stripe_subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          stripe_price_id: string
          status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'paused' | 'trialing' | 'unpaid'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          canceled_at: string | null
          ended_at: string | null
          trial_start: string | null
          trial_end: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          stripe_price_id: string
          status?: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'paused' | 'trialing' | 'unpaid'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          ended_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          stripe_price_id?: string
          status?: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'paused' | 'trialing' | 'unpaid'
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          ended_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [];
      }
      stripe_payment_intents: {
        Row: {
          id: string
          user_id: string
          stripe_payment_intent_id: string
          amount: number
          currency: string
          status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded' | 'failed'
          invoice_id: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_payment_intent_id: string
          amount: number
          currency?: string
          status?: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded' | 'failed'
          invoice_id?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_payment_intent_id?: string
          amount?: number
          currency?: string
          status?: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded' | 'failed'
          invoice_id?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [];
      }
      stripe_invoices: {
        Row: {
          id: string
          user_id: string
          stripe_invoice_id: string
          stripe_customer_id: string
          stripe_subscription_id: string | null
          amount_due: number
          amount_paid: number
          currency: string
          status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'
          invoice_pdf: string | null
          hosted_invoice_url: string | null
          period_start: string
          period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_invoice_id: string
          stripe_customer_id: string
          stripe_subscription_id?: string | null
          amount_due: number
          amount_paid?: number
          currency?: string
          status?: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'
          invoice_pdf?: string | null
          hosted_invoice_url?: string | null
          period_start: string
          period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_invoice_id?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string | null
          amount_due?: number
          amount_paid?: number
          currency?: string
          status?: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'
          invoice_pdf?: string | null
          hosted_invoice_url?: string | null
          period_start?: string
          period_end?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [];
      }
      cancellation_surveys: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          reason: string
          feedback: string | null
          would_recommend: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          reason: string
          feedback?: string | null
          would_recommend?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          reason?: string
          feedback?: string | null
          would_recommend?: number | null
          created_at?: string
        }
        Relationships: [];
      }
      inventory_items: {
        Row: {
          id: string
          user_id: string
          name: string
          sku: string | null
          description: string | null
          category: string | null
          item_type: string
          unit_price: number
          cost_price: number
          currency: string
          track_inventory: boolean
          quantity_on_hand: number
          low_stock_threshold: number
          reorder_quantity: number | null
          default_supplier_id: string | null
          tax_rate: number | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          sku?: string | null
          description?: string | null
          category?: string | null
          item_type: string
          unit_price: number
          cost_price: number
          currency?: string
          track_inventory?: boolean
          quantity_on_hand?: number
          low_stock_threshold?: number
          reorder_quantity?: number | null
          default_supplier_id?: string | null
          tax_rate?: number | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          sku?: string | null
          description?: string | null
          category?: string | null
          item_type?: string
          unit_price?: number
          cost_price?: number
          currency?: string
          track_inventory?: boolean
          quantity_on_hand?: number
          low_stock_threshold?: number
          reorder_quantity?: number | null
          default_supplier_id?: string | null
          tax_rate?: number | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [];
      }
      stock_movements: {
        Row: {
          id: string
          user_id: string
          inventory_item_id: string
          movement_type: string
          quantity_change: number
          quantity_before: number
          quantity_after: number
          reference_type: string | null
          reference_id: string | null
          unit_value: number | null
          total_value: number | null
          notes: string | null
          performed_by: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          inventory_item_id: string
          movement_type: string
          quantity_change: number
          quantity_before: number
          quantity_after: number
          reference_type?: string | null
          reference_id?: string | null
          unit_value?: number | null
          total_value?: number | null
          notes?: string | null
          performed_by: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          inventory_item_id?: string
          movement_type?: string
          quantity_change?: number
          quantity_before?: number
          quantity_after?: number
          reference_type?: string | null
          reference_id?: string | null
          unit_value?: number | null
          total_value?: number | null
          notes?: string | null
          performed_by?: string
          created_at?: string
        }
        Relationships: [];
      }
      suppliers: {
        Row: {
          id: string
          user_id: string
          name: string
          contact_person: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          tax_id: string | null
          payment_terms: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          tax_id?: string | null
          payment_terms?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          tax_id?: string | null
          payment_terms?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [];
      }
      low_stock_alerts: {
        Row: {
          id: string
          user_id: string
          inventory_item_id: string
          triggered_at: string
          quantity_at_trigger: number
          threshold: number
          is_acknowledged: boolean
          acknowledged_at: string | null
          notification_sent: boolean
          notification_sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          inventory_item_id: string
          triggered_at?: string
          quantity_at_trigger: number
          threshold: number
          is_acknowledged?: boolean
          acknowledged_at?: string | null
          notification_sent?: boolean
          notification_sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          inventory_item_id?: string
          triggered_at?: string
          quantity_at_trigger?: number
          threshold?: number
          is_acknowledged?: boolean
          acknowledged_at?: string | null
          notification_sent?: boolean
          notification_sent_at?: string | null
          created_at?: string
        }
        Relationships: [];
      }
      calendly_connections: {
        Row: {
          id: string
          user_id: string
          access_token: string
          refresh_token: string
          token_expires_at: string
          calendly_user_uri: string
          calendly_email: string
          calendly_organization_uri: string | null
          default_event_type_uri: string | null
          webhook_subscription_uri: string | null
          is_active: boolean
          last_synced_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          access_token: string
          refresh_token: string
          token_expires_at: string
          calendly_user_uri: string
          calendly_email: string
          calendly_organization_uri?: string | null
          default_event_type_uri?: string | null
          webhook_subscription_uri?: string | null
          is_active?: boolean
          last_synced_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          access_token?: string
          refresh_token?: string
          token_expires_at?: string
          calendly_user_uri?: string
          calendly_email?: string
          calendly_organization_uri?: string | null
          default_event_type_uri?: string | null
          webhook_subscription_uri?: string | null
          is_active?: boolean
          last_synced_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [];
      }
      scheduled_meetings: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          quote_id: string | null
          invoice_id: string | null
          calendly_event_uri: string
          calendly_invitee_uri: string
          event_type_name: string
          invitee_email: string
          invitee_name: string
          start_time: string
          end_time: string
          location: string | null
          status: string
          canceled_at: string | null
          canceled_by: string | null
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          quote_id?: string | null
          invoice_id?: string | null
          calendly_event_uri: string
          calendly_invitee_uri: string
          event_type_name: string
          invitee_email: string
          invitee_name: string
          start_time: string
          end_time: string
          location?: string | null
          status?: string
          canceled_at?: string | null
          canceled_by?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          quote_id?: string | null
          invoice_id?: string | null
          calendly_event_uri?: string
          calendly_invitee_uri?: string
          event_type_name?: string
          invitee_email?: string
          invitee_name?: string
          start_time?: string
          end_time?: string
          location?: string | null
          status?: string
          canceled_at?: string | null
          canceled_by?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [];
      }
      stripe_connections: {
        Row: {
          id: string
          user_id: string
          stripe_account_id: string
          stripe_email: string | null
          access_token: string
          refresh_token: string
          token_type: string
          scope: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_account_id: string
          stripe_email?: string | null
          access_token: string
          refresh_token: string
          token_type: string
          scope: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_account_id?: string
          stripe_email?: string | null
          access_token?: string
          refresh_token?: string
          token_type?: string
          scope?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [];
      }
      oauth_states: {
        Row: {
          id: string
          state: string
          user_id: string | null
          provider: string
          created_at: string
        }
        Insert: {
          id?: string
          state: string
          user_id?: string | null
          provider: string
          created_at?: string
        }
        Update: {
          id?: string
          state?: string
          user_id?: string | null
          provider?: string
          created_at?: string
        }
        Relationships: [];
      }
      project_costs: {
        Row: {
          id: string
          user_id: string
          description: string
          cost_type: string
          amount: number
          quote_id: string | null
          invoice_id: string | null
          client_id: string | null
          currency: string
          date: string
          is_reimbursable: boolean
          reimbursed: boolean
          notes: string | null
          receipt_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          cost_type: string
          amount: number
          quote_id?: string | null
          invoice_id?: string | null
          client_id?: string | null
          currency?: string
          date?: string
          is_reimbursable?: boolean
          reimbursed?: boolean
          notes?: string | null
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          cost_type?: string
          amount?: number
          quote_id?: string | null
          invoice_id?: string | null
          client_id?: string | null
          currency?: string
          date?: string
          is_reimbursable?: boolean
          reimbursed?: boolean
          notes?: string | null
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [];
      }
      project_profitability: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          client_name: string | null
          quote_number: string | null
          quoted_amount: number | null
          invoice_id: string | null
          invoice_number: string | null
          invoiced_amount: number | null
          amount_paid: number | null
          invoice_status: string | null
          total_costs: number | null
          labor_costs: number | null
          materials_costs: number | null
          overhead_costs: number | null
          other_costs: number | null
          time_tracking_billable: number | null
          total_hours: number | null
          profit: number | null
          profit_margin_percentage: number | null
          quote_date: string | null
          invoice_date: string | null
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          client_name?: string | null
          quote_number?: string | null
          quoted_amount?: number | null
          invoice_id?: string | null
          invoice_number?: string | null
          invoiced_amount?: number | null
          amount_paid?: number | null
          invoice_status?: string | null
          total_costs?: number | null
          labor_costs?: number | null
          materials_costs?: number | null
          overhead_costs?: number | null
          other_costs?: number | null
          time_tracking_billable?: number | null
          total_hours?: number | null
          profit?: number | null
          profit_margin_percentage?: number | null
          quote_date?: string | null
          invoice_date?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          client_name?: string | null
          quote_number?: string | null
          quoted_amount?: number | null
          invoice_id?: string | null
          invoice_number?: string | null
          invoiced_amount?: number | null
          amount_paid?: number | null
          invoice_status?: string | null
          total_costs?: number | null
          labor_costs?: number | null
          materials_costs?: number | null
          overhead_costs?: number | null
          other_costs?: number | null
          time_tracking_billable?: number | null
          total_hours?: number | null
          profit?: number | null
          profit_margin_percentage?: number | null
          quote_date?: string | null
          invoice_date?: string | null
        }
        Relationships: [];
      }
      time_entries: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          quote_id: string | null
          invoice_id: string | null
          description: string
          start_time: string
          end_time: string | null
          duration_seconds: number
          is_billable: boolean
          hourly_rate: number | null
          billable_amount: number | null
          status: string
          tags: string[] | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          quote_id?: string | null
          invoice_id?: string | null
          description: string
          start_time: string
          end_time?: string | null
          duration_seconds: number
          is_billable?: boolean
          hourly_rate?: number | null
          billable_amount?: number | null
          status?: string
          tags?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          quote_id?: string | null
          invoice_id?: string | null
          description?: string
          start_time?: string
          end_time?: string | null
          duration_seconds?: number
          is_billable?: boolean
          hourly_rate?: number | null
          billable_amount?: number | null
          status?: string
          tags?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [];
      }
    }
    Views: {
    }
    Functions: {
    }
  }
}
