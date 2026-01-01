import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from auth token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get unacknowledged low stock alerts for this user
    const { data: alerts, error } = await supabase
      .from('low_stock_alerts')
      .select(`
        *,
        inventory_item:inventory_items(*)
      `)
      .eq('user_id', user.id)
      .eq('is_acknowledged', false)
      .order('triggered_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ alerts: alerts || [] })
  } catch (error) {
    console.error('Error fetching low stock alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from auth token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { alertId, action } = await request.json()

    if (action === 'acknowledge') {
      // Mark alert as acknowledged
      const { error } = await supabase
        .from('low_stock_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId)
        .eq('user_id', user.id)

      if (error) throw error

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}
