'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface CancellationSurveyProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<boolean>
  subscriptionId: string
  userId: string
}

const CANCELLATION_REASONS = [
  { id: 'too_expensive', label: 'Too expensive' },
  { id: 'not_using', label: "Not using it enough" },
  { id: 'missing_features', label: 'Missing features I need' },
  { id: 'found_alternative', label: 'Found an alternative' },
  { id: 'technical_issues', label: 'Technical issues' },
  { id: 'temporary', label: 'Just need a break' },
  { id: 'other', label: 'Other reason' },
] as const

export function CancellationSurvey({
  isOpen,
  onClose,
  onConfirm,
  subscriptionId,
  userId,
}: CancellationSurveyProps) {
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [feedback, setFeedback] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<'reason' | 'feedback' | 'confirm'>('reason')

  if (!isOpen) return null

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Save survey response
      await supabase.from('cancellation_surveys').insert({
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        reason: selectedReason,
        feedback: feedback || null,
        would_recommend: wouldRecommend,
      })

      // Proceed with cancellation
      const success = await onConfirm()
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error('Failed to submit survey:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    if (step === 'reason') return !!selectedReason
    if (step === 'feedback') return true
    return true
  }

  const handleNext = () => {
    if (step === 'reason') setStep('feedback')
    else if (step === 'feedback') setStep('confirm')
    else handleSubmit()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-lg bg-white shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">We're sad to see you go</h2>
          <p className="mt-1 text-sm text-gray-600">
            Before you cancel, would you mind telling us why?
          </p>

          {/* Progress indicator */}
          <div className="mt-4 flex gap-1">
            {['reason', 'feedback', 'confirm'].map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${
                  ['reason', 'feedback', 'confirm'].indexOf(step) >= i
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="mt-6">
            {step === 'reason' && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Why are you canceling?</p>
                {CANCELLATION_REASONS.map((reason) => (
                  <label
                    key={reason.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      selectedReason === reason.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.id}
                      checked={selectedReason === reason.id}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{reason.label}</span>
                  </label>
                ))}
              </div>
            )}

            {step === 'feedback' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    What could we have done better?
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Your feedback helps us improve..."
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    How likely are you to recommend us? (0-10)
                  </p>
                  <div className="mt-2 flex gap-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => setWouldRecommend(num)}
                        className={`h-8 w-8 rounded text-sm font-medium transition-colors ${
                          wouldRecommend === num
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 'confirm' && (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Confirm Cancellation</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Your subscription will remain active until the end of your current billing period.
                  You can reactivate anytime before then.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            {step !== 'reason' && (
              <button
                onClick={() => setStep(step === 'confirm' ? 'feedback' : 'reason')}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                step === 'confirm'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : step === 'confirm' ? (
                'Confirm Cancellation'
              ) : (
                'Continue'
              )}
            </button>
          </div>

          {step === 'reason' && (
            <button
              onClick={onClose}
              className="mt-3 w-full text-center text-sm text-gray-500 hover:text-gray-700"
            >
              Never mind, I'll stay
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
