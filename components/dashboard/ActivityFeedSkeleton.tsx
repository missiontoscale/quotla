'use client'

export function ActivityFeedSkeleton() {
  return (
    <div className="p-6 bg-quotla-dark/90 border border-quotla-orange/20 rounded-2xl animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-primary-700 rounded" />
          <div className="h-5 bg-primary-700 rounded w-32" />
        </div>
        <div className="h-8 bg-primary-700 rounded w-24" />
      </div>
      <div className="space-y-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 bg-primary-700 rounded-lg" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-4 bg-primary-700 rounded w-24" />
                <div className="h-4 bg-primary-700 rounded w-12" />
              </div>
              <div className="h-3 bg-primary-700/50 rounded w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
