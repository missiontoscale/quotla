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
    <div className="card bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              Active
            </span>
          )}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden text-gray-500 hover:text-gray-700"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="space-y-2">
            <div>
              <label htmlFor="dateFrom" className="block text-xs text-gray-600 mb-1">
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
              <label htmlFor="dateTo" className="block text-xs text-gray-600 mb-1">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source Type
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showInternal}
                onChange={(e) => onFilterChange({ ...filters, showInternal: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Internal Blogs</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showExternal}
                onChange={(e) => onFilterChange({ ...filters, showExternal: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">External Blogs</span>
            </label>
          </div>
        </div>

        {/* Platforms */}
        {availablePlatforms.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platforms
            </label>
            <div className="space-y-2">
              {availablePlatforms.map((platform) => (
                <label key={platform} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.platforms.includes(platform)}
                    onChange={() => handlePlatformToggle(platform)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{platform}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  )
}

export default FilterPanel
