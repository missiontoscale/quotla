'use client'

import { useModal } from '@/contexts/ModalContext'
import { AddInvoiceDialog } from '@/components/invoices/AddInvoiceDialog'
import { AddCustomerDialog } from '@/components/customers/AddCustomerDialog'
import { AddSupplierDialog } from '@/components/suppliers/AddSupplierDialog'
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
      {/* Invoice Modal */}
      <AddInvoiceDialog
        open={modalState.isOpen && modalState.type === 'invoice'}
        onOpenChange={closeModal}
        onSuccess={onSuccess}
        invoiceId={modalState.itemId}
        mode={modalState.mode}
      />

      {/* Customer Modal */}
      <AddCustomerDialog
        open={modalState.isOpen && modalState.type === 'customer'}
        onOpenChange={closeModal}
        onSuccess={onSuccess}
        customerId={modalState.itemId}
        mode={modalState.mode}
      />

      {/* Supplier Modal */}
      <AddSupplierDialog
        open={modalState.isOpen && modalState.type === 'supplier'}
        onOpenChange={closeModal}
        onSuccess={onSuccess}
        supplierId={modalState.itemId}
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
