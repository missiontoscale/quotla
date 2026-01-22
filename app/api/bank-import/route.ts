import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/bank-import
 * List all bank statement imports for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params for pagination
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get import history
    const { data: imports, error: importsError, count } = await supabase
      .from('bank_statement_imports')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (importsError) {
      console.error('Error fetching imports:', importsError)
      return NextResponse.json(
        { error: 'Failed to fetch import history' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      imports: imports || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching import history:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch imports' },
      { status: 500 }
    )
  }
}
