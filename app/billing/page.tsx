'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'
import {
  CurrentPlanCard,
  UpgradeOptions,
  PaymentMethodCard,
  BillingHistory,
  CancellationSurvey,
} from '@/components/billing'

export default function BillingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const {
    plan,
    subscription,
    invoices,
    paymentMethods,
    loading: subLoading,
    isCanceling,
    daysUntilRenewal,
    createCheckoutSession,
    createPortalSession,
    cancelSubscription,
    reactivateSubscription,
    refresh,
  } = useSubscription()

  const [showCancelSurvey, setShowCancelSurvey] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning'
    message: string
  } | null>(null)

  // Handle success/cancel from Stripe checkout
  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    if (success === 'true') {
      setNotification({
        type: 'success',
        message: 'Your subscription has been activated! Thank you for subscribing.',
      })
      refresh()
      // Clear URL params
      router.replace('/billing')
    } else if (canceled === 'true') {
      setNotification({
        type: 'warning',
        message: 'Checkout was canceled. Your subscription was not changed.',
      })
      router.replace('/billing')
    }
  }, [searchParams, refresh, router])

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleManageBilling = async () => {
    const url = await createPortalSession()
    if (url) {
      window.location.href = url
    } else {
      setNotification({
        type: 'error',
        message: 'Failed to open billing portal. Please try again.',
      })
    }
  }

  const handleCancelClick = () => {
    setShowCancelSurvey(true)
  }

  const handleCancelConfirm = async () => {
    const success = await cancelSubscription()
    if (success) {
      setNotification({
        type: 'success',
        message: 'Your subscription has been canceled. You can still use premium features until the end of your billing period.',
      })
      return true
    } else {
      setNotification({
        type: 'error',
        message: 'Failed to cancel subscription. Please try again or contact support.',
      })
      return false
    }
  }

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    router.push('/auth/signin?redirect=/billing')
    return null
  }

  const isLoading = authLoading || subLoading

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/business/dashboard"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Billing & Subscription</h1>
          <div className="w-32" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`border-b px-4 py-3 ${
            notification.type === 'success'
              ? 'border-green-200 bg-green-50'
              : notification.type === 'error'
              ? 'border-red-200 bg-red-50'
              : 'border-amber-200 bg-amber-50'
          }`}
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : notification.type === 'error' ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            )}
            <p
              className={`text-sm ${
                notification.type === 'success'
                  ? 'text-green-700'
                  : notification.type === 'error'
                  ? 'text-red-700'
                  : 'text-amber-700'
              }`}
            >
              {notification.message}
            </p>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Current Plan & Upgrade */}
          <div className="space-y-6 lg:col-span-2">
            <CurrentPlanCard
              plan={plan}
              subscription={subscription}
              isCanceling={isCanceling}
              daysUntilRenewal={daysUntilRenewal}
              onManageBilling={handleManageBilling}
              onReactivate={reactivateSubscription}
              isLoading={isLoading}
            />

            <UpgradeOptions
              currentPlanId={plan.id}
              onUpgrade={createCheckoutSession}
            />
          </div>

          {/* Right Column - Payment & History */}
          <div className="space-y-6">
            <PaymentMethodCard
              paymentMethods={paymentMethods}
              onManageBilling={handleManageBilling}
            />

            <BillingHistory
              invoices={invoices}
              onManageBilling={handleManageBilling}
            />

            {/* Cancel Subscription */}
            {subscription && !isCanceling && (
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="text-sm font-medium text-gray-900">Cancel Subscription</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Cancel your subscription at any time. You'll still have access until the end of
                  your billing period.
                </p>
                <button
                  onClick={handleCancelClick}
                  className="mt-4 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Cancel subscription
                </button>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-white p-4">
              <h3 className="font-medium text-gray-900">How do I upgrade my plan?</h3>
              <p className="mt-1 text-sm text-gray-600">
                Select a plan above and complete the checkout process. Your new plan will be
                activated immediately.
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <h3 className="font-medium text-gray-900">What happens when I cancel?</h3>
              <p className="mt-1 text-sm text-gray-600">
                You'll continue to have access to premium features until the end of your current
                billing period.
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <h3 className="font-medium text-gray-900">Can I change my payment method?</h3>
              <p className="mt-1 text-sm text-gray-600">
                Yes, click "Manage Billing" to access the billing portal where you can update your
                payment method.
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <h3 className="font-medium text-gray-900">Are there any refunds?</h3>
              <p className="mt-1 text-sm text-gray-600">
                We offer prorated refunds for annual plans. Monthly plans are non-refundable but you
                keep access until period end.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Cancellation Survey Modal */}
      {user && subscription && (
        <CancellationSurvey
          isOpen={showCancelSurvey}
          onClose={() => setShowCancelSurvey(false)}
          onConfirm={handleCancelConfirm}
          subscriptionId={subscription.stripe_subscription_id}
          userId={user.id}
        />
      )}
    </div>
  )
}
