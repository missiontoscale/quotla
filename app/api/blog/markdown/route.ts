import { NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/blog/markdown'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const posts = getAllPosts()
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching markdown posts:', error)
    return NextResponse.json([], { status: 200 }) // Return empty array on error
  }
}
