'use client'

import { FC } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { HybridBlogEntry } from '@/types/blog'

interface BlogCardProps {
  post: HybridBlogEntry
  featured?: boolean
}

const BlogCard: FC<BlogCardProps> = ({ post, featured = false }) => {
  const formattedDate = post.date
    ? format(new Date(post.date), 'MMMM d, yyyy')
    : 'No date'

  const handleClick = (e: React.MouseEvent) => {
    if (post.isExternal && post.externalUrl) {
      e.preventDefault()
      window.open(post.externalUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <article
      className={`bg-[#FAF9F6] dark:bg-primary-900 border-l-4 ${
        featured ? 'border-l-quotla-orange' : 'border-l-primary-500'
      } hover:border-l-quotla-orange transition-colors duration-200 shadow-sm hover:shadow-md`}
    >
      <div className="p-8">
        <div className="flex flex-col space-y-4">
          {/* Meta information */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <time dateTime={post.date}>{formattedDate}</time>
            {post.isExternal && (
              <span className="text-gray-600 dark:text-gray-400">External</span>
            )}
            {post.collab && (
              <span className="text-gray-600 dark:text-gray-400">Collaboration</span>
            )}
            {post.platform && (
              <span className="text-gray-600 dark:text-gray-400">{post.platform}</span>
            )}
          </div>

          {/* Title */}
          <Link
            href={post.isExternal ? '#' : `/blog/${post.slug}`}
            onClick={handleClick}
            className="block"
          >
            <h2 className={`font-semibold text-quotla-dark dark:text-quotla-light hover:text-quotla-orange dark:hover:text-quotla-orange transition-colors ${
              featured ? 'text-2xl' : 'text-xl'
            }`}>
              {post.title}
            </h2>
          </Link>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-quotla-orange dark:hover:text-quotla-orange transition-colors"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Read more link */}
          <div className="pt-2">
            <Link
              href={post.isExternal ? '#' : `/blog/${post.slug}`}
              onClick={handleClick}
              className="text-sm text-quotla-orange hover:text-orange-600 dark:text-quotla-orange dark:hover:text-orange-500 font-medium transition-colors"
            >
              {post.isExternal ? 'Read on ' + (post.platform || 'external site') : 'Read article'} →
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export default BlogCard
