import { NextResponse } from 'next/server'
import { getPostBySlug } from '@/lib/blog/markdown'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params
    const post = getPostBySlug(slug)

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching markdown post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
