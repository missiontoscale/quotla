'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type ModalType = 'customer' | 'vendor' | 'expense' | 'product' | 'invoice'

interface ModalState {
  type: ModalType | null
  isOpen: boolean
  itemId?: string
  mode?: 'create' | 'edit'
}

interface ModalContextType {
  // Current modal state
  modalState: ModalState

  // Open modals
  openInvoiceModal: (itemId?: string, mode?: 'create' | 'edit') => void
  openCustomerModal: (itemId?: string, mode?: 'create' | 'edit') => void
  openVendorModal: (itemId?: string, mode?: 'create' | 'edit') => void
  openExpenseModal: (itemId?: string, mode?: 'create' | 'edit') => void
  openProductModal: (itemId?: string, mode?: 'create' | 'edit') => void

  // Close modal
  closeModal: () => void

  // Success callbacks (to refresh data after operations)
  onSuccess: () => void
  setOnSuccess: (callback: () => void) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    isOpen: false,
  })
  const [successCallback, setSuccessCallback] = useState<() => void>(() => () => {})

  const openInvoiceModal = (itemId?: string, mode: 'create' | 'edit' = 'create') => {
    setModalState({
      type: 'invoice',
      isOpen: true,
      itemId,
      mode,
    })
  }

  const openCustomerModal = (itemId?: string, mode: 'create' | 'edit' = 'create') => {
    setModalState({
      type: 'customer',
      isOpen: true,
      itemId,
      mode,
    })
  }

  const openVendorModal = (itemId?: string, mode: 'create' | 'edit' = 'create') => {
    setModalState({
      type: 'vendor',
      isOpen: true,
      itemId,
      mode,
    })
  }

  const openExpenseModal = (itemId?: string, mode: 'create' | 'edit' = 'create') => {
    setModalState({
      type: 'expense',
      isOpen: true,
      itemId,
      mode,
    })
  }

  const openProductModal = (itemId?: string, mode: 'create' | 'edit' = 'create') => {
    setModalState({
      type: 'product',
      isOpen: true,
      itemId,
      mode,
    })
  }

  const closeModal = () => {
    setModalState({
      type: null,
      isOpen: false,
    })
  }

  const onSuccess = () => {
    successCallback()
  }

  const setOnSuccess = (callback: () => void) => {
    setSuccessCallback(() => callback)
  }

  return (
    <ModalContext.Provider
      value={{
        modalState,
        openInvoiceModal,
        openCustomerModal,
        openVendorModal,
        openExpenseModal,
        openProductModal,
        closeModal,
        onSuccess,
        setOnSuccess,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
