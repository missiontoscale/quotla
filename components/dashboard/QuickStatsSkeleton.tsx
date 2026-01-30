'use client'

export function QuickStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg animate-pulse"
        >
          {/* Icon placeholder */}
          <div className="w-9 h-9 bg-slate-700/50 rounded-lg" />
          {/* Text content placeholder */}
          <div className="flex-1">
            <div className="h-3 w-12 bg-slate-700/50 rounded mb-2" />
            <div className="h-4 w-16 bg-slate-700/50 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}