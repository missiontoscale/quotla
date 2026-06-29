'use client'

export function QuickStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 bg-primary-700/30 border border-primary-600/50 rounded-lg animate-pulse"
        >
          <div className="w-9 h-9 bg-primary-600/50 rounded-lg" />
          <div className="flex-1">
            <div className="h-3 w-12 bg-primary-600/50 rounded mb-2" />
            <div className="h-4 w-16 bg-primary-600/50 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}