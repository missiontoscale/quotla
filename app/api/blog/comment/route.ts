import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp, sanitizeHtml } from '@/lib/utils/security'
import { validateEmail } from '@/lib/utils/validation'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { post_id, author_name, author_email, content } = await request.json()

    // Check if user is authenticated
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const { data: { session } } = await supabase.auth.getSession()
    const isAuthenticated = !!session

    if (!post_id || !author_name || !author_email || !content) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!validateEmail(author_email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const ip = getClientIp(request)
    const rateLimit = await checkRateLimit(`comment:${ip}`, 'blog_comment', 5, 60)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many comments. Please try again later.' },
        { status: 429 }
      )
    }

    const sanitizedContent = sanitizeHtml(content)

    // Auto-approve comments from authenticated users
    const commentData: any = {
      post_id,
      author_name: author_name.trim(),
      author_email: author_email.trim().toLowerCase(),
      content: sanitizedContent,
      approved: isAuthenticated, // Auto-approve if authenticated
    }

    // Add user_id if authenticated
    if (isAuthenticated && session?.user?.id) {
      commentData.user_id = session.user.id
    }

    const { error } = await supabaseAdmin.from('blog_comments').insert(commentData)

    if (error) throw error

    return NextResponse.json({
      success: true,
      approved: isAuthenticated
    })
  } catch (error) {
    console.error('Comment submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit comment' },
      { status: 500 }
    )
  }
}
