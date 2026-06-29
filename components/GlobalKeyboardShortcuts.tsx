'use client'

import { useModal } from '@/contexts/ModalContext'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'

export function GlobalKeyboardShortcuts() {
  const { openInvoiceModal, openCustomerModal, openProductModal, openExpenseModal } = useModal()

  useKeyboardShortcut([
    {
      key: 'n',
      ctrl: true,
      handler: () => openInvoiceModal(),
    },
    {
      key: 'p',
      ctrl: true,
      handler: () => openProductModal(),
    },
    {
      key: 'e',
      ctrl: true,
      handler: () => openExpenseModal(),
    },
    {
      key: 'c',
      ctrl: true,
      shift: true,
      handler: () => openCustomerModal(),
    },
  ])

  return null
}
