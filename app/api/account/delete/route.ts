import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { checkRateLimit, logAudit, getClientIp } from '@/lib/utils/security'

export async function POST(request: NextRequest) {
  try {
    const { userId, confirmText, reason } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (confirmText !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Please type DELETE MY ACCOUNT to confirm' },
        { status: 400 }
      )
    }

    // Authenticate the request server-side
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey!, {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
      },
    } as any)

    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the authenticated user matches the requested userId (prevent IDOR)
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Rate limit: max 1 deletion attempt per hour per user
    const rateCheck = await checkRateLimit(`account-delete:${userId}`, 'delete_account', 1, 60)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': '3600' } }
      )
    }

    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    // Delete user data in order (due to foreign key constraints)
    const { data: quotes } = await supabaseAdmin.from('quotes').select('id').eq('user_id', userId)
    if (quotes && quotes.length > 0) {
      const quoteIds = quotes.map((q) => q.id)
      await supabaseAdmin.from('quote_items').delete().in('quote_id', quoteIds)
    }

    await supabaseAdmin.from('quotes').delete().eq('user_id', userId)
    await supabaseAdmin.from('customers').delete().eq('user_id', userId)
    await supabaseAdmin.from('profiles').delete().eq('id', userId)

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteError) throw deleteError

    await logAudit(userId, 'account_deleted', 'user', userId, { reason }, getClientIp(request))

    return NextResponse.json({ success: true, message: 'Account deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
