/**
 * Global Modal System
 *
 * Centralized modal management for the entire application.
 * All modals can be triggered from anywhere without prop drilling.
 */

export { GlobalModalManager } from './GlobalModalManager'
export {
  OpenInvoiceButton,
  OpenCustomerButton,
  OpenSupplierButton,
  OpenProductButton,
} from './ModalTriggerButtons'
export { useModal } from '@/contexts/ModalContext'
