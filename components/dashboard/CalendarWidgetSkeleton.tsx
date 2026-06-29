'use client'

export function CalendarWidgetSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg">
          <div className="w-8 h-8 bg-primary-700 rounded-lg" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="h-3.5 bg-primary-700 rounded w-20" />
              <div className="h-3 bg-primary-700 rounded w-12" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 bg-primary-700/50 rounded w-28" />
              <div className="h-3 bg-primary-700/50 rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
