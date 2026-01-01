'use client'

import { useState, useEffect } from 'react'
import type { TimeEntry, CreateTimeEntryInput } from '@/types/time-tracking'

interface TimeTrackerProps {
  clientId?: string
  quoteId?: string
  invoiceId?: string
}

export default function TimeTracker({ clientId, quoteId, invoiceId }: TimeTrackerProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [runningEntry, setRunningEntry] = useState<TimeEntry | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [description, setDescription] = useState('')
  const [hourlyRate, setHourlyRate] = useState<number>(50)
  const [isBillable, setIsBillable] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Load time entries
  const loadTimeEntries = async () => {
    try {
      const params = new URLSearchParams({ limit: '10' })
      if (clientId) params.append('client_id', clientId)
      if (quoteId) params.append('quote_id', quoteId)
      if (invoiceId) params.append('invoice_id', invoiceId)

      const response = await fetch(`/api/time-tracking?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTimeEntries(data.time_entries || [])
        const running = data.time_entries?.find((e: TimeEntry) => e.status === 'running')
        setRunningEntry(running || null)
      }
    } catch (error) {
      console.error('Error loading time entries:', error)
    }
  }

  // Start tracking time
  const startTracking = async () => {
    if (!description.trim()) {
      alert('Please enter a description')
      return
    }

    setIsLoading(true)
    try {
      const input: CreateTimeEntryInput = {
        description,
        client_id: clientId,
        quote_id: quoteId,
        invoice_id: invoiceId,
        is_billable: isBillable,
        hourly_rate: isBillable ? hourlyRate : undefined,
      }

      const response = await fetch('/api/time-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (response.ok) {
        const newEntry = await response.json()
        setRunningEntry(newEntry)
        setTimeEntries([newEntry, ...timeEntries])
        setDescription('')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to start tracking')
      }
    } catch (error) {
      console.error('Error starting time tracking:', error)
      alert('Failed to start tracking')
    } finally {
      setIsLoading(false)
    }
  }

  // Stop tracking time
  const stopTracking = async () => {
    if (!runningEntry) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/time-tracking/${runningEntry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          end_time: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        const updatedEntry = await response.json()
        setRunningEntry(null)
        setElapsedTime(0)
        loadTimeEntries()
      } else {
        alert('Failed to stop tracking')
      }
    } catch (error) {
      console.error('Error stopping time tracking:', error)
      alert('Failed to stop tracking')
    } finally {
      setIsLoading(false)
    }
  }

  // Update elapsed time for running entry
  useEffect(() => {
    if (!runningEntry) {
      setElapsedTime(0)
      return
    }

    const startTime = new Date(runningEntry.start_time).getTime()
    const updateElapsed = () => {
      const now = Date.now()
      setElapsedTime(Math.floor((now - startTime) / 1000))
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)

    return () => clearInterval(interval)
  }, [runningEntry])

  // Load entries on mount
  useEffect(() => {
    loadTimeEntries()
  }, [clientId, quoteId, invoiceId])

  return (
    <div className="bg-white dark:bg-primary-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-primary-700">
      <h3 className="text-2xl font-bold text-quotla-dark dark:text-quotla-light mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-quotla-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Time Tracker
      </h3>

      {/* Current Timer */}
      {runningEntry ? (
        <div className="bg-gradient-to-r from-quotla-orange/10 to-quotla-green/10 rounded-lg p-6 mb-6 border-2 border-quotla-orange/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Currently tracking</p>
              <p className="text-lg font-semibold text-quotla-dark dark:text-quotla-light">{runningEntry.description}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-mono font-bold text-quotla-orange">{formatTime(elapsedTime)}</p>
              {runningEntry.is_billable && runningEntry.hourly_rate && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ${((elapsedTime / 3600) * runningEntry.hourly_rate).toFixed(2)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={stopTracking}
            disabled={isLoading}
            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <rect x="6" y="6" width="8" height="8" />
            </svg>
            Stop Timer
          </button>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you working on?"
            className="w-full px-4 py-3 border border-gray-300 dark:border-primary-700 rounded-lg bg-white dark:bg-primary-800 text-quotla-dark dark:text-quotla-light focus:ring-2 focus:ring-quotla-orange focus:border-transparent"
          />

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBillable}
                onChange={(e) => setIsBillable(e.target.checked)}
                className="w-4 h-4 text-quotla-orange focus:ring-quotla-orange border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Billable</span>
            </label>

            {isBillable && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Rate:</span>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
                  className="w-24 px-3 py-1 border border-gray-300 dark:border-primary-700 rounded bg-white dark:bg-primary-800 text-quotla-dark dark:text-quotla-light text-sm"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">/hr</span>
              </div>
            )}
          </div>

          <button
            onClick={startTracking}
            disabled={isLoading || !description.trim()}
            className="w-full py-3 bg-quotla-green hover:bg-quotla-green/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            Start Timer
          </button>
        </div>
      )}

      {/* Recent Entries */}
      {timeEntries.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-quotla-dark dark:text-quotla-light mb-3">Recent Entries</h4>
          <div className="space-y-2">
            {timeEntries.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-primary-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-quotla-dark dark:text-quotla-light">{entry.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(entry.start_time).toLocaleDateString()} - {entry.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold text-quotla-dark dark:text-quotla-light">
                    {entry.duration_seconds ? formatTime(entry.duration_seconds) : '--:--:--'}
                  </p>
                  {entry.billable_amount && (
                    <p className="text-xs text-quotla-green">${entry.billable_amount.toFixed(2)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
