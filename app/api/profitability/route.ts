import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch profitability data for all projects
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const client_id = searchParams.get('client_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query for profitability view
    let query = supabase
      .from('project_profitability')
      .select('*')
      .eq('user_id', session.user.id)
      .order('quote_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (client_id) {
      query = query.eq('client_id', client_id)
    }

    const { data: profitability, error } = await query

    if (error) {
      console.error('Error fetching profitability data:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate summary statistics
    const summary = {
      total_revenue: profitability?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0,
      total_costs: profitability?.reduce((sum, p) => sum + (p.total_costs || 0), 0) || 0,
      total_profit: profitability?.reduce((sum, p) => sum + (p.profit || 0), 0) || 0,
      average_profit_margin:
        profitability && profitability.length > 0
          ? profitability.reduce((sum, p) => sum + p.profit_margin_percentage, 0) / profitability.length
          : 0,
      projects_count: profitability?.length || 0,
      profitable_projects: profitability?.filter((p) => p.profit > 0).length || 0,
      unprofitable_projects: profitability?.filter((p) => p.profit < 0).length || 0,
    }

    return NextResponse.json({
      profitability,
      summary,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
