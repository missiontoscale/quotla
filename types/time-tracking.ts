// Time Tracking Types

export type TimeEntryStatus = 'running' | 'stopped' | 'billed'

export interface TimeEntry {
  id: string
  user_id: string

  // Associations
  client_id?: string | null
  quote_id?: string | null
  invoice_id?: string | null

  // Time tracking details
  description: string
  start_time: string
  end_time?: string | null
  duration_seconds?: number | null

  // Billing information
  is_billable: boolean
  hourly_rate?: number | null
  billable_amount?: number | null

  // Status
  status: TimeEntryStatus

  // Additional metadata
  tags?: string[]
  notes?: string | null

  // Timestamps
  created_at: string
  updated_at: string
}

export interface TimeEntryTemplate {
  id: string
  user_id: string
  name: string
  description?: string | null
  default_hourly_rate?: number | null
  is_billable: boolean
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface CreateTimeEntryInput {
  description: string
  client_id?: string
  quote_id?: string
  invoice_id?: string
  is_billable?: boolean
  hourly_rate?: number
  tags?: string[]
  notes?: string
}

export interface UpdateTimeEntryInput {
  description?: string
  end_time?: string
  is_billable?: boolean
  hourly_rate?: number
  tags?: string[]
  notes?: string
  status?: TimeEntryStatus
}

export interface TimeEntrySummary {
  total_entries: number
  total_duration_seconds: number
  total_billable_amount: number
  running_entries: number
  stopped_entries: number
  billed_entries: number
}

export interface TimeEntryWithRelations extends TimeEntry {
  client?: {
    id: string
    name: string
  } | null
  quote?: {
    id: string
    quote_number: string
  } | null
  invoice?: {
    id: string
    invoice_number: string
  } | null
}
