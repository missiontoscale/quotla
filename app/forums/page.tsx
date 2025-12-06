'use client'

import { useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

export const dynamic = 'force-dynamic'

export default function ForumsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'features', name: 'Features & Requests', icon: '💡' },
    { id: 'tips', name: 'Tips & Best Practices', icon: '⭐' },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: '🔧' },
    { id: 'showcase', name: 'Showcase', icon: '🎨' },
  ]

  const topics = [
    {
      id: 1,
      title: 'How to get started with AI quote generation',
      category: 'getting-started',
      author: 'Quotla Team',
      replies: 45,
      views: 1230,
      lastActivity: '2 hours ago',
      isPinned: true
    },
    {
      id: 2,
      title: 'Best practices for pricing your services',
      category: 'tips',
      author: 'Sarah M.',
      replies: 23,
      views: 567,
      lastActivity: '5 hours ago',
      isPinned: false
    },
    {
      id: 3,
      title: 'Feature Request: Multiple business profiles',
      category: 'features',
      author: 'John D.',
      replies: 12,
      views: 234,
      lastActivity: '1 day ago',
      isPinned: false
    },
    {
      id: 4,
      title: 'How I increased my quote acceptance rate by 40%',
      category: 'showcase',
      author: 'Mike T.',
      replies: 34,
      views: 892,
      lastActivity: '2 days ago',
      isPinned: false
    },
    {
      id: 5,
      title: 'Invoice not generating - Help needed',
      category: 'troubleshooting',
      author: 'Lisa K.',
      replies: 8,
      views: 156,
      lastActivity: '3 days ago',
      isPinned: false
    },
  ]

  const filteredTopics = selectedCategory === 'all'
    ? topics
    : topics.filter(t => t.category === selectedCategory)

  return (
    <DashboardLayout>
      <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Community Forums</h1>
        <p className="mt-2 text-gray-600">Connect with other Quotla users, share tips, and get help</p>
      </div>

      {/* Coming Soon Banner */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Forums Coming Soon!</h3>
            <p className="text-gray-700">
              We're building a vibrant community space where you can connect with other Quotla users, share best practices, and get expert advice. Stay tuned!
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Forum Stats</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Topics</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span>Posts</span>
                  <span className="font-medium">5,678</span>
                </div>
                <div className="flex justify-between">
                  <span>Members</span>
                  <span className="font-medium">890</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Topics List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Create New Topic Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedCategory === 'all' ? 'All Topics' : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <button className="btn btn-primary" disabled>
              New Topic
            </button>
          </div>

          {/* Topics */}
          <div className="space-y-3">
            {filteredTopics.map((topic) => (
              <div key={topic.id} className="card hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors flex-1">
                        {topic.title}
                      </h3>
                      {topic.isPinned && (
                        <span className="flex-shrink-0 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                          Pinned
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {topic.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {topic.replies} replies
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {topic.views} views
                      </span>
                      <span className="ml-auto text-gray-500">
                        {topic.lastActivity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTopics.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-gray-500">No topics found in this category yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Join Community CTA */}
      <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-3">Want to be notified when forums launch?</h3>
          <p className="text-primary-100 mb-6">
            Be the first to know when we open our community forums. Get access to exclusive tips, connect with successful business owners, and shape the future of Quotla.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="px-6 py-3 rounded-lg bg-white text-primary-600 font-semibold hover:bg-gray-100 transition-colors">
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}
