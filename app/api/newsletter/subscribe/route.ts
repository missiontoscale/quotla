import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { validateEmail } from '@/lib/utils/validation'

export async function POST(request: NextRequest) {
  try {
    const { email, name, source } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const { data: existing } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existing) {
      if (existing.subscribed) {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 400 }
        )
      }

      const { error: updateError } = await supabaseAdmin
        .from('newsletter_subscribers')
        .update({ subscribed: true })
        .eq('email', email.toLowerCase())

      if (updateError) throw updateError
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('newsletter_subscribers')
        .insert({
          email: email.toLowerCase(),
          name: name || null,
          source: source || null,
        })

      if (insertError) throw insertError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
