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
  const formattedDate = format(new Date(post.date), 'MMMM d, yyyy')

  const handleClick = (e: React.MouseEvent) => {
    if (post.isExternal && post.externalUrl) {
      e.preventDefault()
      window.open(post.externalUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <article
      className={`card hover:shadow-lg transition-all group ${
        featured ? 'border-l-4 border-l-primary-600' : ''
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1">
          {/* Header with badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {post.isExternal && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                External
              </span>
            )}
            {post.collab && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Collaboration
              </span>
            )}
            {post.platform && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                {post.platform}
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            href={post.isExternal ? '#' : `/blog/${post.slug}`}
            onClick={handleClick}
          >
            <h2 className={`font-bold text-gray-900 group-hover:text-primary-600 mb-3 transition-colors ${
              featured ? 'text-3xl' : 'text-2xl'
            }`}>
              {post.title}
              {post.isExternal && (
                <svg
                  className="inline-block w-5 h-5 ml-2 opacity-50 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              )}
            </h2>
          </Link>

          {/* Date */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {formattedDate}
            </span>
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-700 text-lg leading-relaxed mb-4 line-clamp-3">
              {post.excerpt}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <Link
            href={post.isExternal ? '#' : `/blog/${post.slug}`}
            onClick={handleClick}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors"
          >
            {post.isExternal ? 'Read on ' + (post.platform || 'external site') : 'Read full article'}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  )
}

export default BlogCard
