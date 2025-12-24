'use client'

import { FC, useState } from 'react'
import { BlogFilters } from '@/types/blog'

interface FilterPanelProps {
  filters: BlogFilters
  onFilterChange: (filters: BlogFilters) => void
  availablePlatforms: string[]
}

const FilterPanel: FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  availablePlatforms
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handlePlatformToggle = (platform: string) => {
    const newPlatforms = filters.platforms.includes(platform)
      ? filters.platforms.filter(p => p !== platform)
      : [...filters.platforms, platform]

    onFilterChange({ ...filters, platforms: newPlatforms })
  }

  const handleReset = () => {
    onFilterChange({
      searchQuery: '',
      dateFrom: undefined,
      dateTo: undefined,
      platforms: [],
      showInternal: true,
      showExternal: true
    })
  }

  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    filters.platforms.length > 0 ||
    !filters.showInternal ||
    !filters.showExternal

  return (
    <div className="card bg-[#FAF9F6] dark:bg-primary-900 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-quotla-dark dark:text-quotla-light flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-quotla-orange/10 text-quotla-orange">
              Active
            </span>
          )}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-quotla-dark dark:hover:text-quotla-light"
          aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
        >
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className={`space-y-6 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            Date Range
          </label>
          <div className="space-y-2">
            <div>
              <label htmlFor="dateFrom" className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                From
              </label>
              <input
                type="date"
                id="dateFrom"
                value={filters.dateFrom || ''}
                onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value || undefined })}
                className="input text-sm"
              />
            </div>
            <div>
              <label htmlFor="dateTo" className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                To
              </label>
              <input
                type="date"
                id="dateTo"
                value={filters.dateTo || ''}
                onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value || undefined })}
                className="input text-sm"
              />
            </div>
          </div>
        </div>

        {/* Source Type */}
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            Source Type
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showInternal}
                onChange={(e) => onFilterChange({ ...filters, showInternal: e.target.checked })}
                className="rounded border-gray-300 text-quotla-orange focus:ring-quotla-orange"
              />
              <span className="ml-2 text-sm text-gray-800 dark:text-gray-200">Internal Blogs</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showExternal}
                onChange={(e) => onFilterChange({ ...filters, showExternal: e.target.checked })}
                className="rounded border-gray-300 text-quotla-orange focus:ring-quotla-orange"
              />
              <span className="ml-2 text-sm text-gray-800 dark:text-gray-200">External Blogs</span>
            </label>
          </div>
        </div>

        {/* Platforms */}
        {availablePlatforms.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
              Platforms
            </label>
            <div className="space-y-2">
              {availablePlatforms.map((platform) => (
                <label key={platform} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.platforms.includes(platform)}
                    onChange={() => handlePlatformToggle(platform)}
                    className="rounded border-gray-300 text-quotla-orange focus:ring-quotla-orange"
                  />
                  <span className="ml-2 text-sm text-gray-800 dark:text-gray-200">{platform}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 text-sm font-medium text-quotla-light bg-quotla-orange hover:bg-orange-600 rounded-lg transition-colors shadow-md shadow-quotla-orange/40 hover:shadow-quotla-orange/60"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  )
}

export default FilterPanel
