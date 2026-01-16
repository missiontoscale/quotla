import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    // Log the deletion reason for analytics (optional)
    if (reason) {
      console.log(`Account deletion reason for user ${userId}: ${reason}`)
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    // Delete user data in order (due to foreign key constraints)
    // 1. Delete quote items
    const { data: quotes } = await supabaseAdmin.from('quotes').select('id').eq('user_id', userId)
    if (quotes && quotes.length > 0) {
      const quoteIds = quotes.map((q) => q.id)
      await supabaseAdmin.from('quote_items').delete().in('quote_id', quoteIds)
    }

    // 2. Delete quotes
    await supabaseAdmin.from('quotes').delete().eq('user_id', userId)

    // 3. Delete customers
    await supabaseAdmin.from('customers').delete().eq('user_id', userId)

    // 4. Delete blog comments
    await supabaseAdmin.from('blog_comments').delete().eq('user_id', userId)

    // 5. Delete profile
    await supabaseAdmin.from('profiles').delete().eq('id', userId)

    // 6. Delete auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true, message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete account' },
      { status: 500 }
    )
  }
}
