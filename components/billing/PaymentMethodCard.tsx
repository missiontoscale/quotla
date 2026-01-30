'use client'

import { CreditCard, ExternalLink } from 'lucide-react'

interface PaymentMethod {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

interface PaymentMethodCardProps {
  paymentMethods: PaymentMethod[]
  onManageBilling: () => void
}

const CARD_ICONS: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
  diners: 'Diners Club',
  jcb: 'JCB',
  unionpay: 'UnionPay',
}

export function PaymentMethodCard({ paymentMethods, onManageBilling }: PaymentMethodCardProps) {
  const defaultMethod = paymentMethods.find((pm) => pm.isDefault) || paymentMethods[0]

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
        </div>
        <button
          onClick={onManageBilling}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Manage
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      {defaultMethod ? (
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-12 w-16 items-center justify-center rounded-md border bg-gray-50">
            <span className="text-xs font-medium text-gray-600">
              {CARD_ICONS[defaultMethod.brand] || defaultMethod.brand}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {CARD_ICONS[defaultMethod.brand] || defaultMethod.brand} ending in{' '}
              {defaultMethod.last4}
            </p>
            <p className="text-sm text-gray-500">
              Expires {defaultMethod.expMonth.toString().padStart(2, '0')}/{defaultMethod.expYear}
            </p>
          </div>
          {defaultMethod.isDefault && (
            <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              Default
            </span>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
          <CreditCard className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No payment method on file</p>
          <button
            onClick={onManageBilling}
            className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Add payment method
          </button>
        </div>
      )}
    </div>
  )
}
