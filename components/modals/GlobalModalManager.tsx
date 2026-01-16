'use client'

import { useModal } from '@/contexts/ModalContext'
import { AddCustomerDialog } from '@/components/customers/AddCustomerDialog'
import { AddVendorDialog } from '@/components/expenses/AddVendorDialog'
import { AddExpenseDialog } from '@/components/expenses/AddExpenseDialog'
import { AddProductDialog } from '@/components/products/AddProductDialog'

/**
 * GlobalModalManager
 *
 * Centralized component that renders all global modals.
 * Place this once in your root layout to make all modals available throughout the app.
 *
 * Usage:
 * 1. Wrap your app with ModalProvider
 * 2. Include <GlobalModalManager /> in your layout
 * 3. Use the useModal() hook anywhere to open modals
 */
export function GlobalModalManager() {
  const { modalState, closeModal, onSuccess } = useModal()

  return (
    <>
      {/* Customer Modal */}
      <AddCustomerDialog
        open={modalState.isOpen && modalState.type === 'customer'}
        onOpenChange={closeModal}
        onSuccess={onSuccess}
        customerId={modalState.itemId}
        mode={modalState.mode}
      />

      {/* Vendor Modal */}
      <AddVendorDialog
        open={modalState.isOpen && modalState.type === 'vendor'}
        onOpenChange={closeModal}
        onSuccess={onSuccess}
        vendorId={modalState.itemId}
        mode={modalState.mode}
      />

      {/* Expense Modal */}
      <AddExpenseDialog
        open={modalState.isOpen && modalState.type === 'expense'}
        onOpenChange={closeModal}
        onSuccess={onSuccess}
        expenseId={modalState.itemId}
        mode={modalState.mode}
      />

      {/* Product Modal */}
      <AddProductDialog
        open={modalState.isOpen && modalState.type === 'product'}
        onOpenChange={closeModal}
        onSuccess={onSuccess}
        productId={modalState.itemId}
        mode={modalState.mode}
      />
    </>
  )
}
