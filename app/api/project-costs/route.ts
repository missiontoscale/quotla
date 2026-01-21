import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { CreateProjectCostInput } from '@/types/profitability'

// GET - Fetch all project costs for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    } as any)

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const quote_id = searchParams.get('quote_id')
    const invoice_id = searchParams.get('invoice_id')
    const client_id = searchParams.get('client_id')
    const cost_type = searchParams.get('cost_type')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('project_costs')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (quote_id) {
      query = query.eq('quote_id', quote_id)
    }
    if (invoice_id) {
      query = query.eq('invoice_id', invoice_id)
    }
    if (client_id) {
      query = query.eq('client_id', client_id)
    }
    if (cost_type) {
      query = query.eq('cost_type', cost_type)
    }

    const { data: costs, error } = await query

    if (error) {
      console.error('Error fetching project costs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(costs)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new project cost
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    } as any)

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateProjectCostInput = await request.json()

    // Validate required fields
    if (!body.description || !body.cost_type || body.amount === undefined) {
      return NextResponse.json(
        { error: 'Description, cost_type, and amount are required' },
        { status: 400 }
      )
    }

    // Create project cost
    const { data: cost, error } = await supabase
      .from('project_costs')
      .insert({
        user_id: session.user.id,
        description: body.description,
        cost_type: body.cost_type,
        amount: body.amount,
        quote_id: body.quote_id || null,
        invoice_id: body.invoice_id || null,
        client_id: body.client_id || null,
        currency: body.currency || 'NGN',
        date: body.date || new Date().toISOString().split('T')[0],
        is_reimbursable: body.is_reimbursable ?? false,
        notes: body.notes || null,
        receipt_url: body.receipt_url || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project cost:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(cost, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
