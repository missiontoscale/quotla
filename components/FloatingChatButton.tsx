'use client'

import { useState } from 'react'
import QuotlaChat from './QuotlaChat'

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Chat Button - Bottom Right */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-quotla-green to-quotla-orange text-white shadow-xl hover:shadow-2xl transition-all hover:scale-110 flex items-center justify-center group"
          title="Chat with Quotla Agent"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 animate-pulse"></span>
        </button>
      )}

      {/* Chat Modal/Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full sm:w-[480px] lg:w-[520px] h-[90vh] sm:h-[85vh] sm:max-h-[700px] sm:m-4 sm:mr-8 bg-white dark:bg-primary-800 rounded-t-2xl sm:rounded-2xl shadow-2xl border-t border-gray-200 dark:border-primary-700 sm:border animate-slideUp sm:animate-slideInRight overflow-hidden">
            <QuotlaChat onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
