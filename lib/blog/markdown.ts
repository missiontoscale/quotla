import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  category?: string
  tags?: string[]
  author?: string
  date: string
  readingTime?: number
  published: boolean
  featured?: boolean
  image?: string
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

/**
 * Get all blog posts from markdown files
 */
export function getAllPosts(): BlogPost[] {
  // Check if blog directory exists
  if (!fs.existsSync(BLOG_DIR)) {
    return []
  }

  const files = fs.readdirSync(BLOG_DIR)
  const posts = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(BLOG_DIR, file)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)

      return {
        slug: data.slug || file.replace('.md', ''),
        title: data.title,
        excerpt: data.excerpt,
        content: content,
        category: data.category,
        tags: data.tags || [],
        author: data.author || 'Quotla Team',
        date: data.date,
        readingTime: data.readingTime || estimateReadingTime(content),
        published: data.published ?? true,
        featured: data.featured ?? false,
        image: data.image,
      } as BlogPost
    })
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return posts
}

/**
 * Get a single blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts()
  return posts.find((post) => post.slug === slug) || null
}

/**
 * Get featured blog posts
 */
export function getFeaturedPosts(limit = 3): BlogPost[] {
  const posts = getAllPosts()
  return posts.filter((post) => post.featured).slice(0, limit)
}

/**
 * Get posts by category
 */
export function getPostsByCategory(category: string): BlogPost[] {
  const posts = getAllPosts()
  return posts.filter((post) => post.category === category)
}

/**
 * Get posts by tag
 */
export function getPostsByTag(tag: string): BlogPost[] {
  const posts = getAllPosts()
  return posts.filter((post) => post.tags?.includes(tag))
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  const posts = getAllPosts()
  const categories = posts
    .map((post) => post.category)
    .filter((cat): cat is string => !!cat)
  return Array.from(new Set(categories))
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const posts = getAllPosts()
  const tags = posts.flatMap((post) => post.tags || [])
  return Array.from(new Set(tags))
}

/**
 * Estimate reading time based on content
 */
function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

/**
 * Search posts by query
 */
export function searchPosts(query: string): BlogPost[] {
  const posts = getAllPosts()
  const lowerQuery = query.toLowerCase()

  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.excerpt.toLowerCase().includes(lowerQuery) ||
      post.content.toLowerCase().includes(lowerQuery) ||
      post.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      post.category?.toLowerCase().includes(lowerQuery)
  )
}
