import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { checkRateLimit } from '@/lib/utils/security'

export async function POST(request: NextRequest) {
  try {
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

    const rateCheck = await checkRateLimit(`storage-setup:${session.user.id}`, 'storage_setup', 3, 60)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429 }
      )
    }

    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    if (listError) throw listError

    const bucketExists = buckets?.some((bucket) => bucket.name === 'business-assets')

    if (!bucketExists) {
      const { error: createError } = await supabaseAdmin.storage.createBucket('business-assets', {
        public: true,
        fileSizeLimit: 2097152,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      })

      if (createError) throw createError

      return NextResponse.json({
        success: true,
        message: 'Storage bucket created successfully. Please configure upload policies in the Supabase dashboard.',
        created: true,
        needsPolicies: true,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Storage bucket already exists',
      created: false,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
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

    const rateCheck = await checkRateLimit(`storage-setup:${session.user.id}`, 'storage_setup', 10, 60)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429 }
      )
    }

    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    if (listError) throw listError

    const bucket = buckets?.find((b) => b.name === 'business-assets')

    return NextResponse.json({
      exists: !!bucket,
      bucket: bucket || null,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
