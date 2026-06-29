'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-quotla-light flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-6">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-quotla-dark mb-2">Critical error</h1>
              <p className="text-quotla-dark/60 text-sm">
                A critical error occurred. Please refresh the page.
              </p>
            </div>
            <button
              onClick={reset}
              className="px-4 py-2 bg-quotla-orange text-white rounded-lg hover:bg-secondary-500 transition-colors text-sm font-medium"
            >
              Refresh page
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
