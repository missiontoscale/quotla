'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Table, FileJson, ChevronDown, ChevronRight, BookOpen, ExternalLink } from 'lucide-react'
import Link from 'next/link'

type ColumnInfo = {
  name: string
  type: string
  required: boolean
  default?: string
}

type TableSchema = {
  name: string
  description: string
  columns: ColumnInfo[]
}

type ApiRoute = {
  path: string
  methods: string[]
  description: string
  auth: boolean
}

const tables: TableSchema[] = [
  {
    name: 'profiles',
    description: 'User profiles and business settings',
    columns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'email', type: 'text', required: true },
      { name: 'company_name', type: 'text', required: false },
      { name: 'business_number', type: 'text', required: false },
      { name: 'tax_id', type: 'text', required: false },
      { name: 'address', type: 'text', required: false },
      { name: 'city', type: 'text', required: false },
      { name: 'state', type: 'text', required: false },
      { name: 'postal_code', type: 'text', required: false },
      { name: 'country', type: 'text', required: false },
      { name: 'phone', type: 'text', required: false },
      { name: 'website', type: 'text', required: false },
      { name: 'logo_url', type: 'text', required: false },
      { name: 'avatar_url', type: 'text', required: false },
      { name: 'default_currency', type: 'text', required: false, default: "'NGN'" },
      { name: 'is_admin', type: 'boolean', required: false, default: 'false' },
      { name: 'subscription_plan', type: 'text', required: false, default: "'free'" },
      { name: 'onboarding_completed', type: 'boolean', required: false, default: 'false' },
      { name: 'created_at', type: 'timestamptz', required: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', required: false, default: 'now()' },
    ],
  },
  {
    name: 'customers',
    description: 'Customer/client records',
    columns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'user_id', type: 'uuid', required: true },
      { name: 'full_name', type: 'text', required: true },
      { name: 'contact_person', type: 'text', required: false },
      { name: 'email', type: 'text', required: false },
      { name: 'phone', type: 'text', required: false },
      { name: 'company_name', type: 'text', required: false },
      { name: 'address', type: 'text', required: false },
      { name: 'city', type: 'text', required: false },
      { name: 'state', type: 'text', required: false },
      { name: 'postal_code', type: 'text', required: false },
      { name: 'country', type: 'text', required: false },
      { name: 'is_active', type: 'boolean', required: false, default: 'true' },
      { name: 'outstanding_balance', type: 'numeric', required: false, default: '0' },
      { name: 'preferred_currency', type: 'text', required: false, default: "'NGN'" },
      { name: 'notes', type: 'text', required: false },
      { name: 'created_at', type: 'timestamptz', required: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', required: false, default: 'now()' },
    ],
  },
  {
    name: 'invoices',
    description: 'Sales invoices with status tracking',
    columns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'user_id', type: 'uuid', required: true },
      { name: 'client_id', type: 'uuid', required: false },
      { name: 'quote_id', type: 'uuid', required: false },
      { name: 'invoice_number', type: 'text', required: true },
      { name: 'title', type: 'text', required: false },
      { name: 'status', type: 'enum', required: false, default: "'draft'" },
      { name: 'issue_date', type: 'date', required: true },
      { name: 'due_date', type: 'date', required: false },
      { name: 'currency', type: 'text', required: false, default: "'NGN'" },
      { name: 'subtotal', type: 'numeric', required: false, default: '0' },
      { name: 'tax_rate', type: 'numeric', required: false, default: '0' },
      { name: 'tax_amount', type: 'numeric', required: false, default: '0' },
      { name: 'total', type: 'numeric', required: false, default: '0' },
      { name: 'notes', type: 'text', required: false },
      { name: 'payment_terms', type: 'text', required: false },
      { name: 'created_at', type: 'timestamptz', required: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', required: false, default: 'now()' },
    ],
  },
  {
    name: 'invoice_items',
    description: 'Line items attached to invoices',
    columns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'invoice_id', type: 'uuid', required: true },
      { name: 'description', type: 'text', required: true },
      { name: 'quantity', type: 'numeric', required: false, default: '1' },
      { name: 'unit_price', type: 'numeric', required: true },
      { name: 'amount', type: 'numeric', required: true },
      { name: 'sort_order', type: 'int', required: false, default: '0' },
      { name: 'inventory_item_id', type: 'uuid', required: false },
      { name: 'created_at', type: 'timestamptz', required: false, default: 'now()' },
    ],
  },
  {
    name: 'quotes',
    description: 'Customer quotes/estimates',
    columns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'user_id', type: 'uuid', required: true },
      { name: 'client_id', type: 'uuid', required: false },
      { name: 'quote_number', type: 'text', required: true },
      { name: 'title', type: 'text', required: false },
      { name: 'status', type: 'enum', required: false, default: "'draft'" },
      { name: 'issue_date', type: 'date', required: true },
      { name: 'valid_until', type: 'date', required: false },
      { name: 'currency', type: 'text', required: false, default: "'NGN'" },
      { name: 'subtotal', type: 'numeric', required: false, default: '0' },
      { name: 'tax_rate', type: 'numeric', required: false, default: '0' },
      { name: 'tax_amount', type: 'numeric', required: false, default: '0' },
      { name: 'total', type: 'numeric', required: false, default: '0' },
      { name: 'notes', type: 'text', required: false },
      { name: 'terms', type: 'text', required: false },
      { name: 'created_at', type: 'timestamptz', required: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', required: false, default: 'now()' },
    ],
  },
  {
    name: 'quote_items',
    description: 'Line items attached to quotes',
    columns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'quote_id', type: 'uuid', required: true },
      { name: 'description', type: 'text', required: true },
      { name: 'quantity', type: 'numeric', required: false, default: '1' },
      { name: 'unit_price', type: 'numeric', required: true },
      { name: 'amount', type: 'numeric', required: true },
      { name: 'sort_order', type: 'int', required: false, default: '0' },
      { name: 'created_at', type: 'timestamptz', required: false, default: 'now()' },
    ],
  },
  {
    name: 'inventory_items',
    description: 'Products and inventory tracking',
    columns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'user_id', type: 'uuid', required: true },
      { name: 'name', type: 'text', required: true },
      { name: 'sku', type: 'text', required: false },
      { name: 'description', type: 'text', required: false },
      { name: 'category', type: 'text', required: false },
      { name: 'item_type', type: 'text', required: true },
      { name: 'unit_price', type: 'numeric', required: true },
      { name: 'cost_price', type: 'numeric', required: true },
      { name: 'currency', type: 'text', required: false, default: "'NGN'" },
      { name: 'track_inventory', type: 'boolean', required: false, default: 'false' },
      { name: 'quantity_on_hand', type: 'int', required: false, default: '0' },
      { name: 'low_stock_threshold', type: 'int', required: false, default: '10' },
      { name: 'reorder_quantity', type: 'int', required: false },
      { name: 'default_supplier_id', type: 'uuid', required: false },
      { name: 'tax_rate', type: 'numeric', required: false },
      { name: 'image_url', type: 'text', required: false },
      { name: 'is_active', type: 'boolean', required: false, default: 'true' },
      { name: 'created_at', type: 'timestamptz', required: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', required: false, default: 'now()' },
    ],
  },
  {
    name: 'stock_movements',
    description: 'Inventory stock change audit log',
    columns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'user_id', type: 'uuid', required: true },
      { name: 'inventory_item_id', type: 'uuid', required: true },
      { name: 'movement_type', type: 'text', required: true },
      { name: 'quantity_change', type: 'int', required: true },
      { name: 'quantity_before', type: 'int', required: true },
      { name: 'quantity_after', type: 'int', required: true },
      { name: 'reference_type', type: 'text', required: false },
      { name: 'reference_id', type: 'uuid', required: false },
      { name: 'unit_value', type: 'numeric', required: false },
      { name: 'total_value', type: 'numeric', required: false },
      { name: 'notes', type: 'text', required: false },
      { name: 'performed_by', type: 'uuid', required: true },
      { name: 'created_at', type: 'timestamptz', required: false, default: 'now()' },
    ],
  },
  {
    name: 'expenses',
    description: 'Business expense records',
    columns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'user_id', type: 'uuid', required: true },
      { name: 'description', type: 'text', required: true },
      { name: 'amount', type: 'numeric', required: true },
      { name: 'currency', type: 'text', required: false, default: "'NGN'" },
      { name: 'category', type: 'text', required: true },
      { name: 'expense_date', type: 'date', required: true },
      { name: 'payment_method', type: 'text', required: false },
      { name: 'is_tax_deductible', type: 'boolean', required: false, default: 'false' },
      { name: 'is_recurring', type: 'boolean', required: false, default: 'false' },
      { name: 'recurring_frequency', type: 'text', required: false },
      { name: 'vendor_name', type: 'text', required: false },
      { name: 'supplier_id', type: 'uuid', required: false },
      { name: 'invoice_id', type: 'uuid', required: false },
      { name: 'receipt_url', type: 'text', required: false },
      { name: 'notes', type: 'text', required: false },
      { name: 'tags', type: 'jsonb', required: false, default: "'[]'" },
      { name: 'status', type: 'enum', required: false, default: "'pending'" },
      { name: 'created_at', type: 'timestamptz', required: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', required: false, default: 'now()' },
    ],
  },
  {
    name: 'suppliers',
    description: 'Vendor/supplier records',
    columns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'user_id', type: 'uuid', required: true },
      { name: 'name', type: 'text', required: true },
      { name: 'contact_person', type: 'text', required: false },
      { name: 'email', type: 'text', required: false },
      { name: 'phone', type: 'text', required: false },
      { name: 'address', type: 'text', required: false },
      { name: 'city', type: 'text', required: false },
      { name: 'state', type: 'text', required: false },
      { name: 'postal_code', type: 'text', required: false },
      { name: 'country', type: 'text', required: false },
      { name: 'tax_id', type: 'text', required: false },
      { name: 'payment_terms', type: 'text', required: false },
      { name: 'notes', type: 'text', required: false },
      { name: 'is_active', type: 'boolean', required: false, default: 'true' },
      { name: 'created_at', type: 'timestamptz', required: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', required: false, default: 'now()' },
    ],
  },
  {
    name: 'low_stock_alerts',
    description: 'Automated low-stock notifications',
    columns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'user_id', type: 'uuid', required: true },
      { name: 'inventory_item_id', type: 'uuid', required: true },
      { name: 'triggered_at', type: 'timestamptz', required: false, default: 'now()' },
      { name: 'quantity_at_trigger', type: 'int', required: true },
      { name: 'threshold', type: 'int', required: true },
      { name: 'is_acknowledged', type: 'boolean', required: false, default: 'false' },
      { name: 'acknowledged_at', type: 'timestamptz', required: false },
      { name: 'notification_sent', type: 'boolean', required: false, default: 'false' },
      { name: 'created_at', type: 'timestamptz', required: false, default: 'now()' },
    ],
  },
  {
    name: 'notifications',
    description: 'In-app notification records',
    columns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'user_id', type: 'uuid', required: true },
      { name: 'type', type: 'enum', required: true },
      { name: 'title', type: 'text', required: true },
      { name: 'message', type: 'text', required: true },
      { name: 'priority', type: 'enum', required: false, default: "'medium'" },
      { name: 'is_read', type: 'boolean', required: false, default: 'false' },
      { name: 'read_at', type: 'timestamptz', required: false },
      { name: 'action_url', type: 'text', required: false },
      { name: 'metadata', type: 'jsonb', required: false },
      { name: 'created_at', type: 'timestamptz', required: false, default: 'now()' },
    ],
  },
  {
    name: 'project_costs',
    description: 'Project-specific cost tracking',
    columns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'user_id', type: 'uuid', required: true },
      { name: 'description', type: 'text', required: true },
      { name: 'cost_type', type: 'text', required: true },
      { name: 'amount', type: 'numeric', required: true },
      { name: 'quote_id', type: 'uuid', required: false },
      { name: 'invoice_id', type: 'uuid', required: false },
      { name: 'client_id', type: 'uuid', required: false },
      { name: 'currency', type: 'text', required: false, default: "'NGN'" },
      { name: 'date', type: 'date', required: false, default: 'now()' },
      { name: 'is_reimbursable', type: 'boolean', required: false, default: 'false' },
      { name: 'reimbursed', type: 'boolean', required: false, default: 'false' },
      { name: 'notes', type: 'text', required: false },
      { name: 'receipt_url', type: 'text', required: false },
      { name: 'created_at', type: 'timestamptz', required: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', required: false, default: 'now()' },
    ],
  },
  {
    name: 'time_entries',
    description: 'Time tracking records for billable work',
    columns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'user_id', type: 'uuid', required: true },
      { name: 'client_id', type: 'uuid', required: false },
      { name: 'quote_id', type: 'uuid', required: false },
      { name: 'invoice_id', type: 'uuid', required: false },
      { name: 'description', type: 'text', required: true },
      { name: 'start_time', type: 'timestamptz', required: true },
      { name: 'end_time', type: 'timestamptz', required: false },
      { name: 'duration_seconds', type: 'bigint', required: true },
      { name: 'is_billable', type: 'boolean', required: false, default: 'true' },
      { name: 'hourly_rate', type: 'numeric', required: false },
      { name: 'billable_amount', type: 'numeric', required: false },
      { name: 'status', type: 'text', required: false, default: "'running'" },
      { name: 'tags', type: 'text[]', required: false },
      { name: 'notes', type: 'text', required: false },
      { name: 'created_at', type: 'timestamptz', required: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', required: false, default: 'now()' },
    ],
  },
  {
    name: 'project_profitability',
    description: 'Materialized view for project profit analysis',
    columns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'user_id', type: 'uuid', required: true },
      { name: 'client_name', type: 'text', required: false },
      { name: 'quote_number', type: 'text', required: false },
      { name: 'invoice_number', type: 'text', required: false },
      { name: 'invoiced_amount', type: 'numeric', required: false },
      { name: 'amount_paid', type: 'numeric', required: false },
      { name: 'total_costs', type: 'numeric', required: false },
      { name: 'profit', type: 'numeric', required: false },
      { name: 'profit_margin_percentage', type: 'numeric', required: false },
      { name: 'created_at', type: 'timestamptz', required: false, default: 'now()' },
    ],
  },
  {
    name: 'rate_limits',
    description: 'API rate limiting tracking',
    columns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'identifier', type: 'text', required: true },
      { name: 'action', type: 'text', required: true },
      { name: 'count', type: 'int', required: false, default: '0' },
      { name: 'window_start', type: 'timestamptz', required: false, default: 'now()' },
      { name: 'created_at', type: 'timestamptz', required: false, default: 'now()' },
    ],
  },
  {
    name: 'audit_logs',
    description: 'User action audit trail',
    columns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'user_id', type: 'uuid', required: false },
      { name: 'action', type: 'text', required: true },
      { name: 'resource_type', type: 'text', required: false },
      { name: 'resource_id', type: 'uuid', required: false },
      { name: 'details', type: 'jsonb', required: false },
      { name: 'ip_address', type: 'text', required: false },
      { name: 'created_at', type: 'timestamptz', required: false, default: 'now()' },
    ],
  },
]

const apiRoutes: ApiRoute[] = [
  { path: '/api/account/delete', methods: ['POST'], description: 'Delete user account and all associated data', auth: true },
  { path: '/api/currency/convert', methods: ['GET', 'POST'], description: 'Get exchange rates and convert between currencies', auth: false },
  { path: '/api/geolocation', methods: ['GET'], description: 'Detect user country and currency from IP', auth: false },
  { path: '/api/inventory/low-stock-alerts', methods: ['GET', 'POST'], description: 'Fetch and acknowledge low-stock alerts', auth: true },
  { path: '/api/profitability', methods: ['GET'], description: 'Get project profitability analysis with summary metrics', auth: true },
  { path: '/api/project-costs', methods: ['GET', 'POST'], description: 'Manage project cost entries', auth: true },
  { path: '/api/storage/setup', methods: ['GET', 'POST'], description: 'Check and create business-assets storage bucket', auth: true },
  { path: '/api/time-tracking', methods: ['GET', 'POST'], description: 'List time entries and start new tracking session', auth: true },
  { path: '/api/time-tracking/[id]', methods: ['GET', 'PATCH', 'DELETE'], description: 'Get, update, or delete a specific time entry', auth: true },
]

const statusColors: Record<string, string> = {
  draft: 'bg-primary-600/20 text-primary-400',
  sent: 'bg-quotla-orange/20 text-quotla-orange',
  paid: 'bg-quotla-green/20 text-quotla-green',
  overdue: 'bg-rose-500/20 text-rose-400',
  cancelled: 'bg-primary-700/30 text-primary-500',
  approved: 'bg-quotla-green/20 text-quotla-green',
  rejected: 'bg-rose-500/20 text-rose-400',
  expired: 'bg-primary-600/20 text-primary-400',
  pending: 'bg-amber-500/20 text-amber-400',
  reimbursed: 'bg-quotla-green/20 text-quotla-green',
  running: 'bg-blue-500/20 text-blue-400',
  low: 'bg-primary-600/20 text-primary-400',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-quotla-orange/20 text-quotla-orange',
  urgent: 'bg-rose-500/20 text-rose-400',
}

function StatusBadge({ value }: { value: string }) {
  const color = statusColors[value.toLowerCase()] || 'bg-primary-600/20 text-primary-400'
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-medium ${color}`}>{value}</span>
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-quotla-green/20 text-quotla-green',
    POST: 'bg-quotla-orange/20 text-quotla-orange',
    PATCH: 'bg-blue-500/20 text-blue-400',
    PUT: 'bg-blue-500/20 text-blue-400',
    DELETE: 'bg-rose-500/20 text-rose-400',
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-mono font-bold ${colors[method] || 'bg-primary-600/20 text-primary-400'}`}>{method}</span>
}

function TableSchemaCard({ table }: { table: TableSchema }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="overflow-hidden border border-primary-600/30 bg-gradient-to-br from-quotla-dark/95 to-primary-800/40">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-primary-700/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-quotla-orange/15 rounded-lg flex items-center justify-center">
            <Table className="w-4 h-4 text-quotla-orange" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary-50 font-mono">{table.name}</h3>
            <p className="text-xs text-primary-400">{table.description}</p>
          </div>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-primary-400" /> : <ChevronRight className="w-4 h-4 text-primary-400" />}
      </button>

      {expanded && (
        <div className="border-t border-primary-600/30">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-primary-600/20">
                  <th className="text-left py-2 px-4 text-primary-400 font-medium">Column</th>
                  <th className="text-left py-2 px-4 text-primary-400 font-medium">Type</th>
                  <th className="text-center py-2 px-4 text-primary-400 font-medium">Required</th>
                  <th className="text-left py-2 px-4 text-primary-400 font-medium">Default</th>
                </tr>
              </thead>
              <tbody>
                {table.columns.map((col) => (
                  <tr key={col.name} className="border-b border-primary-600/10 last:border-b-0 hover:bg-primary-700/10">
                    <td className="py-2 px-4 text-primary-100 font-mono">{col.name}</td>
                    <td className="py-2 px-4">
                      <code className="text-quotla-orange/80">{col.type}</code>
                    </td>
                    <td className="py-2 px-4 text-center">
                      {col.required ? (
                        <span className="text-rose-400 text-[0.6rem] font-medium">REQUIRED</span>
                      ) : (
                        <span className="text-primary-500 text-[0.6rem]">OPTIONAL</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-primary-500 font-mono">{col.default || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  )
}

export default function ApiDocsPage() {
  const [tableSearch, setTableSearch] = useState('')
  const [routeSearch, setRouteSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'tables' | 'routes'>('tables')

  const filteredTables = tables.filter(
    (t) => t.name.includes(tableSearch.toLowerCase()) || t.description.toLowerCase().includes(tableSearch.toLowerCase())
  )

  const filteredRoutes = apiRoutes.filter(
    (r) => r.path.toLowerCase().includes(routeSearch.toLowerCase()) || r.description.toLowerCase().includes(routeSearch.toLowerCase())
  )

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-primary-50 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-quotla-orange" />
          API Documentation
        </h1>
        <p className="text-sm text-primary-400 mt-1">
          Reference for database tables, API routes, and data types
        </p>
      </div>

      <div className="flex gap-1 p-1 bg-primary-800/50 rounded-lg w-fit border border-primary-600/30">
        <button
          type="button"
          onClick={() => setActiveTab('tables')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'tables'
              ? 'bg-quotla-orange/15 text-quotla-orange'
              : 'text-primary-400 hover:text-primary-100'
          }`}
        >
          <Table className="w-3.5 h-3.5 inline mr-1.5" />
          Database Tables
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'routes'
              ? 'bg-quotla-orange/15 text-quotla-orange'
              : 'text-primary-400 hover:text-primary-100'
          }`}
        >
          <FileJson className="w-3.5 h-3.5 inline mr-1.5" />
          API Routes
        </button>
      </div>

      {activeTab === 'tables' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-400" />
            <Input
              placeholder="Search tables..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-primary-800 border-primary-600 text-primary-50 placeholder:text-primary-400"
            />
          </div>

          <div className="space-y-3">
            {filteredTables.map((table) => (
              <TableSchemaCard key={table.name} table={table} />
            ))}
            {filteredTables.length === 0 && (
              <p className="text-sm text-primary-500 text-center py-8">No tables match your search</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-primary-500 pt-2">
            <span>Total: {tables.length} tables</span>
            <span className="text-primary-600">|</span>
            <span>Supabase (PostgreSQL)</span>
          </div>
        </div>
      )}

      {activeTab === 'routes' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-400" />
            <Input
              placeholder="Search routes..."
              value={routeSearch}
              onChange={(e) => setRouteSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-primary-800 border-primary-600 text-primary-50 placeholder:text-primary-400"
            />
          </div>

          <div className="space-y-2">
            {filteredRoutes.map((route) => (
              <Card key={route.path} className="p-4 border border-primary-600/30 bg-gradient-to-br from-quotla-dark/95 to-primary-800/40">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm text-primary-50 font-mono">{route.path}</code>
                      {route.auth && (
                        <span className="text-[0.6rem] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-medium">AUTH</span>
                      )}
                    </div>
                    <p className="text-xs text-primary-400">{route.description}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {route.methods.map((m) => (
                      <MethodBadge key={m} method={m} />
                    ))}
                  </div>
                </div>
              </Card>
            ))}
            {filteredRoutes.length === 0 && (
              <p className="text-sm text-primary-500 text-center py-8">No routes match your search</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-primary-500 pt-2">
            <span>Total: {apiRoutes.length} routes</span>
            <span className="text-primary-600">|</span>
            <span>Next.js API route handlers</span>
          </div>
        </div>
      )}

      <Card className="p-4 border border-quotla-green/20 bg-quotla-green/5">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-quotla-green/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <ExternalLink className="w-3 h-3 text-quotla-green" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-quotla-green">Data Access Pattern</h3>
            <p className="text-xs text-primary-400 mt-1">
              All authenticated pages use Supabase client-side queries with Row Level Security (RLS).
              API routes use the Supabase service role key for admin operations.
              Database tables are scoped by <code className="text-quotla-orange/80">user_id</code>.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
