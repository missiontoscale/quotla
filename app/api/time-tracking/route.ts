import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { CreateTimeEntryInput } from '@/types/time-tracking'

// GET - Fetch all time entries for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const client_id = searchParams.get('client_id')
    const quote_id = searchParams.get('quote_id')
    const invoice_id = searchParams.get('invoice_id')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('time_entries')
      .select(`
        *,
        client:clients(id, name),
        quote:quotes(id, quote_number),
        invoice:invoices(id, invoice_number)
      `)
      .eq('user_id', session.user.id)
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (client_id) {
      query = query.eq('client_id', client_id)
    }
    if (quote_id) {
      query = query.eq('quote_id', quote_id)
    }
    if (invoice_id) {
      query = query.eq('invoice_id', invoice_id)
    }

    const { data: timeEntries, error } = await query

    if (error) {
      console.error('Error fetching time entries:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get summary statistics
    const { data: summary } = await supabase
      .from('time_entries')
      .select('status, duration_seconds, billable_amount')
      .eq('user_id', session.user.id)

    const stats = {
      total_entries: summary?.length || 0,
      total_duration_seconds: summary?.reduce((sum, entry) => sum + (entry.duration_seconds || 0), 0) || 0,
      total_billable_amount: summary?.reduce((sum, entry) => sum + (entry.billable_amount || 0), 0) || 0,
      running_entries: summary?.filter((e) => e.status === 'running').length || 0,
      stopped_entries: summary?.filter((e) => e.status === 'stopped').length || 0,
      billed_entries: summary?.filter((e) => e.status === 'billed').length || 0,
    }

    return NextResponse.json({
      time_entries: timeEntries,
      summary: stats,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new time entry (start tracking)
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateTimeEntryInput = await request.json()

    // Validate required fields
    if (!body.description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    // Create time entry
    const { data: timeEntry, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: session.user.id,
        description: body.description,
        client_id: body.client_id || null,
        quote_id: body.quote_id || null,
        invoice_id: body.invoice_id || null,
        is_billable: body.is_billable ?? true,
        hourly_rate: body.hourly_rate || null,
        tags: body.tags || [],
        notes: body.notes || null,
        start_time: new Date().toISOString(),
        status: 'running',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating time entry:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(timeEntry, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
