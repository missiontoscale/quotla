'use client'

interface DataTableSkeletonProps {
  columns?: number
  rows?: number
  showSearch?: boolean
  showFilters?: boolean
  showPagination?: boolean
}

export function DataTableSkeleton({
  columns = 6,
  rows = 5,
  showSearch = true,
  showFilters = false,
  showPagination = true,
}: DataTableSkeletonProps) {
  return (
    <div className="space-y-3.5 animate-pulse">
      {/* Search and filters row */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {showSearch && (
            <div className="relative flex-1 max-w-md">
              <div className="h-9 bg-slate-800 border border-slate-700 rounded-md" />
            </div>
          )}
          {showFilters && (
            <div className="flex gap-2">
              <div className="h-9 w-28 bg-slate-800 border border-slate-700 rounded-md" />
              <div className="h-9 w-28 bg-slate-800 border border-slate-700 rounded-md" />
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead>
              <tr className="border-b border-slate-800">
                {[...Array(columns)].map((_, i) => (
                  <th key={i} className="py-3 px-4 text-left">
                    <div className="h-3 w-16 bg-slate-700/50 rounded" />
                  </th>
                ))}
                <th className="py-3 px-4 w-20 max-md:hidden">
                  <div className="h-3 w-8 bg-slate-700/50 rounded ml-auto" />
                </th>
              </tr>
            </thead>
            {/* Body */}
            <tbody>
              {[...Array(rows)].map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-slate-800 last:border-b-0">
                  {[...Array(columns)].map((_, colIndex) => (
                    <td key={colIndex} className="py-3 px-4">
                      <div
                        className="h-4 bg-slate-700/50 rounded"
                        style={{ width: `${60 + Math.random() * 40}%` }}
                      />
                    </td>
                  ))}
                  <td className="py-3 px-4 max-md:hidden">
                    <div className="flex items-center justify-end gap-1">
                      <div className="h-7 w-7 bg-slate-700/50 rounded" />
                      <div className="h-7 w-7 bg-slate-700/50 rounded" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 bg-slate-800 border border-slate-700 rounded-md" />
            <div className="h-4 w-20 bg-slate-700/50 rounded" />
          </div>
          <div className="flex items-center gap-2 justify-center">
            <div className="h-8 w-16 bg-slate-800 border border-slate-700 rounded-md" />
            <div className="hidden sm:flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 w-8 bg-slate-800 border border-slate-700 rounded-md" />
              ))}
            </div>
            <div className="h-8 w-16 bg-slate-800 border border-slate-700 rounded-md" />
          </div>
        </div>
      )}
    </div>
  )
}